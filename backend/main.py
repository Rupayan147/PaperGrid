from __future__ import annotations

import csv
import io
import re
import sqlite3
import tempfile
from datetime import datetime, timezone
from pathlib import Path

import fitz
import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "papers.db"
YEAR_PATTERN = re.compile(r"\b(?:199\d|20[0-2]\d|2030)\b")
SENTENCE_PATTERN = re.compile(r"(?<=[.!?])\s+|\n+")

METHOD_PATTERNS = [
    (r"\bFFA-Net\b", "FFA-Net"),
    (r"\bDehazeNet\b", "DehazeNet"),
    (r"\bAOD-Net\b", "AOD-Net"),
    (r"\bDehazeGAN\b", "DehazeGAN"),
    (r"\bGridDehazeNet\b", "GridDehazeNet"),
    (r"\bDCP\b", "DCP"),
    (r"Dark Channel Prior", "Dark Channel Prior"),
    (r"\bCAP\b", "CAP"),
    (r"Color Attenuation Prior", "Color Attenuation Prior"),
    (r"\bMSCNN\b", "MSCNN"),
    (r"\bGCANet\b", "GCANet"),
    (r"\bFAMED-Net\b", "FAMED-Net"),
    (r"\btransformer\b", "transformer"),
    (r"\bCNN\b", "CNN"),
    (r"\bGAN\b", "GAN"),
]

DATASET_PATTERNS = [
    (r"\bRESIDE\b", "RESIDE"),
    (r"\bSOTS\b", "SOTS"),
    (r"\bITS\b", "ITS"),
    (r"\bOTS\b", "OTS"),
    (r"\bO-HAZE\b", "O-HAZE"),
    (r"\bI-HAZE\b", "I-HAZE"),
    (r"\bNH-HAZE\b", "NH-HAZE"),
    (r"\bDense-Haze\b", "Dense-Haze"),
    (r"\bHazeRD\b", "HazeRD"),
    (r"\bD-Hazy\b", "D-Hazy"),
]

METRIC_PATTERNS = [
    (r"\bPSNR\b", "PSNR"),
    (r"\bSSIM\b", "SSIM"),
    (r"\bMSE\b", "MSE"),
    (r"\bMAE\b", "MAE"),
    (r"\bLPIPS\b", "LPIPS"),
    (r"\bCIEDE2000\b", "CIEDE2000"),
]

RESULT_KEYWORDS = [
    "outperforms",
    "achieves",
    "improves",
    "state-of-the-art",
    "better performance",
    "experimental results",
]

LIMITATION_KEYWORDS = [
    "limitation",
    "limitations",
    "fails",
    "challenging",
    "poor",
    "cannot",
    "future work",
    "computational",
]

LIMITATION_SOURCE_VALUES = {"explicit", "inferred", "manual", "related_papers"}

EXPORT_COLUMNS = [
    "id",
    "title",
    "year",
    "authors",
    "method",
    "dataset",
    "metrics",
    "result",
    "limitation",
    "limitation_source",
    "pdf_text",
    "created_at",
]


class PaperUpdate(BaseModel):
    title: str | None = None
    year: str | None = None
    authors: str | None = None
    method: str | None = None
    dataset: str | None = None
    metrics: str | None = None
    result: str | None = None
    limitation: str | None = None
    limitation_source: str | None = None
    pdf_text: str | None = None


app = FastAPI(title="PaperGrid API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with get_db_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS papers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                year TEXT,
                authors TEXT,
                method TEXT,
                dataset TEXT,
                metrics TEXT,
                result TEXT,
                limitation TEXT,
                pdf_text TEXT,
                created_at TEXT
            )
            """
        )

        columns = {row[1] for row in connection.execute("PRAGMA table_info(papers)").fetchall()}
        if "limitation_source" not in columns:
            connection.execute("ALTER TABLE papers ADD COLUMN limitation_source TEXT")
            connection.execute(
                """
                UPDATE papers
                SET limitation_source = CASE
                    WHEN limitation IS NOT NULL AND TRIM(limitation) != '' THEN 'explicit'
                    ELSE 'inferred'
                END
                WHERE limitation_source IS NULL OR TRIM(limitation_source) = ''
                """
            )

        connection.execute(
            """
            UPDATE papers
            SET limitation_source = CASE
                WHEN limitation_source IS NULL OR TRIM(limitation_source) = '' THEN
                    CASE
                        WHEN limitation IS NOT NULL AND TRIM(limitation) != '' THEN 'explicit'
                        ELSE 'inferred'
                    END
                ELSE limitation_source
            END
            WHERE limitation_source IS NULL OR TRIM(limitation_source) = ''
            """
        )
        connection.commit()


def row_to_paper(row: sqlite3.Row | None) -> dict[str, str | int]:
    if row is None:
        raise HTTPException(status_code=404, detail="Paper not found.")
    return {column: row[column] for column in row.keys()}


def fetch_all_papers() -> list[dict[str, str | int]]:
    with get_db_connection() as connection:
        rows = connection.execute(
            f"SELECT {', '.join(EXPORT_COLUMNS)} FROM papers ORDER BY id DESC"
        ).fetchall()
    return [row_to_paper(row) for row in rows]


def extract_pdf_text(pdf_path: Path) -> tuple[str, str]:
    try:
        with fitz.open(pdf_path) as document:
            if document.page_count == 0:
                raise ValueError("The uploaded PDF has no pages.")

            page_texts: list[str] = []
            for page in document:
                text = page.get_text("text").strip()
                if text:
                    page_texts.append(text)

            if not page_texts:
                raise ValueError("No text could be extracted from the PDF.")

            return page_texts[0], "\n\n".join(page_texts)
    except ValueError:
        raise
    except Exception as exc:  # noqa: BLE001
        raise ValueError("Failed to extract text from the PDF.") from exc


def guess_metadata(first_page_text: str) -> dict[str, str]:
    lines = [line.strip() for line in first_page_text.splitlines() if line.strip()]
    title = lines[0] if lines else ""
    authors = lines[1] if len(lines) > 1 else (lines[2] if len(lines) > 2 else "")
    year_match = YEAR_PATTERN.search(first_page_text)
    year = year_match.group(0) if year_match else ""

    # Simple heuristics live here for the MVP; richer AI extraction can replace this later.
    return {
        "title": title,
        "year": year,
        "authors": authors,
    }


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def split_sentences(text: str) -> list[str]:
    cleaned_text = normalize_text(text.replace("\r", "\n"))
    if not cleaned_text:
        return []
    parts = [part.strip() for part in SENTENCE_PATTERN.split(cleaned_text) if part.strip()]
    return [part for part in parts if len(part) > 20]


def extract_terms(text: str, patterns: list[tuple[str, str]]) -> str:
    detected_terms: list[str] = []
    for pattern, label in patterns:
        if re.search(pattern, text, flags=re.IGNORECASE):
            detected_terms.append(label)
    return ", ".join(detected_terms)


def extract_method(text: str) -> str:
    return extract_terms(text, METHOD_PATTERNS)


def extract_dataset(text: str) -> str:
    return extract_terms(text, DATASET_PATTERNS)


def extract_metrics(text: str) -> str:
    return extract_terms(text, METRIC_PATTERNS)


def extract_result(text: str) -> str:
    return extract_sentences(text, RESULT_KEYWORDS)


def extract_sentences(text: str, keywords: list[str], limit: int = 2) -> str:
    matched_sentences: list[str] = []

    for sentence in split_sentences(text):
        sentence_lower = sentence.lower()
        if any(keyword in sentence_lower for keyword in keywords):
            cleaned_sentence = normalize_text(sentence)
            if cleaned_sentence not in matched_sentences:
                matched_sentences.append(cleaned_sentence)
        if len(matched_sentences) >= limit:
            break

    if matched_sentences:
        return " ".join(matched_sentences[:limit])

    lower_text = text.lower()
    if any(keyword in lower_text for keyword in keywords):
        fallback_sentences = split_sentences(text)[:limit]
        if fallback_sentences:
            return " ".join(normalize_text(sentence) for sentence in fallback_sentences)
        return normalize_text(text)

    return ""


def infer_limitation(text: str) -> str:
    method = extract_method(text).lower()
    dataset = extract_dataset(text).lower()
    metrics = extract_metrics(text).lower()
    result = extract_result(text).lower()

    inferred_points: list[str] = []

    if any(dataset_name in dataset for dataset_name in ("reside", "sots", "its", "ots")):
        inferred_points.append(
            "evaluation is likely dominated by benchmark or synthetic datasets, so real-world generalization may be limited"
        )

    if any(dataset_name in dataset for dataset_name in ("o-haze", "i-haze", "nh-haze", "dense-haze", "hazerd", "d-hazy")):
        inferred_points.append(
            "dataset coverage appears limited to a small set of hazy scenes, which may reduce robustness across unseen conditions"
        )

    if any(metric_name in metrics for metric_name in ("psnr", "ssim", "mse", "mae")) and "lpips" not in metrics:
        inferred_points.append(
            "evaluation emphasizes pixel-level metrics, which may miss perceptual quality or downstream task performance"
        )

    if "lpips" in metrics and ("psnr" not in metrics and "ssim" not in metrics):
        inferred_points.append(
            "evaluation appears perceptual-focused, so direct low-level restoration gains may be less explicit"
        )

    if any(method_name in method for method_name in ("gan", "transformer")):
        inferred_points.append("the model family may introduce higher computational cost or training complexity")

    if any(keyword in result for keyword in ("outperforms", "achieves", "improves")):
        inferred_points.append(
            "reported gains may be concentrated on specific benchmark settings rather than broad deployment cases"
        )

    if not inferred_points:
        inferred_points.append(
            "the paper likely relies on benchmark evaluation and may not clearly discuss deployment constraints or generalization limits"
        )

    inferred_text = inferred_points[0]
    if len(inferred_points) > 1:
        inferred_text = f"{inferred_points[0]}; {inferred_points[1]}"

    # Semantic Scholar and related-paper analysis can be integrated here later.
    # That later path can aggregate limitations from cited papers and nearby literature summaries.
    return f"Inferred limitation: {normalize_text(inferred_text)}"


def extract_limitation_with_source(full_text: str, method: str, dataset: str, metrics: str, result: str) -> tuple[str, str]:
    explicit_limitation = extract_sentences(full_text, LIMITATION_KEYWORDS)
    if explicit_limitation:
        return explicit_limitation, "explicit"

    inferred_limitation = infer_limitation(f"{full_text}\n{method}\n{dataset}\n{metrics}\n{result}")
    return inferred_limitation, "inferred"


def normalize_value(value: str | None) -> str:
    return value.strip() if isinstance(value, str) else ""


def normalize_limitation_source(value: str | None) -> str:
    normalized = normalize_value(value).lower()
    return normalized if normalized in LIMITATION_SOURCE_VALUES else ""


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/")
def healthcheck() -> dict[str, str]:
    return {"message": "PaperGrid API is running."}


@app.post("/upload")
async def upload_paper(file: UploadFile = File(...)) -> dict[str, str | int]:
    filename = file.filename or ""
    if not filename.lower().endswith(".pdf") and file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    temp_path: Path | None = None
    try:
        contents = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            temp_file.write(contents)
            temp_path = Path(temp_file.name)

        first_page_text, full_text = extract_pdf_text(temp_path)
        guessed_fields = guess_metadata(first_page_text)
        method = extract_method(full_text)
        dataset = extract_dataset(full_text)
        metrics = extract_metrics(full_text)
        result = extract_result(full_text)
        limitation, limitation_source = extract_limitation_with_source(full_text, method, dataset, metrics, result)
        created_at = datetime.now(timezone.utc).isoformat()

        with get_db_connection() as connection:
            cursor = connection.execute(
                """
                INSERT INTO papers (
                    title, year, authors, method, dataset, metrics, result, limitation, limitation_source, pdf_text, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    guessed_fields["title"],
                    guessed_fields["year"],
                    guessed_fields["authors"],
                    method,
                    dataset,
                    metrics,
                    result,
                    limitation,
                    limitation_source,
                    full_text,
                    created_at,
                ),
            )
            connection.commit()
            paper_id = cursor.lastrowid

            row = connection.execute(
                f"SELECT {', '.join(EXPORT_COLUMNS)} FROM papers WHERE id = ?",
                (paper_id,),
            ).fetchone()

        return row_to_paper(row)
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail="Failed to process the uploaded PDF.") from exc
    finally:
        await file.close()
        if temp_path and temp_path.exists():
            temp_path.unlink(missing_ok=True)


@app.get("/papers")
def list_papers() -> list[dict[str, str | int]]:
    return fetch_all_papers()


@app.get("/papers/{paper_id}")
def get_paper(paper_id: int) -> dict[str, str | int]:
    with get_db_connection() as connection:
        row = connection.execute(
            f"SELECT {', '.join(EXPORT_COLUMNS)} FROM papers WHERE id = ?",
            (paper_id,),
        ).fetchone()
    return row_to_paper(row)


@app.put("/papers/{paper_id}")
def update_paper(paper_id: int, payload: PaperUpdate) -> dict[str, str | int]:
    updates = {key: normalize_value(value) for key, value in payload.model_dump(exclude_unset=True).items()}
    if not updates:
        return get_paper(paper_id)

    if "limitation" in updates and "limitation_source" not in updates:
        updates["limitation_source"] = "manual" if updates["limitation"].strip() else "inferred"

    if "limitation_source" in updates:
        normalized_source = normalize_limitation_source(updates["limitation_source"])
        if normalized_source:
            updates["limitation_source"] = normalized_source
        else:
            updates.pop("limitation_source")

    with get_db_connection() as connection:
        existing = connection.execute("SELECT id FROM papers WHERE id = ?", (paper_id,)).fetchone()
        if existing is None:
            raise HTTPException(status_code=404, detail="Paper not found.")

        columns = ", ".join(f"{column} = ?" for column in updates)
        connection.execute(
            f"UPDATE papers SET {columns} WHERE id = ?",
            (*updates.values(), paper_id),
        )
        connection.commit()

        row = connection.execute(
            f"SELECT {', '.join(EXPORT_COLUMNS)} FROM papers WHERE id = ?",
            (paper_id,),
        ).fetchone()

    return row_to_paper(row)


@app.delete("/papers/{paper_id}")
def delete_paper(paper_id: int) -> dict[str, str]:
    with get_db_connection() as connection:
        cursor = connection.execute("DELETE FROM papers WHERE id = ?", (paper_id,))
        connection.commit()

    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Paper not found.")

    return {"message": "Paper deleted successfully."}


@app.get("/export/csv")
def export_csv() -> Response:
    papers = fetch_all_papers()
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=EXPORT_COLUMNS)
    writer.writeheader()
    writer.writerows(papers)

    return Response(
        content=buffer.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="papergrid_papers.csv"'},
    )


@app.get("/export/excel")
def export_excel() -> StreamingResponse:
    papers = fetch_all_papers()
    data_frame = pd.DataFrame(papers, columns=EXPORT_COLUMNS)
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        data_frame.to_excel(writer, index=False, sheet_name="Papers")
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="papergrid_papers.xlsx"'},
    )

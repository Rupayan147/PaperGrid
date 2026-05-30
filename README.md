\# PaperGrid — Research Paper Mapper



PaperGrid is a full-stack research productivity tool that converts research paper PDFs into structured literature survey tables.



It helps students, researchers, and academic interns upload papers, extract key metadata, analyze limitations, and export clean survey tables for reports, literature reviews, and research documentation.



\---



\## 🚀 Features



\- Upload research paper PDFs

\- Extract paper text using PyMuPDF

\- Auto-detect:

&#x20; - Title

&#x20; - Year

&#x20; - Authors

&#x20; - Method

&#x20; - Dataset

&#x20; - Metrics

&#x20; - Result

&#x20; - Limitation

\- Limitation Intelligence:

&#x20; - Explicit limitation detection

&#x20; - Inferred limitation fallback

&#x20; - Limitation source badge

\- Store papers in SQLite database

\- View all papers in a structured literature survey table

\- Search papers by title, year, method, dataset, or metrics

\- Edit extracted paper details manually

\- Delete papers

\- Open detailed paper drawer

\- Export survey table as CSV

\- Export survey table as Excel

\- Premium dashboard UI built with React and Tailwind CSS



\---



\## 🧠 Why This Project?



Literature survey work is repetitive and time-consuming.  

Researchers often need to read multiple papers and manually prepare tables containing methods, datasets, metrics, results, and limitations.



PaperGrid simplifies this workflow by turning PDFs into structured research data.



\---



\## 🛠️ Tech Stack



\### Frontend

\- React

\- Vite

\- Tailwind CSS

\- Axios

\- Lucide React



\### Backend

\- FastAPI

\- Python

\- PyMuPDF

\- SQLite

\- Pandas

\- OpenPyXL



\---



\## 📁 Project Structure



```text

PaperGrid/

├── backend/

│   ├── main.py

│   └── papers.db

│

├── frontend/

│   ├── src/

│   │   ├── components/

│   │   │   ├── EditPaperModal.jsx

│   │   │   ├── HeroSection.jsx

│   │   │   ├── PaperDetailDrawer.jsx

│   │   │   ├── PaperTable.jsx

│   │   │   ├── StatsCards.jsx

│   │   │   ├── Toast.jsx

│   │   │   ├── TopNav.jsx

│   │   │   └── UploadPaper.jsx

│   │   ├── App.jsx

│   │   ├── index.css

│   │   └── main.jsx

│   │

│   ├── package.json

│   └── vite.config.js

│

└── README.md

```



\---



\## ⚙️ Setup Instructions



\### 1. Clone the Repository



```bash

git clone https://github.com/Rupayan147/PaperGrid.git

cd PaperGrid

```



\---



\## Backend Setup



```bash

cd backend

python -m venv venv

```



\### Activate Virtual Environment



\#### Windows PowerShell



```bash

.\\venv\\Scripts\\Activate.ps1

```



\#### Windows CMD



```bash

venv\\Scripts\\activate

```



\---



\### Install Backend Dependencies



```bash

pip install fastapi uvicorn pymupdf pandas openpyxl python-multipart

```



\---



\### Run Backend Server



```bash

uvicorn main:app --reload

```



Backend will run on:



```text

http://localhost:8000

```



\---



\## Frontend Setup



Open a new terminal:



```bash

cd frontend

npm install

npm run dev

```



Frontend will run on:



```text

http://localhost:5173

```



\---



\## 🔌 API Routes



| Method | Endpoint | Description |

|---|---|---|

| POST | `/upload` | Upload PDF and extract paper data |

| GET | `/papers` | Get all saved papers |

| GET | `/papers/{paper\_id}` | Get single paper |

| PUT | `/papers/{paper\_id}` | Update paper details |

| DELETE | `/papers/{paper\_id}` | Delete paper |

| GET | `/export/csv` | Export papers as CSV |

| GET | `/export/excel` | Export papers as Excel |



\---



\## 📊 Extracted Paper Fields



| Field | Description |

|---|---|

| Title | Paper title |

| Year | Publication year |

| Authors | Author names |

| Method | Proposed method/model |

| Dataset | Dataset used |

| Metrics | Evaluation metrics |

| Result | Main result summary |

| Limitation | Explicit or inferred limitation |

| Limitation Source | Explicit / Inferred / Manual / Related Papers |



\---



\## 🖥️ UI Preview



Add screenshots here:



```text

frontend/src/assets/hero.png

```



Recommended GitHub README screenshot format:



```markdown

!\[PaperGrid Dashboard](frontend/src/assets/hero.png)

```



\---



\## 🧩 Current Extraction Logic



PaperGrid currently uses rule-based extraction:



\- Title from the first meaningful PDF lines

\- Year using regex-based detection

\- Methods from known research keywords

\- Datasets from common dataset names

\- Metrics from terms like PSNR, SSIM, MSE, LPIPS

\- Results from performance-related sentences

\- Limitations from explicit limitation keywords

\- If no limitation is found, it creates an inferred limitation



\---



\## 🔮 Future Improvements



\- AI-powered extraction using Gemini/OpenAI

\- Semantic Scholar API integration

\- Cross-paper limitation analysis

\- Citation graph mapping

\- Paper comparison view

\- Auto-generated literature survey summary

\- PDF annotation support

\- Authentication and cloud database

\- Export to DOCX/PDF

\- Research topic clustering

\- Duplicate paper detection



\---



\## 🎯 Use Cases



\- Literature survey preparation

\- Research internship documentation

\- Academic project reports

\- ML/computer vision paper comparison

\- Thesis and review paper planning

\- Dataset and metric tracking



\---



\## 👨‍💻 Author



\*\*Rupayan Biswas\*\*



GitHub: \[@Rupayan147](https://github.com/Rupayan147)



\---



\## ⭐ Project Status



PaperGrid is currently an MVP.  

Core PDF upload, metadata extraction, database storage, survey table, editing, search, and export features are working.



\---



\## 📌 License



This project is open-source and available for learning, research, and portfolio use.


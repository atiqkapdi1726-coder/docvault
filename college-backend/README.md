# DocVault College Backend (Flask + ML + MongoDB)

Cloud-based Document Management System - college-project compliant backend.

## Tech Stack (per college requirements)
- **Backend:** Python 3.12 + Flask
- **AI/ML:** scikit-learn (TF-IDF + LogisticRegression) + TensorFlow/Keras (Dense Neural Network)
- **Database:** MongoDB (Atlas free M0) with in-memory fallback
- **Frontend:** React + Bootstrap 5 (in main app)
- **Visualization:** Power BI / Tableau (CSV export endpoint)

## Quick Start

```bash
# 1. Use the Python 3.12 environment installed at C:\Python312-embed
#    (TensorFlow does not support Python 3.14 yet)

# 2. Install dependencies (already done on this machine)
C:\Python312-embed\python.exe -m pip install -r requirements.txt

# 3. (Optional) Configure MongoDB Atlas - create a free M0 cluster at
#    https://www.mongodb.com/cloud/atlas, then:
set MONGODB_URI=mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/

#    Without MONGODB_URI the API runs with an in-memory fallback (fine for demos).

# 4. Start the server
cd college-backend
C:\Python312-embed\python.exe app.py
#    -> http://localhost:5000
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET  | `/api/health` | Service + storage health check |
| POST | `/api/ml/train` | Train sklearn + TensorFlow models |
| POST | `/api/ml/classify` | `{"text": "...", "model": "auto\|tensorflow\|sklearn"}` → category |
| GET  | `/api/ml/info` | Model metadata |
| POST | `/api/documents` | Store doc record (auto ML-classified) |
| GET  | `/api/documents` | List documents |
| GET  | `/api/analytics` | Counters + predictions by category/model |
| GET  | `/api/analytics/export.csv` | **Power BI / Tableau CSV export** |

## Project Structure
```
college-backend/
  app.py                  # Flask REST API
  requirements.txt
  ml/
    classifier.py         # training + inference (sklearn + TensorFlow)
    models/               # saved models (auto-generated)
  database/
    repository.py        # MongoDB layer (in-memory fallback)
```

## Power BI Dashboard
1. Start this Flask server
2. Open Power BI Desktop → Get Data → Web
3. URL: `http://localhost:5000/api/analytics/export.csv`
4. Build visuals: predictions by category (bar), confidence (histogram), model usage (donut)

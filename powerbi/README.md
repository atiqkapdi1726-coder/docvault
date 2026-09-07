# DocVault Power BI Dashboard (Pre-Built)

This is a complete, pre-built Power BI project. Open it and the dashboard
(8 visuals, formatted, blue theme) appears immediately — no manual building.

## Open it (2 steps)

1. Open **Power BI Desktop**
2. File → Open report → This PC → select **`powerbi\DocVault.pbip`**

> Requires the PBIP preview feature enabled (one time):
> File → Options and settings → Options → **Preview features** →
> check **"Power BI Project (.pbip) save option"**
> (and if prompted on open, also enable **"Store semantic model using TMDL format"**)

## What's inside

**Page: "Document Intelligence Dashboard"** (1280×720, light background)

| Visual | Data |
|---|---|
| Card — Total Documents | Count of documents |
| Card — Average ML Confidence | Avg confidence (%) |
| Card — Total Storage Used | Sum of file sizes |
| Bar — Documents by AI-Predicted Category | ML categories, blue, data labels |
| Column — Model Confidence Distribution | Confidence histogram, green |
| Donut — Documents by File Type | MIME types |
| Donut — ML Model Utilization | TensorFlow vs scikit-learn usage |
| Bar — System Usage by User | Predictions per user, purple |
| Slicer — Filter by Category | Interactive page filter |
| Title text box | Project + tech stack branding |

## Data

Loaded from the ML pipeline CSVs:
- `college-backend\powerbi_documents.csv`
- `college-backend\powerbi_predictions.csv`

(Absolute paths are embedded in the semantic model — keep the docvault folder
where it is, or edit the two paths in
`DocVault.SemanticModel\definition\database.tmdl`)

## Refresh with new data

1. Classify more documents in the web app (or re-run `seed_data.py`)
2. Re-download the CSVs:
   - `http://localhost:5000/api/analytics/documents.csv`
   - `http://localhost:5000/api/analytics/predictions.csv`
   (overwrite the files in college-backend\)
3. In Power BI: **Home → Refresh**

## Screenshots for the report

- The full dashboard page (Win+Shift+S)
- Mongo data in Atlas → Browse Collections
- ML Lab page in the web app

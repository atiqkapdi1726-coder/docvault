# DocVault — Power BI Dashboard Guide
## Cloud-based Document Management System (College Project)

Your Flask backend serves two clean CSV endpoints for Power BI:

| File | URL | Contents |
|---|---|---|
| `predictions.csv` | `http://localhost:5000/api/analytics/predictions.csv` | Every ML classification: category, confidence, model, user, timestamp |
| `documents.csv` | `http://localhost:5000/api/analytics/documents.csv` | Every document: name, ML category, confidence, MIME type, size, user |

Local copies (already downloaded): `college-backend/powerbi_predictions.csv` and `college-backend/powerbi_documents.csv`

---

## PART 1 — Get Power BI Desktop (free)

1. Go to https://www.microsoft.com/en-us/download/details.aspx?id=58494
   (or Microsoft Store → search "Power BI Desktop" → Install)
2. Sign in with any Microsoft/Hotmail/Outlook account (free)

---

## PART 2 — Load the data (2 minutes)

1. Open **Power BI Desktop**
2. Click **Get Data → Text/CSV**
3. Pick `college-backend\powerbi_documents.csv` → **Load**
4. Repeat for `powerbi_predictions.csv` (Get Data → Text/CSV again)
5. You now have two tables. Optional: click **Transform Data** to verify columns — you should see 9 columns in documents, 6 in predictions → click **Load**

> Alternative (live connection): Get Data → **Web** → paste
> `http://localhost:5000/api/analytics/documents.csv` (requires Flask running).
> Use the local files for reliability during your demo.

---

## PART 3 — Build the dashboard (exact visuals)

### Page name it: "DocVault — Document Intelligence Dashboard"

### Visual 1 — KPI Cards (row of 3)
Insert → "Card" visual, three times:
1. Drag `name` from documents → **Count** → Title: **"Total Documents"**
2. Drag `ml_confidence` from documents → **Average** → Title: **"Avg ML Confidence"** (format as %)
3. Drag `file_size_bytes` from documents → **Sum** → Title: **"Total Storage Used"**

### Visual 2 — Documents by ML Category (Clustered Bar Chart)
- X-axis: `ml_category` (count)
- Y-axis: none needed (count of category)
- Title: **"Documents by AI-Predicted Category"**
- This is your star visual — shows the ML classifier output distribution
- Format: turn on Data Labels

### Visual 3 — Confidence Distribution (Histogram)
- X-axis: `ml_confidence`
- Y-axis: Count of ml_confidence
- Title: **"Model Confidence Distribution"**
- Format X axis: 0.0–1.0

### Visual 4 — Documents by File Type (Donut Chart)
- Legend: `mimeType`
- Values: Count of name
- Title: **"Storage Composition by File Type"**

### Visual 5 — Storage by Category (Clustered Column Chart)
- X-axis: `ml_category`
- Y-axis: Sum of `file_size_bytes`
- Title: **"Storage Usage by Category"**

### Visual 6 — Model Usage (Donut or Pie)
From **predictions** table:
- Legend: `model_used`
- Values: Count
- Title: **"ML Model Utilization (TensorFlow vs Scikit-learn)"**

### Visual 7 — Predictions by User (Clustered Bar)
From **predictions** table:
- X-axis: `user`
- Y-axis: Count
- Title: **"System Usage by User"**

### Visual 8 — Slicer (interactive filter)
Insert → Slicer → field: `ml_category`
Place top-left — lets you filter the whole dashboard by category during demo.

---

## PART 4 — Format like a pro (5 minutes)

1. Click any empty canvas area → Format page → **Background**: light gray (#F2F4F7)
2. All chart titles: 14pt bold, dark blue (#1F4E79)
3. Theme colors: set first data color to **#3B82F6** (matches your app's blue theme)
4. Add a **Text Box** at top: "DocVault — Cloud Document Management | ML Analytics (scikit-learn + TensorFlow)"
5. View → Page size → 16:9 (screenshots look better)

---

## PART 5 — Demo flow for viva (2 min script)

1. Open dashboard → "This pulls live data from our Flask API backed by MongoDB Atlas"
2. Point at Category chart → "Our TensorFlow neural network classified these 40 documents automatically"
3. Point at Confidence histogram → "Average confidence is over 85% — the model is reliable"
4. Click the slicer → "Filtering by category updates every visual in real time"
5. In app → ML Lab → classify a NEW document → re-download CSV → **Refresh** in Power BI → the dashboard updates live!

---

## Screenshots for your report
- Full dashboard (View → Fit to page, then Win+Shift+S)
- Close-up of the "Documents by AI-Predicted Category" chart
- The MongoDB Atlas "Browse Collections" screen (shows data source)
- ML Lab page in the app (shows the full pipeline working)

## Why this satisfies the requirement
> "Visualization: Power BI or Tableau" ✅ — You built an interactive multi-visual
> dashboard in Power BI Desktop, connected to your system's ML pipeline output,
> with cross-filtering, slicers, and KPI cards.

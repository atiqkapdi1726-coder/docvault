# Power BI — ULTRA BEGINNER Walkthrough (every single click)

If you have never used Power BI before, follow this exactly. Do not skip anything.

---

## STEP 0: Open Power BI Desktop

- Open Power BI Desktop from the Start menu
- First-launch windows may appear:
  - "Sign in" → you can click **Skip for now** OR sign in with a Microsoft account (free)
  - A "Get started" welcome screen → click the **X** to close it
- You should now see a big BLANK white canvas.

**Look at the RIGHT side of the screen.** You will see two stacked panels:
1. **"Visualizations"** (top right) — this is where you pick chart types
2. **"Filters"** and **"Fields"** (below it) — this is where your data columns appear AFTER you load them. Right now it says "No data yet" or is empty. That is normal.

---

## STEP 1: Load the FIRST file (documents)

1. Look at the **TOP LEFT of the screen** — the Home ribbon. Find the button that says **"Get data"** (it has a small yellow down-arrow icon, first button in the ribbon)
2. Click **"Get data"** → a dropdown appears
3. Click the **top item: "Text/CSV"** (it has a notepad icon)
4. A file picker window opens
5. Navigate to:
   `C:\Users\ATIQUE KAPDI\OneDrive\Documents\Default Project\docvault\college-backend`
6. Select the file **powerbi_documents.csv** → click **Open**
7. A PREVIEW window appears showing the data in a table (you'll see columns: id, name, ml_category, ml_confidence...) → click the **Load** button at the bottom right
8. Look at the RIGHT panel now — under "Fields" you should see a list that says **"powerbi_documents"** with column names under it. If you see this, it worked!

## STEP 2: Load the SECOND file (predictions)

Repeat EXACTLY the same as Step 1, but pick:
- **powerbi_predictions.csv** → Open → **Load**

Now the Fields panel on the right shows BOTH:
- powerbi_documents
- powerbi_predictions

---

## STEP 3: Build Visual 1 — "Total Documents" KPI card

1. Click on the **EMPTY WHITE CANVAS** somewhere in the top-left area (this places the next visual there)
2. Look at the **Visualizations panel (top right)**. It shows a grid of small icons (chart types). **Hover your mouse over them** — a tooltip appears for each.
3. Find the icon with the tooltip **"Card"** (it looks like a small box with the number 123 in it) — it's in the top row, 4th icon
4. **Click the Card icon** → an empty card appears on the canvas
5. Now look at the **Fields panel (bottom right)** → find **powerbi_documents**
6. Click the **little arrow** next to powerbi_documents to expand it if it's collapsed
7. **Find the column named "name"** — click it ONCE to put a CHECKMARK in its checkbox
8. **What just happened:** The Visualizations panel now shows a "Fields" box with "name" in it. The card on the canvas shows a number like 40 (or a weird field name).
9. **IMPORTANT:** In the Visualizations panel, click the little **dropdown arrow** next to where it says "name" → change it from "First" or "name" to **"Count"** → the card now shows a big number = your total documents
10. **Add a title:** With the card still selected, look at the Visualizations panel → click the **paintbrush icon** (Format) → expand **"Title"** → in the "Title text" box type: **Total Documents**

✅ Done! You built your first KPI card.

## STEP 4: Two more KPI cards — repeat 3 times more

Click on empty canvas space to the RIGHT of your first card, then:

**Card 2 — Average Confidence:**
1. Click Card icon (same one as before)
2. Check the field **ml_confidence** (under powerbi_documents)
3. In the Fields box, click dropdown next to ml_confidence → **Average**
4. Format → Title → **Avg ML Confidence**
5. Extra: Format → find "Callout values" → set decimal places to 1 (it's a 0-1 confidence, or Format as Percentage if shown)

**Card 3 — Total Storage:**
1. Click Card icon again (place to the right)
2. Check the field **file_size_bytes**
3. Dropdown → **Sum**
4. Title: **Storage Used**

You now have 3 KPI cards in a row across the top. 🎉

---

## STEP 5: Star visual — "Documents by ML Category" bar chart

1. Click on the canvas BELOW your KPI cards (left side)
2. In the Visualizations panel, hover over icons and find **"Clustered bar chart"** (horizontal bars icon, 2nd row usually) — click it
3. An empty chart appears with placeholder info
4. In the Fields panel → click checkbox for **ml_category**
5. ml_category automatically lands in the "X-axis" box of the chart
6. ALSO drag **name** into the "X-axis" area? NO — simpler: Power BI auto-counts. If the chart shows each category ONCE (all bars = 1), then:
   - Find the "X-axis" field well in the Visualizations panel
   - Click the dropdown on the field → choose **"Count"**
7. You should now see horizontal bars: invoice, resume, contract, etc. with different lengths
8. Format → Title: **"Documents by AI-Predicted Category"**
9. Format → expand **"Data labels"** → toggle ON (numbers show on bars)

## STEP 6: Confidence histogram

1. Click empty canvas (middle area)
2. Visualizations → find **"Histogram"** — it's in the SECOND GROUP of icons (you may need to click the **"..." or "...more"** dots at the bottom of the icon list if you don't see it) — tooltip says "Histogram"
   - If you can't find Histogram at all: use **"Clustered column chart"** instead (vertical bars) — X-axis: ml_confidence, Y-axis: Count of ml_confidence. Set X-axis type to "Continuous" in Format → X axis
3. Check the field: **ml_confidence**
4. Title: **"Model Confidence Distribution"**

## STEP 7: File-type donut

1. Click empty canvas (right side, below KPI cards)
2. Visualizations → **"Donut chart"** icon (circle with hole, tooltip "Donut chart")
3. Check fields: **mimeType** AND **name**
4. If the values show as "First name" — in the "Values" well, change name to **Count**
5. Title: **"Storage Composition by File Type"**

## STEP 8: Model usage donut (TensorFlow vs scikit-learn)

1. Click empty canvas
2. Donut chart icon again
3. THIS TIME: expand **powerbi_predictions** (the OTHER table!)
4. Check: **model_used** → legend shows "TensorFlow/Keras Neural Network"
5. Add **id** to Values → dropdown → Count (or check id, it counts automatically)
6. Title: **"ML Model Utilization"**

## STEP 9: User activity bars

1. Click empty canvas (bottom left)
2. Clustered bar chart icon
3. From **powerbi_predictions**: check **user** and **id** (id → Count)
4. Title: **"System Usage by User"**

## STEP 10: The Slicer (interactive filter)

1. Click empty canvas at the TOP LEFT (or squeeze it somewhere)
2. Visualizations → **"Slicer"** icon (looks like a funnel ▽, tooltip "Slicer")
3. Check: **ml_category** (from powerbi_documents)
4. A dropdown list of all categories appears on the canvas
5. Format → Slicer settings → "Style" → change to **"Tile"** (looks nicer, shows checkboxes)
6. Resize it small (drag corners) — maybe 2 inches wide

## STEP 11: Make it pretty (2 min)

1. Click somewhere on the BLANK canvas (not on any visual)
2. On the ribbon: **View** tab → **Themes** dropdown → pick **"Innovate"** or any blue theme
3. Click each visual → Visualizations → paintbrush → adjust colors
4. Insert ribbon → **Text Box** → type at the very top:
   `DocVault — Cloud Document Management | ML Analytics (scikit-learn + TensorFlow)`
5. Make it bold, 18pt, blue
6. **View** ribbon → **Page view → Fit to page** (so everything fits on screen)

## STEP 12: Save + Screenshot

- Ctrl+S → save as **DocVault_Dashboard.pbix**
- **Win + Shift + S** → drag over the whole dashboard → paste into your report

---

## TROUBLESHOOTING

| Problem | Fix |
|---|---|
| "Get data" not visible | You're in a different ribbon tab — click **Home** tab at top |
| Numbers show as "First"/"Don't summarize" | Click dropdown on the field in the Values/X-axis WELL (not the Fields list) → choose Count/Sum/Average |
| Can't find Histogram | Click the "..." (three dots) at the bottom of the Visualizations icon grid → it's under additional charts |
| Card shows text instead of number | The field is a text column — use Count aggregation |
| Visuals overlap | Drag them by their title bar; resize via corner handles |
| No data in fields panel | File didn't load — do Step 1 again, watch for errors |
| Confidence shows 0.9162 | That's fine — it's 91.62%. Format → Callout → % if you want |

## THE LOGIC (remember this for viva)

In Power BI, building ANY visual is always the same 3 moves:
1. **Click canvas** (where you want it)
2. **Click chart icon** (which type)
3. **Check fields** (which data) + set the **aggregation** (Count/Sum/Average)

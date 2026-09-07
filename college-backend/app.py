"""
DocVault - Cloud-based Document Management System
Flask REST API (College Project Backend)

Endpoints:
  GET  /api/health              - service + storage health
  POST /api/ml/train            - train the ML models (sklearn + TensorFlow)
  POST /api/ml/classify         - classify document text into a category
  GET  /api/ml/info             - model metadata
  POST /api/documents           - store a document record (+ auto classify)
  GET  /api/documents           - list documents
  GET  /api/analytics           - counters + prediction stats
  GET  /api/analytics/export.csv- Power BI ready CSV export
"""

from flask import Flask, request, jsonify, Response
from flask_cors import CORS

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ml.classifier import train_models, classify_text, MODEL_DIR, TRAINING_DATA
from database import repository as repo

app = Flask(__name__)
CORS(app)  # allow the Next.js frontend (any port) to call this API


@app.route("/api/health", methods=["GET"])
def health():
    model_trained = os.path.exists(os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl"))
    return jsonify(
        {
            "status": "ok",
            "service": "docvault-ml-api",
            "framework": "Flask",
            "models_trained": model_trained,
            **repo.health(),
        }
    )


@app.route("/api/ml/train", methods=["POST"])
def train():
    try:
        metrics = train_models()
        repo.increment_counter("trainings")
        return jsonify({"success": True, **metrics})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/ml/info", methods=["GET"])
def model_info():
    return jsonify(
        {
            "frameworks": ["scikit-learn", "TensorFlow/Keras"],
            "pipeline": "TF-IDF vectorization -> LogisticRegression / Dense NN",
            "training_samples": len(TRAINING_DATA),
            "models_dir": MODEL_DIR,
            "trained": os.path.exists(os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl")),
        }
    )


@app.route("/api/ml/classify", methods=["POST"])
def classify():
    data = request.get_json(silent=True) or {}
    text = data.get("text", "").strip()
    model = data.get("model", "auto")
    if not text:
        return jsonify({"success": False, "error": "text is required"}), 400
    try:
        result = classify_text(text, model)
        # log to MongoDB for analytics / Power BI
        repo.log_prediction({"input_text": text[:300], **result})
        repo.increment_counter("classifications")
        return jsonify({"success": True, **result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/documents", methods=["POST"])
def create_document():
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"success": False, "error": "name is required"}), 400

    text = " ".join(
        filter(None, [name, data.get("description", ""), " ".join(data.get("tags", []))])
    )

    doc = {
        "name": name,
        "description": data.get("description", ""),
        "tags": data.get("tags", []),
        "mimeType": data.get("mimeType", ""),
        "fileSize": data.get("fileSize", 0),
    }

    try:
        prediction = classify_text(text)
        doc["ml_category"] = prediction["category"]
        doc["ml_confidence"] = prediction["confidence"]
        doc["ml_model"] = prediction["model_used"]
        repo.log_prediction({"input_text": text[:300], **prediction})
        repo.increment_counter("classifications")
    except Exception:
        doc["ml_category"] = None

    saved = repo.insert_document(doc)
    repo.increment_counter("uploads")
    return jsonify({"success": True, "document": saved}), 201


@app.route("/api/documents", methods=["GET"])
def list_documents():
    docs = repo.find_documents(limit=int(request.args.get("limit", 100)))
    return jsonify({"success": True, "count": len(docs), "documents": docs})


@app.route("/api/analytics", methods=["GET"])
def analytics():
    counters = repo.get_analytics()
    preds = repo.find_predictions()
    by_category = {}
    by_model = {}
    for p in preds:
        c = p.get("category", "unknown")
        m = p.get("model_used", "unknown")
        by_category[c] = by_category.get(c, 0) + 1
        by_model[m] = by_model.get(m, 0) + 1
    return jsonify(
        {
            "success": True,
            "counters": counters,
            "total_predictions": len(preds),
            "predictions_by_category": by_category,
            "predictions_by_model": by_model,
        }
    )


@app.route("/api/analytics/export.csv", methods=["GET"])
def export_csv():
    """Combined CSV export (legacy) for Tableau."""
    return _predictions_csv()


@app.route("/api/analytics/predictions.csv", methods=["GET"])
def export_predictions_csv():
    """Clean single-table CSV: ML predictions (Power BI ready)."""
    return _predictions_csv()


def _predictions_csv():
    import csv
    import io

    preds = repo.find_predictions(limit=5000)
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["id", "timestamp", "category", "confidence", "model_used", "user"])
    for p in preds:
        w.writerow(
            [p.get("_id"), p.get("timestamp"), p.get("category"),
             p.get("confidence"), p.get("model_used"), p.get("user", "")]
        )
    return Response(
        buf.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=docvault_predictions.csv"},
    )


@app.route("/api/analytics/documents.csv", methods=["GET"])
def export_documents_csv():
    """Clean single-table CSV: document records with ML metadata (Power BI ready)."""
    import csv
    import io

    docs = repo.find_documents(limit=5000)
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["id", "name", "ml_category", "ml_confidence", "ml_model",
                "mimeType", "file_size_bytes", "user", "created_at"])
    for d in docs:
        w.writerow(
            [d.get("_id"), d.get("name"), d.get("ml_category"), d.get("ml_confidence"),
             d.get("ml_model"), d.get("mimeType"), d.get("fileSize"),
             d.get("user", ""), d.get("created_at")]
        )
    return Response(
        buf.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=docvault_documents.csv"},
    )


if __name__ == "__main__":
    print("DocVault Flask API starting (http://localhost:5000) ...")
    print("Storage:", repo.health()["storage"])
    app.run(host="0.0.0.0", port=5000, debug=False)

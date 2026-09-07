"""
MongoDB data layer (MongoDB Atlas).
Falls back to in-memory storage if MONGODB_URI is not configured,
so the service runs without external dependencies.

Collections:
- documents    : document records + ML predictions
- predictions  : every ML classification made (for analytics/Power BI)
- analytics    : usage counters (uploads, downloads, classifications)
"""

import os
from datetime import datetime, timezone

MONGODB_URI = os.environ.get("MONGODB_URI", "")
DB_NAME = os.environ.get("MONGODB_DB", "docvault")

_client = None
_memory = {"documents": [], "predictions": [], "analytics": []}


def _get_db():
    """Return (db, using_mongo). Falls back to in-memory."""
    global _client
    if not MONGODB_URI:
        return None, False
    if _client is None:
        from pymongo import MongoClient
        _client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    return _client[DB_NAME], True


def _now():
    return datetime.now(timezone.utc).isoformat()


# ---------------- documents ----------------

def insert_document(doc: dict) -> dict:
    doc = {**doc, "created_at": _now(), "updated_at": _now()}
    db, is_mongo = _get_db()
    if is_mongo:
        r = db.documents.insert_one(doc)
        return {**doc, "_id": str(r.inserted_id)}
    doc["_id"] = f"mem-{len(_memory['documents']) + 1}"
    _memory["documents"].append(doc)
    return doc


def find_documents(query: dict = None, limit: int = 100) -> list:
    db, is_mongo = _get_db()
    if is_mongo:
        cur = db.documents.find(query or {}).sort("created_at", -1).limit(limit)
        return [{**d, "_id": str(d["_id"])} for d in cur]
    return _memory["documents"][-limit:]


def update_document(doc_id: str, updates: dict) -> bool:
    db, is_mongo = _get_db()
    if is_mongo:
        from bson import ObjectId
        r = db.documents.update_one(
            {"_id": ObjectId(doc_id)}, {"$set": {**updates, "updated_at": _now()}}
        )
        return r.modified_count > 0
    for d in _memory["documents"]:
        if d["_id"] == doc_id:
            d.update(updates)
            return True
    return False


# ---------------- predictions ----------------

def log_prediction(prediction: dict) -> dict:
    entry = {**prediction, "timestamp": _now()}
    db, is_mongo = _get_db()
    if is_mongo:
        r = db.predictions.insert_one(entry)
        return {**entry, "_id": str(r.inserted_id)}
    entry["_id"] = f"pred-{len(_memory['predictions']) + 1}"
    _memory["predictions"].append(entry)
    return entry


def find_predictions(limit: int = 500) -> list:
    db, is_mongo = _get_db()
    if is_mongo:
        cur = db.predictions.find().sort("timestamp", -1).limit(limit)
        return [{**d, "_id": str(d["_id"])} for d in cur]
    return _memory["predictions"][-limit:]


# ---------------- analytics ----------------

def increment_counter(name: str, amount: int = 1, meta: dict = None):
    db, is_mongo = _get_db()
    if is_mongo:
        db.analytics.update_one(
            {"name": name},
            {
                "$inc": {"count": amount},
                "$set": {"last_updated": _now(), **(meta or {})},
                "$setOnInsert": {"created_at": _now()},
            },
            upsert=True,
        )
    else:
        for a in _memory["analytics"]:
            if a["name"] == name:
                a["count"] += amount
                a["last_updated"] = _now()
                return
        _memory["analytics"].append(
            {"name": name, "count": amount, "created_at": _now(), "last_updated": _now()}
        )


def get_analytics() -> list:
    db, is_mongo = _get_db()
    if is_mongo:
        return list(db.analytics.find({}, {"_id": 0}))
    return _memory["analytics"]


def health() -> dict:
    """Check storage backend health."""
    if not MONGODB_URI:
        return {"storage": "in-memory fallback", "mongodb": "not configured"}
    try:
        db, _ = _get_db()
        db.command("ping")
        return {"storage": "mongodb", "mongodb": "connected"}
    except Exception as e:
        return {"storage": "error", "mongodb": str(e)[:200]}

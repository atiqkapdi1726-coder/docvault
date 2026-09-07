"""
DocVault College Backend - ML Service
=====================================
Cloud-based Document Management System

Real ML document classifier:
- scikit-learn TF-IDF + Logistic Regression (fast baseline)
- TensorFlow/Keras neural network (deep model)

Both trained on document text (name + description + tags)
to predict the document CATEGORY.
"""

import json
import os
import pickle
import numpy as np

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
TFIDF_PATH = os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl")
LR_PATH = os.path.join(MODEL_DIR, "lr_classifier.pkl")
LABELS_PATH = os.path.join(MODEL_DIR, "label_classes.pkl")
KERAS_PATH = os.path.join(MODEL_DIR, "keras_classifier.keras")


CATEGORIES = [
    "invoice",
    "resume",
    "report",
    "contract",
    "presentation",
    "meeting-notes",
    "policy",
    "financial",
    "legal",
    "general",
]

TRAINING_DATA = [
    # invoice
    ("invoice bill payment amount due total subtotal vendor", "invoice"),
    ("invoice #1234 payment terms net 30 balance due", "invoice"),
    ("billing statement amount payable tax gst total", "invoice"),
    ("receipt payment confirmed purchased goods services", "invoice"),
    ("monthly invoice electricity bill units consumed", "invoice"),
    ("purchase order 550 delivery charges total payable", "invoice"),
    ("vendor invoice dated services rendered payment request", "invoice"),
    ("proforma invoice quotation estimated cost estimate", "invoice"),
    # resume
    ("resume curriculum vitae experience education skills candidate", "resume"),
    ("cv work history professional summary qualifications", "resume"),
    ("software engineer resume projects python java experience", "resume"),
    ("job application cover letter candidate position applying", "resume"),
    ("skills javascript react python achievements education", "resume"),
    ("professional profile years experience developer", "resume"),
    ("linkedin profile career summary certifications", "resume"),
    ("portfolio projects worked technologies employment", "resume"),
    # report
    ("report analysis findings summary quarterly results research", "report"),
    ("annual report performance overview key metrics", "report"),
    ("research paper study methodology results conclusion", "report"),
    ("project status report progress deliverables milestones", "report"),
    ("market analysis trends insights data survey", "report"),
    ("lab experiment observations results discussion", "report"),
    ("case study investigation outcome evaluation", "report"),
    ("technical specification document requirements overview", "report"),
    # contract
    ("contract agreement terms parties signatures legal binding", "contract"),
    ("service agreement between parties obligations scope", "contract"),
    ("non disclosure agreement nda confidential terms", "contract"),
    ("employment contract salary terms conditions signing", "contract"),
    ("lease agreement rental property tenant landlord", "contract"),
    ("memorandum of understanding mou terms conditions", "contract"),
    ("partnership agreement business terms signatures", "contract"),
    ("agreement termination clauses breach penalties", "contract"),
    # presentation
    ("presentation slides deck pitch audience demo", "presentation"),
    ("powerpoint slides keynote speech talk bullets", "presentation"),
    ("pitch deck investors startup idea funding", "presentation"),
    ("seminar presentation topic workshop introduction", "presentation"),
    ("business proposal presentation overview strategy", "presentation"),
    ("training session presentation materials onboarding", "presentation"),
    ("conference talk abstract slides demonstration", "presentation"),
    ("client demo walkthrough product features", "presentation"),
    # meeting-notes
    ("meeting minutes agenda attendees action items", "meeting-notes"),
    ("standup notes discussion points decisions", "meeting-notes"),
    ("meeting notes date participants follow ups tasks", "meeting-notes"),
    ("board meeting minutes resolutions approved", "meeting-notes"),
    ("team sync weekly notes updates blockers", "meeting-notes"),
    ("kickoff meeting agenda introduction planning", "meeting-notes"),
    ("review meeting feedback discussion notes", "meeting-notes"),
    ("one on one meeting notes manager employee", "meeting-notes"),
    # policy
    ("policy guidelines procedure compliance rules hr", "policy"),
    ("company policy employee handbook code conduct", "policy"),
    ("security policy access control password requirements", "policy"),
    ("privacy policy data protection gdpr terms", "policy"),
    ("leave policy vacation days procedure employees", "policy"),
    ("acceptable use policy it rules restrictions", "policy"),
    ("safety procedures workplace emergency guidelines", "policy"),
    ("refund policy cancellation terms conditions", "policy"),
    # financial
    ("financial revenue profit loss budget forecast statements", "financial"),
    ("balance sheet assets liabilities equity accounting", "financial"),
    ("cash flow statement income expenses quarterly", "financial"),
    ("budget allocation spending plan fiscal year", "financial"),
    ("tax return filing income deduction forms", "financial"),
    ("audit accounts books verification chartered", "financial"),
    ("payroll salary disbursement employee compensation", "financial"),
    ("investment portfolio returns equity shares", "financial"),
    # legal
    ("legal court plaintiff defendant statute case law", "legal"),
    ("affidavit sworn statement notary legal document", "legal"),
    ("notice legal action lawsuit attorney lawyer", "legal"),
    ("terms of service conditions use liability", "legal"),
    ("power of attorney legal representative rights", "legal"),
    ("writ petition high court jurisdiction remedy", "legal"),
    ("compliance regulatory law act rules statute", "legal"),
    ("settlement dispute arbitration mediation agreement", "legal"),
    # general
    ("notes draft scratch miscellaneous personal", "general"),
    ("list items todo checklist shopping", "general"),
    ("letter informal personal message", "general"),
    ("random document file unnamed content", "general"),
    ("assignment homework questions answers", "general"),
    ("certificate award achievement recognition", "general"),
    ("form application fill fields submit", "general"),
    ("diagram drawing sketch figure plan", "general"),
]


def train_models():
    """Train both classifiers and save to disk. Returns metrics."""
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression
    from sklearn.pipeline import make_pipeline
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score, classification_report
    import tensorflow as tf

    os.makedirs(MODEL_DIR, exist_ok=True)

    texts = [t for t, _ in TRAINING_DATA]
    labels = [l for _, l in TRAINING_DATA]

    # ------- scikit-learn pipeline (TF-IDF + Logistic Regression) -------
    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels
    )

    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2), sublinear_tf=True)
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    lr = LogisticRegression(max_iter=1000, C=10.0)
    lr.fit(X_train_tfidf, y_train)

    lr_pred = lr.predict(X_test_tfidf)
    lr_acc = accuracy_score(y_test, lr_pred)

    with open(TFIDF_PATH, "wb") as f:
        pickle.dump(vectorizer, f)
    with open(LR_PATH, "wb") as f:
        pickle.dump(lr, f)
    with open(LABELS_PATH, "wb") as f:
        pickle.dump(sorted(set(labels)), f)

    # ------- TensorFlow / Keras neural network -------
    from sklearn.preprocessing import LabelEncoder

    le = LabelEncoder()
    y_all = le.fit_transform(labels)
    n_classes = len(le.classes_)

    X_tfidf_all = vectorizer.transform(texts).toarray()
    Xtr, Xte, ytr, yte = train_test_split(
        X_tfidf_all, y_all, test_size=0.2, random_state=42, stratify=y_all
    )

    model = tf.keras.Sequential(
        [
            tf.keras.layers.Input(shape=(X_tfidf_all.shape[1],)),
            tf.keras.layers.Dense(128, activation="relu"),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(64, activation="relu"),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(n_classes, activation="softmax"),
        ]
    )
    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    model.fit(
        Xtr,
        ytr,
        epochs=40,
        batch_size=8,
        validation_split=0.1,
        verbose=0,
    )
    _, keras_acc = model.evaluate(Xte, yte, verbose=0)
    model.save(KERAS_PATH)

    return {
        "sklearn_accuracy": round(float(lr_acc), 4),
        "tensorflow_accuracy": round(float(keras_acc), 4),
        "classes": list(le.classes_),
        "training_samples": len(texts),
    }


def load_models():
    """Load trained models from disk."""
    with open(TFIDF_PATH, "rb") as f:
        vectorizer = pickle.load(f)
    with open(LR_PATH, "rb") as f:
        lr = pickle.load(f)
    with open(LABELS_PATH, "rb") as f:
        classes = pickle.load(f)
    return vectorizer, lr, classes


def classify_text(text, model="auto"):
    """Classify document text.

    model: 'sklearn' | 'tensorflow' | 'auto' (tensorflow preferred, sklearn fallback)
    """
    if not os.path.exists(TFIDF_PATH):
        train_models()

    vectorizer, lr, classes = load_models()
    X = vectorizer.transform([text])

    if model == "sklearn":
        probs = lr.predict_proba(X)[0]
        idx = int(np.argmax(probs))
        return {
            "category": lr.classes_[idx],
            "confidence": round(float(probs[idx]), 4),
            "model_used": "scikit-learn LogisticRegression (TF-IDF)",
        }

    # TensorFlow path
    import tensorflow as tf

    if os.path.exists(KERAS_PATH):
        try:
            keras_model = tf.keras.models.load_model(KERAS_PATH)
            probs = keras_model.predict(X.toarray(), verbose=0)[0]
            idx = int(np.argmax(probs))
            return {
                "category": classes[idx] if idx < len(classes) else "general",
                "confidence": round(float(probs[idx]), 4),
                "model_used": "TensorFlow/Keras Neural Network",
            }
        except Exception:
            pass  # fall back to sklearn

    probs = lr.predict_proba(X)[0]
    idx = int(np.argmax(probs))
    return {
        "category": lr.classes_[idx],
        "confidence": round(float(probs[idx]), 4),
        "model_used": "scikit-learn LogisticRegression (TF-IDF)",
    }

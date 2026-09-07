'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, Brain, Database, BarChart3, RefreshCw, Download, Terminal } from 'lucide-react';

const FLASK = process.env.NEXT_PUBLIC_FLASK_API_URL || 'http://localhost:5000';

interface ClassifyResult {
  success: boolean;
  category?: string;
  confidence?: number;
  model_used?: string;
  error?: string;
}

interface TrainResult {
  success: boolean;
  sklearn_accuracy?: number;
  tensorflow_accuracy?: number;
  training_samples?: number;
  classes?: string[];
  error?: string;
}

interface Analytics {
  success: boolean;
  counters?: { name: string; count: number }[];
  total_predictions?: number;
  predictions_by_category?: Record<string, number>;
  predictions_by_model?: Record<string, number>;
}

export default function MLLabPage() {
  const [health, setHealth] = useState<any>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [input, setInput] = useState('invoice payment due total amount vendor gst');
  const [model, setModel] = useState<'auto' | 'tensorflow' | 'sklearn'>('auto');
  const [result, setResult] = useState<ClassifyResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [training, setTraining] = useState<TrainResult | null>(null);
  const [trainingBusy, setTrainingBusy] = useState(false);

  const loadStatus = async () => {
    try {
      const h = await fetch(`${FLASK}/api/health`).then((r) => r.json());
      setHealth(h);
      const a = await fetch(`${FLASK}/api/analytics`).then((r) => r.json());
      setAnalytics(a);
    } catch {
      setHealth(null);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const classify = async () => {
    if (!input.trim()) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch(`${FLASK}/api/ml/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, model }),
      });
      setResult(await res.json());
      loadStatus();
    } catch {
      setResult({ success: false, error: 'Cannot reach Flask API. Is it running? (python app.py on port 5000)' });
    } finally {
      setBusy(false);
    }
  };

  const train = async () => {
    setTrainingBusy(true);
    setTraining(null);
    try {
      const res = await fetch(`${FLASK}/api/ml/train`, { method: 'POST' });
      setTraining(await res.json());
      loadStatus();
    } catch {
      setTraining({ success: false, error: 'Cannot reach Flask API' });
    } finally {
      setTrainingBusy(false);
    }
  };

  const maxCat = Math.max(...Object.values(analytics?.predictions_by_category || {}), 1);

  return (
    <AppLayout>
      <div className="p-4 lg:p-6" style={{ minHeight: '100vh' }}>
        {/* Bootstrap-styled header */}
        <div className="card mb-4">
          <div className="card-body d-flex align-items-center gap-3 flex-wrap">
            <div className="d-flex align-items-center gap-2">
              <FlaskConical size={28} className="text-primary" />
              <div>
                <h4 className="mb-0 fw-bold">ML Lab</h4>
                <small className="text-muted">
                  Python &middot; Flask &middot; Scikit-learn &middot; TensorFlow &middot; MongoDB
                </small>
              </div>
            </div>
            <div className="ms-auto d-flex gap-2 align-items-center flex-wrap">
              <span className={`badge rounded-pill ${health ? 'bg-success' : 'bg-danger'}`}>
                {health ? `Flask: ${health.storage}` : 'Flask API offline'}
              </span>
              <span className={`badge rounded-pill ${health?.models_trained ? 'bg-success' : 'bg-warning text-dark'}`}>
                {health?.models_trained ? 'Models trained' : 'Models not trained'}
              </span>
              <button className="btn btn-outline-primary btn-sm" onClick={loadStatus}>
                <RefreshCw size={14} className="me-1" /> Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Classify panel */}
          <div className="col-lg-7">
            <div className="card h-100">
              <div className="card-header bg-white d-flex align-items-center gap-2 fw-semibold">
                <Brain size={18} className="text-primary" /> Document Classifier
              </div>
              <div className="card-body">
                <label className="form-label fw-medium">Document text (name, description, tags)</label>
                <textarea
                  className="form-control mb-3"
                  rows={3}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g. rental agreement tenant landlord terms signatures"
                />
                <div className="d-flex gap-2 align-items-center flex-wrap mb-3">
                  <div className="btn-group" role="group">
                    {(['auto', 'tensorflow', 'sklearn'] as const).map((m) => (
                      <button
                        key={m}
                        className={`btn btn-sm ${model === m ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setModel(m)}
                      >
                        {m === 'auto' ? 'Auto' : m === 'tensorflow' ? 'TensorFlow NN' : 'Scikit-learn'}
                      </button>
                    ))}
                  </div>
                  <button className="btn btn-primary" onClick={classify} disabled={busy || !input.trim()}>
                    {busy ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" /> Classifying…
                      </>
                    ) : (
                      'Classify'
                    )}
                  </button>
                </div>

                {result && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                    {result.success ? (
                      <div className="alert alert-success mb-0">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                          <div>
                            <h5 className="mb-1 text-capitalize">{result.category}</h5>
                            <small className="text-muted">{result.model_used}</small>
                          </div>
                          <div className="text-end">
                            <h4 className="mb-0">{Math.round((result.confidence || 0) * 100)}%</h4>
                            <small className="text-muted">confidence</small>
                          </div>
                        </div>
                        <div className="progress mt-2" style={{ height: 8 }}>
                          <div
                            className="progress-bar bg-success"
                            style={{ width: `${(result.confidence || 0) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="alert alert-danger mb-0">{result.error}</div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Train + status panel */}
          <div className="col-lg-5">
            <div className="card mb-4">
              <div className="card-header bg-white d-flex align-items-center gap-2 fw-semibold">
                <Terminal size={18} className="text-primary" /> Train Models
              </div>
              <div className="card-body">
                <p className="text-muted small mb-3">
                  Trains both pipelines on the built-in dataset: TF-IDF + LogisticRegression (scikit-learn)
                  and a Dense Neural Network (TensorFlow/Keras).
                </p>
                <button className="btn btn-primary w-100" onClick={train} disabled={trainingBusy}>
                  {trainingBusy ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" /> Training (TF + sklearn)…
                    </>
                  ) : (
                    'Train / Retrain Models'
                  )}
                </button>
                {training && (
                  <div className={training.success ? 'alert alert-success mt-3 mb-0' : 'alert alert-danger mt-3 mb-0'}>
                    {training.success ? (
                      <>
                        <div className="d-flex justify-content-between"><span>scikit-learn accuracy</span><b>{(training.sklearn_accuracy! * 100).toFixed(1)}%</b></div>
                        <div className="d-flex justify-content-between"><span>TensorFlow accuracy</span><b>{(training.tensorflow_accuracy! * 100).toFixed(1)}%</b></div>
                        <div className="d-flex justify-content-between"><span>Training samples</span><b>{training.training_samples}</b></div>
                      </>
                    ) : (
                      training.error
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header bg-white d-flex align-items-center gap-2 fw-semibold">
                <Database size={18} className="text-primary" /> Backend Status
              </div>
              <div className="card-body">
                <table className="table table-sm mb-0">
                  <tbody>
                    <tr><td>Framework</td><td className="text-end fw-semibold">{health?.framework || '—'}</td></tr>
                    <tr><td>Storage</td><td className="text-end fw-semibold">{health?.storage || '—'}</td></tr>
                    <tr><td>MongoDB</td><td className="text-end fw-semibold">{health?.mongodb || '—'}</td></tr>
                    <tr><td>Models trained</td><td className="text-end fw-semibold">{health ? String(health.models_trained) : '—'}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Analytics (Power BI source) */}
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-white d-flex align-items-center gap-2 fw-semibold">
                <BarChart3 size={18} className="text-primary" /> Prediction Analytics
                <span className="badge bg-secondary ms-2">
                  {analytics?.total_predictions ?? 0} total
                </span>
                <a
                  href={`${FLASK}/api/analytics/export.csv`}
                  className="btn btn-outline-primary btn-sm ms-auto"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download size={14} className="me-1" /> Export CSV for Power BI
                </a>
              </div>
              <div className="card-body">
                {analytics && Object.entries(analytics.predictions_by_category || {}).length > 0 ? (
                  <div className="row g-3">
                    {Object.entries(analytics.predictions_by_category || {})
                      .sort((a, b) => b[1] - a[1])
                      .map(([cat, count]) => (
                        <div className="col-md-4 col-6" key={cat}>
                          <div className="d-flex justify-content-between small mb-1 text-capitalize">
                            <span>{cat}</span>
                            <span className="fw-semibold">{count}</span>
                          </div>
                          <div className="progress" style={{ height: 8 }}>
                            <div
                              className="progress-bar"
                              style={{ width: `${(count / maxCat) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted mb-0 text-center py-3">
                    No predictions yet — classify some documents above.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

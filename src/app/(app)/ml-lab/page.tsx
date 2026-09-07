'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, RefreshCw, Download, Activity as ActivityIcon,
  CheckCircle2, AlertTriangle, Sparkles, Cpu, FileSearch, Loader2,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_FLASK_API_URL || 'http://localhost:5000';

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

interface Health {
  status?: string;
  service?: string;
  framework?: string;
  models_trained?: boolean;
  storage?: string;
  mongodb?: string;
}

interface Analytics {
  success: boolean;
  counters?: { name: string; count: number }[];
  total_predictions?: number;
  predictions_by_category?: Record<string, number>;
  predictions_by_model?: Record<string, number>;
}

const MODEL_OPTIONS = [
  { id: 'auto' as const, label: 'Smart', hint: 'Recommended' },
  { id: 'tensorflow' as const, label: 'Neural Network', hint: 'Deep learning' },
  { id: 'sklearn' as const, label: 'Statistical', hint: 'Fast baseline' },
];

export default function MLLabPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [input, setInput] = useState('');
  const [model, setModel] = useState<'auto' | 'tensorflow' | 'sklearn'>('auto');
  const [result, setResult] = useState<ClassifyResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [training, setTraining] = useState<TrainResult | null>(null);
  const [trainingBusy, setTrainingBusy] = useState(false);

  const loadStatus = async () => {
    try {
      const h = await fetch(`${API}/api/health`).then((r) => r.json());
      setHealth(h);
      const a = await fetch(`${API}/api/analytics`).then((r) => r.json());
      setAnalytics(a);
    } catch {
      setHealth(null);
      setAnalytics(null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const h = await fetch(`${API}/api/health`).then((r) => r.json());
        if (cancelled) return;
        setHealth(h);
        const a = await fetch(`${API}/api/analytics`).then((r) => r.json());
        if (cancelled) return;
        setAnalytics(a);
      } catch {
        if (!cancelled) {
          setHealth(null);
          setAnalytics(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const classify = async () => {
    if (!input.trim()) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch(`${API}/api/ml/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, model }),
      });
      setResult(await res.json());
      loadStatus();
    } catch {
      setResult({
        success: false,
        error: 'The classification service is temporarily unavailable. Please try again shortly.',
      });
    } finally {
      setBusy(false);
    }
  };

  const train = async () => {
    setTrainingBusy(true);
    setTraining(null);
    try {
      const res = await fetch(`${API}/api/ml/train`, { method: 'POST' });
      setTraining(await res.json());
      loadStatus();
    } catch {
      setTraining({
        success: false,
        error: 'The classification service is temporarily unavailable. Please try again shortly.',
      });
    } finally {
      setTrainingBusy(false);
    }
  };

  const maxCat = Math.max(...Object.values(analytics?.predictions_by_category || {}), 1);

  const statusCards = [
    {
      label: 'Service Status',
      value: health ? 'Operational' : 'Unavailable',
      ok: !!health,
      icon: ActivityIcon,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Data Connection',
      value: health?.storage === 'mongodb' ? 'Cloud Database' : health ? 'Local Storage' : '—',
      ok: health?.storage === 'mongodb',
      icon: Cpu,
      color: 'from-violet-500 to-purple-500',
    },
    {
      label: 'Classification Engine',
      value: health?.models_trained ? 'Ready' : 'Initializing',
      ok: !!health?.models_trained,
      icon: Brain,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Total Classifications',
      value: String(analytics?.total_predictions ?? 0),
      ok: true,
      icon: FileSearch,
      color: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <AppLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between flex-wrap gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold">Smart Classification</h1>
            <p className="text-[rgb(var(--muted-foreground))] mt-1">
              Automatically categorize documents with machine learning
            </p>
          </div>
          <button className="btn-secondary text-sm flex items-center gap-2" onClick={loadStatus}>
            <RefreshCw size={14} /> Refresh
          </button>
        </motion.div>

        {/* Status cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">{stat.label}</p>
                  <p className="text-lg font-bold mt-1 flex items-center gap-2">
                    {stat.ok ? (
                      <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                    ) : (
                      <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                    )}
                    {stat.value}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon size={20} className="text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Classify panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <div className="p-5 border-b border-[rgb(var(--border))]">
              <h2 className="font-semibold flex items-center gap-2">
                <Brain size={18} className="text-[rgb(var(--primary))]" />
                Classify a Document
              </h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                Paste a document name, description, or contents and the engine will detect its category.
              </p>
            </div>
            <div className="p-5 space-y-4">
              <textarea
                className="input-field resize-none"
                rows={4}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. rental agreement tenant landlord terms signatures"
              />

              <div>
                <p className="text-sm font-medium mb-2">Classification engine</p>
                <div className="grid grid-cols-3 gap-2">
                  {MODEL_OPTIONS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setModel(m.id)}
                      className={`rounded-lg border p-3 text-left transition-all ${
                        model === m.id
                          ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10'
                          : 'border-[rgb(var(--border))] hover:bg-[rgb(var(--muted))]/50'
                      }`}
                    >
                      <p className={`text-sm font-medium ${model === m.id ? 'text-[rgb(var(--primary))]' : ''}`}>
                        {m.label}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">{m.hint}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button className="btn-primary w-full flex items-center justify-center gap-2" onClick={classify} disabled={busy || !input.trim()}>
                {busy ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Classifying…
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Classify Document
                  </>
                )}
              </button>

              {result && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                  {result.success ? (
                    <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <p className="text-lg font-bold capitalize text-green-800 dark:text-green-400">
                            {result.category}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                            Category detected automatically
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-800 dark:text-green-400">
                            {Math.round((result.confidence || 0) * 100)}%
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-500">confidence</p>
                        </div>
                      </div>
                      <div className="h-2 bg-green-100 dark:bg-green-900/30 rounded-full overflow-hidden mt-3">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
                          style={{ width: `${(result.confidence || 0) * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4">
                      <p className="text-sm text-red-700 dark:text-red-400">{result.error}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Train + analytics panel */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card"
            >
              <div className="p-5 border-b border-[rgb(var(--border))]">
                <h2 className="font-semibold flex items-center gap-2">
                  <Cpu size={18} className="text-[rgb(var(--primary))]" />
                  Update Classification Engine
                </h2>
                <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                  Retrain both recognition engines on the reference dataset to keep categorization accurate.
                </p>
              </div>
              <div className="p-5 space-y-4">
                <button
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                  onClick={train}
                  disabled={trainingBusy}
                >
                  {trainingBusy ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Updating engine…
                    </>
                  ) : (
                    'Update Engine'
                  )}
                </button>

                {training && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                    {training.success ? (
                      <div className="space-y-2 bg-[rgb(var(--muted))]/50 rounded-xl p-4 border border-[rgb(var(--border))]">
                        <div className="flex justify-between text-sm">
                          <span className="text-[rgb(var(--muted-foreground))]">Statistical engine accuracy</span>
                          <b>{(training.sklearn_accuracy! * 100).toFixed(1)}%</b>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[rgb(var(--muted-foreground))]">Neural network accuracy</span>
                          <b>{(training.tensorflow_accuracy! * 100).toFixed(1)}%</b>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[rgb(var(--muted-foreground))]">Reference documents used</span>
                          <b>{training.training_samples}</b>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <p className="text-sm text-red-700 dark:text-red-400">{training.error}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card"
            >
              <div className="p-5 border-b border-[rgb(var(--border))]">
                <h2 className="font-semibold flex items-center gap-2">
                  <ActivityIcon size={18} className="text-[rgb(var(--primary))]" />
                  Classification Activity
                </h2>
              </div>
              <div className="p-5">
                {analytics && Object.entries(analytics.predictions_by_category || {}).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(analytics.predictions_by_category || {})
                      .sort((a, b) => b[1] - a[1])
                      .map(([cat, count]) => (
                        <div key={cat}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize">{cat}</span>
                            <span className="font-semibold">{count}</span>
                          </div>
                          <div className="h-2 bg-[rgb(var(--muted))] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                              style={{ width: `${(count / maxCat) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-[rgb(var(--muted-foreground))] text-center py-6">
                    No classifications yet. Classify your first document above.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Export */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="p-5 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="font-semibold">Export Classification Data</h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                Download the full classification history as a CSV file for reporting and business intelligence tools.
              </p>
            </div>
            <a
              href={`${API}/api/analytics/export.csv`}
              className="btn-primary text-sm inline-flex items-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download size={16} /> Download CSV
            </a>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}

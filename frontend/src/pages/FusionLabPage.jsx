import { useState, useEffect } from 'react';
import { Merge, Plus, X, Play, Sparkles, Loader2, CheckCircle2, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const METHOD_COLORS = { slerp: '#6366f1', ties: '#f59e0b', dare: '#ef4444', linear: '#10b981' };

export default function FusionLabPage() {
  const [methods, setMethods] = useState({});
  const [selectedMethod, setSelectedMethod] = useState('slerp');
  const [models, setModels] = useState(['', '']);
  const [weights, setWeights] = useState([0.5, 0.5]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { token } = useAuth();

  useEffect(() => { fetchMethods(); }, []);

  const fetchMethods = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/fusion/methods');
      if (res.ok) { const d = await res.json(); setMethods(d.methods); }
    } catch (e) { console.error(e); }
  };

  const addModel = () => {
    setModels([...models, '']);
    setWeights([...weights, 0.5]);
  };

  const removeModel = (i) => {
    if (models.length <= 2) return;
    setModels(models.filter((_, idx) => idx !== i));
    setWeights(weights.filter((_, idx) => idx !== i));
  };

  const handleMerge = async () => {
    if (models.some(m => !m.trim())) return alert('Please fill in all model IDs');
    setLoading(true); setResult(null);
    try {
      const res = await fetch('http://localhost:8000/api/fusion/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ models, method: selectedMethod, weights }),
      });
      if (res.ok) { setResult(await res.json()); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Model Fusion Lab</h2>
            <p>Merge multiple fine-tuned models into a single super-model — no GPU required</p>
          </div>
          <span className="badge badge-purple" style={{ fontSize: 11 }}>Experimental</span>
        </div>
      </div>

      <div className="page-content">
        <div className="grid-2 mb-6" style={{ gridTemplateColumns: '1fr 380px' }}>
          {/* Left: Model Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Merge Method */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} /> Merge Method
              </div>
              <div className="grid-2" style={{ gap: 10 }}>
                {Object.entries(methods).map(([key, m]) => (
                  <div key={key} onClick={() => setSelectedMethod(key)} style={{
                    padding: 14, borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    background: selectedMethod === key ? `${METHOD_COLORS[key]}10` : 'var(--bg-tertiary)',
                    border: `1.5px solid ${selectedMethod === key ? METHOD_COLORS[key] : 'var(--border)'}`,
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: selectedMethod === key ? METHOD_COLORS[key] : 'var(--text-primary)' }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>{m.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Model Inputs */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Merge size={16} /> Models to Merge
                </div>
                <button className="btn btn-sm btn-secondary" onClick={addModel}>
                  <Plus size={13} /> Add Model
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {models.map((m, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                      background: METHOD_COLORS[selectedMethod] + '20',
                      color: METHOD_COLORS[selectedMethod],
                      flexShrink: 0,
                    }}>{i + 1}</div>
                    <input className="form-input flex-1" placeholder="e.g. meta-llama/Llama-3.2-1B"
                      value={m} onChange={e => { const n = [...models]; n[i] = e.target.value; setModels(n); }} />
                    <input type="range" min="0" max="1" step="0.05" value={weights[i]}
                      onChange={e => { const n = [...weights]; n[i] = parseFloat(e.target.value); setWeights(n); }}
                      style={{ width: 80, accentColor: METHOD_COLORS[selectedMethod] }} />
                    <span style={{ fontSize: 11, fontWeight: 700, width: 36, textAlign: 'center' }}>
                      {Math.round(weights[i] * 100)}%
                    </span>
                    {models.length > 2 && (
                      <button className="btn btn-icon btn-ghost btn-sm" onClick={() => removeModel(i)}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button className="btn btn-primary btn-lg w-full" onClick={handleMerge} disabled={loading}
              style={{ background: `linear-gradient(135deg, ${METHOD_COLORS[selectedMethod]}, #a855f7)`, border: 'none' }}>
              {loading ? <><Loader2 size={18} className="animate-spin" /> Merging...</> :
               <><Merge size={18} /> Start Fusion</>}
            </button>
          </div>

          {/* Right: Result Panel */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} /> Fusion Result
            </div>
            {result ? (
              <div className="animate-fade" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ textAlign: 'center', padding: 20, background: 'rgba(16,185,129,0.05)', borderRadius: 12, border: '1px solid rgba(16,185,129,0.15)' }}>
                  <CheckCircle2 size={32} color="var(--success)" style={{ marginBottom: 8 }} />
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Fusion Complete!</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                    {result.merged_model_name}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                  <span style={{ fontSize: 12 }}>Quality Estimate</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--success)' }}>{result.estimated_quality}%</span>
                </div>

                <div className="console" style={{ flex: 1, fontSize: 11 }}>
                  {result.steps?.map((s, i) => <div key={i} className="console-line info">{s}</div>)}
                </div>

                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  <b>Config:</b>
                  <pre style={{ marginTop: 6, fontSize: 10, whiteSpace: 'pre-wrap' }}>{result.config_yaml}</pre>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 13, textAlign: 'center' }}>
                <div>
                  <Merge size={48} style={{ marginBottom: 16, opacity: 0.15 }} />
                  <p>Select your models and method,<br/>then click "Start Fusion"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

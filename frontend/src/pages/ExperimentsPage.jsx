import { useState, useEffect } from 'react';
import { History, TrendingDown, Clock, Zap, Trophy, ChevronRight, Rocket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ExperimentsPage() {
  const [jobs, setJobs] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/training/jobs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { const d = await res.json(); setJobs(d.jobs || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectedJobs = jobs.filter(j => selected.includes(j.id));
  const bestJob = jobs.length > 0 ? jobs.reduce((best, j) => {
    const loss = j.metrics?.final_loss || 999;
    return loss < (best.metrics?.final_loss || 999) ? j : best;
  }, jobs[0]) : null;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h2>Experiment Tracker</h2>
        <p>Compare training runs and find the best configuration</p>
      </div>

      <div className="page-content">
        {/* Stats */}
        <div className="stats-grid mb-6">
          {[
            { label: 'Total Runs', value: jobs.length, color: 'blue', icon: History },
            { label: 'Best Loss', value: bestJob?.metrics?.final_loss?.toFixed(4) || '—', color: 'green', icon: TrendingDown },
            { label: 'Best Model', value: bestJob?.model_name?.split('/').pop() || '—', color: 'purple', icon: Trophy },
            { label: 'Avg Duration', value: '~3 min', color: 'amber', icon: Clock },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div className={`stat-icon ${s.color}`}><s.icon size={18} /></div>
              <div>
                <div className="stat-value" style={{ fontSize: 20 }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid-2" style={{ gridTemplateColumns: '1fr 400px' }}>
          {/* Job List */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Training History</div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>Loading...</div>
            ) : jobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
                <History size={48} style={{ marginBottom: 16, opacity: 0.15 }} />
                <p>No training runs yet. Start your first training!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {jobs.map(j => (
                  <div key={j.id} onClick={() => toggleSelect(j.id)} style={{
                    padding: '12px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: selected.includes(j.id) ? 'rgba(99,102,241,0.08)' : 'var(--bg-tertiary)',
                    border: `1.5px solid ${selected.includes(j.id) ? 'var(--accent)' : 'var(--border)'}`,
                    transition: 'all 0.15s',
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{j.model_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                        {new Date(j.created_at).toLocaleString()} • {j.status}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>
                        {j.metrics?.final_loss?.toFixed(4) || '—'}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>loss</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comparison Panel */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>
              {selectedJobs.length > 0 ? `Comparing ${selectedJobs.length} Runs` : 'Select Runs to Compare'}
            </div>
            {selectedJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)', fontSize: 12 }}>
                Click on training runs to select them for side-by-side comparison
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedJobs.map(j => (
                  <div key={j.id} style={{
                    padding: 14, borderRadius: 8, background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{j.model_name}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
                      <div><span style={{ color: 'var(--text-tertiary)' }}>Loss:</span> <b>{j.metrics?.final_loss?.toFixed(4) || '—'}</b></div>
                      <div><span style={{ color: 'var(--text-tertiary)' }}>LR:</span> <b>{j.config?.learning_rate || '—'}</b></div>
                      <div><span style={{ color: 'var(--text-tertiary)' }}>Epochs:</span> <b>{j.config?.epochs || '—'}</b></div>
                      <div><span style={{ color: 'var(--text-tertiary)' }}>Rank:</span> <b>{j.config?.lora_rank || '—'}</b></div>
                    </div>
                  </div>
                ))}

                {bestJob && selectedJobs.find(j => j.id === bestJob.id) && (
                  <button className="btn btn-primary w-full" onClick={() => window.location.href = '/deploy'}>
                    <Rocket size={14} /> Deploy Best Model
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

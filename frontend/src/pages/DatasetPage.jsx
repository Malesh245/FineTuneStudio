import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Upload, Link2, Database, Trash2, CheckCircle2, AlertTriangle, 
  Sparkles, ArrowRight, RefreshCw, Eye, Zap, Cpu,
  Music, Film, FileText, MessageSquare
} from 'lucide-react';



// We now use dynamic suggestions from the backend analysis
const DEFAULT_SUGGESTIONS = [
  { id: 'remove_duplicates', label: 'Remove Duplicates', desc: 'Found duplicate rows', icon: Trash2, severity: 'warning' },
  { id: 'remove_missing', label: 'Remove Missing Values', desc: 'Found rows with empty fields', icon: AlertTriangle, severity: 'danger' },
  { id: 'trim_whitespace', label: 'Trim Whitespace', desc: 'Found extra spaces in text', icon: RefreshCw, severity: 'info' },
];

function QualityGauge({ score }) {
  const r = 48, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="quality-gauge">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ textAlign: 'center' }}>
        <div className="quality-gauge-value" style={{ color }}>{score}</div>
        <div className="quality-gauge-label">Quality</div>
      </div>
    </div>
  );
}

export default function DatasetPage() {
  const [activeTab, setActiveTab] = useState('upload');
  const [dataset, setDataset] = useState(null);
  const [qualityScore, setQualityScore] = useState(0);
  const [cleaningApplied, setCleaningApplied] = useState([]);
  const [hfUrl, setHfUrl] = useState('');
  const [kaggleUrl, setKaggleUrl] = useState('');
  const [allDatasets, setAllDatasets] = useState([]);
  const fileRef = useRef(null);

  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchDatasets();
    }
  }, [token]);

  const fetchDatasets = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/datasets/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAllDatasets(data.datasets || []);
        if (data.datasets && data.datasets.length > 0 && !dataset) {
          selectDataset(data.datasets[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectDataset = (d) => {
    setDataset({
      id: d.id,
      name: d.name,
      source: d.source,
      rows: d.preview_data || [],
      columns: d.columns || [],
      totalRows: d.row_count || 0,
      suggestions: d.suggestions || [],
      fileUrl: d.file_url,
      format: d.format,
    });
    setQualityScore(d.quality_score || 0);
    setCleaningApplied(d.cleaning_applied || []);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8000/api/datasets/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        await fetchDatasets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleHFImport = async () => {
    if (!hfUrl) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/datasets/import/huggingface', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ dataset_name: hfUrl, split: 'train' }),
      });
      if (res.ok) {
        await fetchDatasets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKaggleImport = async () => {
    if (!kaggleUrl) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/datasets/import/kaggle', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ dataset_id: kaggleUrl }),
      });
      if (res.ok) {
        await fetchDatasets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent selection when clicking delete
    if (!window.confirm('Are you sure you want to delete this dataset?')) return;
    
    try {
      const res = await fetch(`http://localhost:8000/api/datasets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        if (dataset?.id === id) setDataset(null);
        fetchDatasets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const applyCleaning = async (actionIds) => {
    if (!dataset) return;
    setLoading(true);
    
    const actions = Array.isArray(actionIds) ? actionIds : [actionIds];
    const newCleaningList = [...new Set([...cleaningApplied, ...actions])];

    try {
      const res = await fetch('http://localhost:8000/api/datasets/clean', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          dataset_id: dataset.id,
          actions: newCleaningList 
        }),
      });
      
      if (res.ok) {
        const result = await res.json();
        setDataset({
          ...dataset,
          rows: result.preview || result.preview_data || dataset.rows,
          totalRows: result.total_rows || dataset.totalRows,
        });
        setQualityScore(result.quality_score);
        setCleaningApplied(newCleaningList);
        // Refresh library to show updated stats if needed
        fetchDatasets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h2>Datasets</h2>
        <p>Import, preview, and clean your training data</p>
      </div>

      <div className="page-content">
        {/* Sidebar Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>
          
          {/* Left Sidebar: Library */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: '16px' }}>
              <div className="card-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Database size={18} color="var(--accent)" /> Your Library
                <span className="badge badge-info" style={{ marginLeft: 'auto' }}>{allDatasets.length}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 'calc(100vh - 300px)', overflowY: 'auto', paddingRight: 4 }}>
                {allDatasets.map(d => (
                  <div key={d.id}
                    onClick={() => selectDataset(d)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px', borderRadius: 'var(--radius-md)',
                      background: dataset?.id === d.id ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                      border: `1px solid ${dataset?.id === d.id ? 'var(--border-accent)' : 'var(--border)'}`,
                      cursor: 'pointer', transition: 'all var(--transition-fast)',
                    }}>
                    <div style={{ 
                      width: 32, height: 32, borderRadius: 'var(--radius-sm)', 
                      background: 'var(--bg-secondary)', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
                    }}>
                      {d.format === 'mp3' || d.format === 'wav' ? <Music size={16} /> :
                       d.format === 'mp4' || d.format === 'mov' ? <Film size={16} /> :
                       d.name.toLowerCase().includes('qa') ? <MessageSquare size={16} /> :
                       <FileText size={16} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{d.row_count} rows</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {dataset?.id === d.id && <CheckCircle2 size={14} color="var(--accent)" />}
                      <button 
                        onClick={(e) => handleDelete(e, d.id)}
                        className="btn-icon-hover"
                        style={{ padding: 4, borderRadius: 4, color: 'var(--text-tertiary)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {allDatasets.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-tertiary)', fontSize: 13 }}>
                    No datasets yet.
                  </div>
                )}
              </div>

              <button className="btn btn-secondary btn-sm w-full mt-4" style={{ marginTop: 16, width: '100%' }}
                onClick={() => { setDataset(null); setActiveTab('upload'); }}>
                <Upload size={14} /> Import New
              </button>
            </div>
          </div>

          {/* Right Content: Preview & Tools */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {!dataset ? (
              <div className="card">
                <div className="tabs mb-4" style={{ display: 'inline-flex' }}>
                  {[
                    { id: 'upload', label: 'File Upload', icon: Upload },
                    { id: 'huggingface', label: 'Hugging Face', icon: Link2 },
                    { id: 'kaggle', label: 'Kaggle', icon: Database },
                  ].map(t => (
                    <button key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(t.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <t.icon size={14} /> {t.label}
                    </button>
                  ))}
                </div>
                {/* Content for tabs ... (I'll need to move them here) */}
                {activeTab === 'upload' && (
                  <div
                    onClick={() => fileRef.current?.click()}
                    style={{
                      border: '2px dashed var(--border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '48px 24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: 'var(--bg-tertiary)',
                    }}
                  >
                    <Upload size={32} color="var(--accent)" style={{ marginBottom: 12 }} />
                    <div style={{ fontSize: 15, fontWeight: 600 }}>Drop your file here or click to browse</div>
                    <input ref={fileRef} type="file" hidden onChange={handleFileUpload} />
                  </div>
                )}
                {activeTab === 'huggingface' && (
                  <div className="flex gap-4" style={{ alignItems: 'flex-end' }}>
                    <div className="form-group flex-1">
                      <label className="form-label">Hugging Face URL</label>
                      <input className="form-input" value={hfUrl} onChange={e => setHfUrl(e.target.value)} />
                    </div>
                    <button className="btn btn-primary" onClick={handleHFImport}>Import</button>
                  </div>
                )}
                {activeTab === 'kaggle' && (
                  <div className="flex gap-4" style={{ alignItems: 'flex-end' }}>
                    <div className="form-group flex-1">
                      <label className="form-label">Kaggle ID</label>
                      <input className="form-input" value={kaggleUrl} onChange={e => setKaggleUrl(e.target.value)} />
                    </div>
                    <button className="btn btn-primary" onClick={handleKaggleImport}>Import</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="card animate-fade">
                  <div className="card-header">
                    <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Eye size={16} /> Data Preview: {dataset.name}
                    </div>
                  </div>
                  {dataset.format === 'mp3' || dataset.format === 'wav' ? (
                    <div style={{ padding: '32px', textAlign: 'center', background: 'var(--bg-tertiary)' }}>
                      <Music size={48} color="var(--accent)" style={{ marginBottom: 16, opacity: 0.5 }} />
                      <audio controls src={dataset.fileUrl} style={{ width: '100%', maxWidth: 500 }} />
                      <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-tertiary)' }}>Audio Dataset Preview</div>
                    </div>
                  ) : dataset.format === 'mp4' || dataset.format === 'mov' ? (
                    <div style={{ padding: '12px', background: 'black', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', overflow: 'hidden' }}>
                      <video controls src={dataset.fileUrl} style={{ width: '100%', display: 'block' }} />
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto', maxHeight: 400 }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            {dataset.columns.map(c => <th key={c.name}>{c.name}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {dataset.rows.map((row, i) => (
                            <tr key={row.id || i}>
                              <td style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>{i + 1}</td>
                              <td style={{ fontSize: 12 }}>{row.text}</td>
                              <td style={{ fontSize: 12 }}>{row.label}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="grid-2" style={{ gridTemplateColumns: '1fr 300px' }}>
                  <div className="card">
                    <div className="card-title" style={{ marginBottom: 16 }}>Cleaning Tools</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {DEFAULT_SUGGESTIONS.map(a => {
                        const applied = cleaningApplied.includes(a.id);
                        const suggestion = dataset.suggestions?.find(s => s.action === a.id);
                        
                        // Hide suggestion if quality is high and it's not applied
                        if (qualityScore >= 95 && !applied) return null;

                        return (
                          <div key={a.id} style={{ 
                            display: 'flex', alignItems: 'center', gap: 12, 
                            padding: '12px', background: applied ? 'rgba(16,185,129,0.05)' : 'var(--bg-tertiary)', 
                            borderRadius: 'var(--radius-md)',
                            border: applied ? '1px solid rgba(16,185,129,0.1)' : '1px solid var(--border)',
                          }}>
                            <a.icon size={16} color={applied ? 'var(--success)' : `var(--${a.severity})`} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>{a.label}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                                {applied ? '✓ Optimized' : (suggestion?.description || a.desc)}
                              </div>
                            </div>
                            {!applied ? (
                              <button className="btn btn-sm btn-secondary" onClick={() => applyCleaning(a.id)}>Apply</button>
                            ) : (
                              <span className="badge badge-success">Applied</span>
                            )}
                          </div>
                        );
                      })}
                      {qualityScore >= 95 && (
                        <div style={{ textAlign: 'center', padding: '16px', color: 'var(--success)', fontSize: 13, fontWeight: 600 }}>
                          ✨ Dataset is optimized!
                        </div>
                      )}
                      <button className="btn btn-primary w-full" 
                        onClick={() => applyCleaning(DEFAULT_SUGGESTIONS.map(a => a.id))}
                        disabled={loading || qualityScore >= 95}>
                        {loading ? 'Cleaning...' : 'Apply All'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="card" style={{ textAlign: 'center' }}>
                    <div className="card-title" style={{ marginBottom: 16 }}>Quality Score</div>
                    <QualityGauge score={qualityScore} />
                    {qualityScore >= 80 && (
                      <button className="btn btn-primary w-full mt-4" onClick={() => window.location.href = '/training'}>
                        Ready to Train <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>


        {/* Empty State */}
        {!dataset && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Database size={28} />
            </div>
            <h3>No Datasets Yet</h3>
            <p>Upload a file, paste a Hugging Face URL, or connect Kaggle to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

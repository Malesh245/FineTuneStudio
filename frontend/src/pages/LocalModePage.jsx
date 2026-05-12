import { useState } from 'react';
import { Shield, Wifi, WifiOff, HardDrive, CheckCircle2, Lock, Server, Globe, AlertTriangle } from 'lucide-react';

export default function LocalModePage() {
  const [offlineMode, setOfflineMode] = useState(false);
  const [localStoragePath, setLocalStoragePath] = useState('./models');
  const [downloadedModels, setDownloadedModels] = useState([
    { name: 'DistilGPT-2', size: '0.3 GB', status: 'downloaded' },
    { name: 'GPT-2', size: '0.5 GB', status: 'downloaded' },
  ]);
  const [downloading, setDownloading] = useState('');

  const handleDownload = (modelName) => {
    setDownloading(modelName);
    setTimeout(() => {
      setDownloadedModels(prev => [...prev, { name: modelName, size: '1.2 GB', status: 'downloaded' }]);
      setDownloading('');
    }, 2000);
  };

  const availableForDownload = [
    { name: 'Llama 3.2 1B', size: '2.1 GB' },
    { name: 'Gemma 2B', size: '4.3 GB' },
    { name: 'Phi-2', size: '5.6 GB' },
    { name: 'Flan-T5 Small', size: '0.3 GB' },
  ].filter(m => !downloadedModels.find(d => d.name === m.name));

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Privacy & Local Mode</h2>
            <p>Run everything offline — your data never leaves your machine</p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px',
            borderRadius: 20, fontSize: 12, fontWeight: 700,
            background: offlineMode ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            color: offlineMode ? '#10b981' : '#ef4444',
            border: `1px solid ${offlineMode ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          }}>
            {offlineMode ? <WifiOff size={14} /> : <Wifi size={14} />}
            {offlineMode ? 'OFFLINE MODE' : 'ONLINE MODE'}
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Toggle Card */}
        <div className="card mb-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: offlineMode ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
              }}>
                {offlineMode ? <Shield size={24} color="#10b981" /> : <Globe size={24} color="#6366f1" />}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>
                  {offlineMode ? 'Air-Gapped Mode Active' : 'Connected to Cloud'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  {offlineMode ? 'No network requests. All processing is local.' : 'Models can be downloaded from HuggingFace Hub.'}
                </div>
              </div>
            </div>
            <button className={`btn ${offlineMode ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => setOfflineMode(!offlineMode)}>
              {offlineMode ? 'Go Online' : 'Go Offline'}
            </button>
          </div>
        </div>

        <div className="grid-2" style={{ gap: 20 }}>
          {/* Downloaded Models */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <HardDrive size={16} /> Local Model Cache
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {downloadedModels.map(m => (
                <div key={m.name} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', borderRadius: 8, background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={14} color="var(--success)" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{m.size}</div>
                    </div>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: 9 }}>Ready</span>
                </div>
              ))}

              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="form-label" style={{ fontSize: 11 }}>Storage Path</label>
                <input className="form-input" value={localStoragePath}
                  onChange={e => setLocalStoragePath(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Download More */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Server size={16} /> Available for Download
            </div>
            {offlineMode ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
                <WifiOff size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                <p style={{ fontSize: 12 }}>Go online to download more models</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {availableForDownload.map(m => (
                  <div key={m.name} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', borderRadius: 8, background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{m.size}</div>
                    </div>
                    <button className="btn btn-sm btn-secondary" onClick={() => handleDownload(m.name)}
                      disabled={downloading === m.name}>
                      {downloading === m.name ? 'Downloading...' : 'Download'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Compliance */}
        <div className="card mt-6" style={{ marginTop: 20 }}>
          <div className="card-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lock size={16} /> Privacy & Compliance
          </div>
          <div className="grid-3" style={{ gap: 16 }}>
            {[
              { label: 'HIPAA Ready', desc: 'No PHI leaves your infrastructure', active: offlineMode },
              { label: 'GDPR Compliant', desc: 'All data stays within your jurisdiction', active: offlineMode },
              { label: 'SOC 2', desc: 'Enterprise-grade audit trails', active: true },
            ].map(c => (
              <div key={c.label} style={{
                padding: 16, borderRadius: 8, textAlign: 'center',
                background: c.active ? 'rgba(16,185,129,0.05)' : 'var(--bg-tertiary)',
                border: `1px solid ${c.active ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
              }}>
                {c.active ? <CheckCircle2 size={20} color="#10b981" /> : <AlertTriangle size={20} color="var(--text-tertiary)" />}
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 8 }}>{c.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

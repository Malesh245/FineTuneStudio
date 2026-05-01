import { useState } from 'react';
import {
  Rocket, CheckCircle2, Loader2, ExternalLink, Copy,
  Globe, Shield, Link2, Sparkles
} from 'lucide-react';

export default function DeployPage() {
  const [status, setStatus] = useState('idle'); // idle | deploying | live
  const [repoName, setRepoName] = useState('my-finetuned-model');
  const [hfUsername, setHfUsername] = useState('');
  const [hfToken, setHfToken] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState('');

  const deploy = async () => {
    if (!hfUsername.trim() || !hfToken.trim()) {
      setError('Hugging Face Username and Read/Write Token are required.');
      return;
    }
    setError('');
    setStatus('deploying');
    
    try {
      // Simulate/Call backend deployment
      const res = await fetch('http://localhost:8000/api/deployment/hf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_id: `${hfUsername}/${repoName}`,
          token: hfToken,
          is_private: isPrivate
        })
      });
      
      if (res.ok) {
        setStatus('live');
      } else {
        setError('Deployment failed. Please check your token and repository permissions.');
        setStatus('idle');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      setStatus('idle');
    }
  };

  const hfUrl = `https://huggingface.co/${hfUsername || 'username'}/${repoName}`;
  const apiUrl = `https://api-inference.huggingface.co/models/${hfUsername || 'username'}/${repoName}`;

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h2>Deploy to Hugging Face</h2>
        <p>Push your fine-tuned model to Hugging Face Hub with one click</p>
      </div>

      <div className="page-content">
        {status === 'idle' && (
          <>
            <div className="card mb-6">
              <div className="card-header">
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Rocket size={16} /> Deployment Configuration
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                 <div className="form-group">
                  <label className="form-label">Repository Name</label>
                  <input className="form-input" value={repoName}
                    onChange={e => setRepoName(e.target.value)}
                    placeholder="e.g., my-finetuned-llama" />
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                    Will be published as: huggingface.co/{hfUsername || 'your-username'}/{repoName}
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">HF Username</label>
                    <input className="form-input" value={hfUsername}
                      onChange={e => setHfUsername(e.target.value)}
                      placeholder="Your HF Username" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">HF Write Token</label>
                    <input className="form-input" type="password" value={hfToken}
                      onChange={e => setHfToken(e.target.value)}
                      placeholder="hf_..." />
                  </div>
                </div>

                {error && (
                  <div style={{ color: 'var(--danger)', fontSize: 12, background: 'rgba(239,68,68,0.05)', padding: 12, borderRadius: 8 }}>
                    ⚠️ {error}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    cursor: 'pointer', fontSize: 14
                  }}>
                    <input type="checkbox" checked={isPrivate}
                      onChange={e => setIsPrivate(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
                    <Shield size={14} /> Make repository private
                  </label>
                </div>

                <div style={{
                  background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                  padding: 16, border: '1px solid var(--border)'
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>What will be uploaded:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                    {['Model weights (adapter_model.safetensors)', 'Configuration (config.json)',
                      'Tokenizer files', 'Training metrics & README', 'Model card with training details'
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircle2 size={13} color="var(--success)" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button className="btn btn-primary btn-lg" onClick={deploy}>
                <Rocket size={18} /> Deploy to Hugging Face
              </button>
            </div>
          </>
        )}

        {status === 'deploying' && (
          <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <Loader2 size={48} color="var(--accent)" className="animate-spin" style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Deploying your model...</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
              Pushing weights, config, and tokenizer to Hugging Face Hub
            </div>
            <div className="progress-bar" style={{ maxWidth: 400, margin: '0 auto' }}>
              <div className="progress-bar-fill" style={{ width: '60%', animation: 'pulse 1.5s infinite' }} />
            </div>
          </div>
        )}

        {status === 'live' && (
          <div className="animate-fade">
            <div className="card mb-6" style={{
              textAlign: 'center', padding: '40px 24px',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(99,102,241,0.06) 100%)',
              borderColor: 'rgba(16,185,129,0.2)',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'var(--success-bg)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <CheckCircle2 size={32} color="var(--success)" />
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                🎉 Model Deployed Successfully!
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Your fine-tuned model is now live on Hugging Face
              </div>
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="card-title" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Globe size={16} /> Model Repository
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'var(--bg-tertiary)', padding: '10px 14px',
                  borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)',
                  fontSize: 12.5, border: '1px solid var(--border)',
                }}>
                  <span style={{ flex: 1, color: 'var(--accent)' }}>{hfUrl}</span>
                  <button className="btn btn-icon btn-ghost" onClick={() => navigator.clipboard.writeText(hfUrl)}>
                    <Copy size={14} />
                  </button>
                  <a href={hfUrl} target="_blank" rel="noopener" className="btn btn-icon btn-ghost">
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              <div className="card">
                <div className="card-title" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Link2 size={16} /> Inference API
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'var(--bg-tertiary)', padding: '10px 14px',
                  borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)',
                  fontSize: 11, border: '1px solid var(--border)',
                }}>
                  <span style={{ flex: 1, color: 'var(--success)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {apiUrl}
                  </span>
                  <button className="btn btn-icon btn-ghost" onClick={() => navigator.clipboard.writeText(apiUrl)}>
                    <Copy size={14} />
                  </button>
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-tertiary)' }}>
                  Use this endpoint to run inference on your deployed model via API.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

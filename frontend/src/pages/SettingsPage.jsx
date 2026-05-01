import { useState } from 'react';
import { Settings, Key, User, Save, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const [hfToken, setHfToken] = useState('');
  const [kaggleUser, setKaggleUser] = useState('');
  const [kaggleKey, setKaggleKey] = useState('');
  const [showHf, setShowHf] = useState(false);
  const [showKg, setShowKg] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h2>Settings</h2>
        <p>Configure your API keys and account preferences</p>
      </div>

      <div className="page-content" style={{ maxWidth: 640 }}>
        {/* Profile */}
        <div className="card mb-6">
          <div className="card-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={16} /> Profile
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input className="form-input" defaultValue="Malesh Kumar" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" defaultValue="malesh@example.com" type="email" />
            </div>
          </div>
        </div>

        {/* HF Token */}
        <div className="card mb-6">
          <div className="card-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Key size={16} /> Hugging Face Token
          </div>
          <div className="form-group">
            <label className="form-label">API Token (Write Access)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-input flex-1"
                type={showHf ? 'text' : 'password'}
                value={hfToken}
                onChange={e => setHfToken(e.target.value)}
                placeholder="hf_xxxxxxxxxxxxxxxxxxxx" />
              <button className="btn btn-icon btn-secondary" onClick={() => setShowHf(!showHf)}>
                {showHf ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
              Get your token at <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener">
                huggingface.co/settings/tokens
              </a>
            </div>
            <div style={{ 
              marginTop: 12, padding: 12, background: 'rgba(99,102,241,0.05)', 
              borderRadius: 8, border: '1px solid rgba(99,102,241,0.1)', fontSize: 11.5
            }}>
              <span style={{ fontWeight: 700, color: 'var(--accent)', display: 'block', marginBottom: 4 }}>Why is this required?</span>
              The token acts as a secure "digital key." It allows FineTuneStudio to create a private repository and upload your model weights to your Hugging Face account automatically after training.
            </div>
          </div>
        </div>

        {/* Kaggle */}
        <div className="card mb-6">
          <div className="card-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Key size={16} /> Kaggle Credentials
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" value={kaggleUser}
                onChange={e => setKaggleUser(e.target.value)}
                placeholder="your-kaggle-username" />
            </div>
            <div className="form-group">
              <label className="form-label">API Key</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input flex-1"
                  type={showKg ? 'text' : 'password'}
                  value={kaggleKey}
                  onChange={e => setKaggleKey(e.target.value)}
                  placeholder="xxxxxxxxxxxxxxxxxxxx" />
                <button className="btn btn-icon btn-secondary" onClick={() => setShowKg(!showKg)}>
                  {showKg ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={save}>
          {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Save size={14} /> Save Settings</>}
        </button>
      </div>
    </div>
  );
}

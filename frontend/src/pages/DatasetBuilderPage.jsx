import { useState } from 'react';
import { PenTool, Plus, Trash2, Save, Download, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EMPTY_PAIR = { instruction: '', input: '', output: '' };

export default function DatasetBuilderPage() {
  const [name, setName] = useState('My Custom Dataset');
  const [format, setFormat] = useState('alpaca');
  const [pairs, setPairs] = useState([{ ...EMPTY_PAIR }, { ...EMPTY_PAIR }]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { token } = useAuth();

  const addPair = () => setPairs([...pairs, { ...EMPTY_PAIR }]);

  const removePair = (i) => {
    if (pairs.length <= 1) return;
    setPairs(pairs.filter((_, idx) => idx !== i));
  };

  const updatePair = (i, field, value) => {
    const n = [...pairs];
    n[i][field] = value;
    setPairs(n);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('http://localhost:8000/api/builder/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, format, pairs }),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleExport = () => {
    const formatted = pairs.map(p => ({
      instruction: p.instruction, input: p.input, output: p.output
    }));
    const blob = new Blob([JSON.stringify(formatted, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${name.replace(/ /g, '_')}.json`; a.click();
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Visual Dataset Builder</h2>
            <p>Create instruction-tuning datasets visually — no coding required</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={handleExport}>
              <Download size={14} /> Export JSON
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saved ? <><CheckCircle2 size={14} /> Saved!</> :
               saving ? 'Saving...' : <><Save size={14} /> Save Dataset</>}
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Config */}
        <div className="card mb-6">
          <div className="grid-2" style={{ gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Dataset Name</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Output Format</label>
              <select className="form-input" value={format} onChange={e => setFormat(e.target.value)}>
                <option value="alpaca">Alpaca (instruction/input/output)</option>
                <option value="sharegpt">ShareGPT (conversations)</option>
                <option value="chatml">ChatML (messages)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Instruction Pairs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {pairs.map((p, i) => (
            <div key={i} className="card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-glow)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: 'var(--accent)'
                  }}>{i + 1}</div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Training Pair</span>
                </div>
                <button className="btn btn-icon btn-ghost btn-sm" onClick={() => removePair(i)}>
                  <Trash2 size={14} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11, color: '#6366f1' }}>👤 User Instruction</label>
                  <textarea className="form-input" rows={2} placeholder="e.g., Explain quantum computing in simple terms..."
                    value={p.instruction} onChange={e => updatePair(i, 'instruction', e.target.value)}
                    style={{ resize: 'vertical', minHeight: 60 }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 11, color: '#10b981' }}>🤖 Expected Response</label>
                  <textarea className="form-input" rows={3} placeholder="e.g., Quantum computing uses qubits instead of bits..."
                    value={p.output} onChange={e => updatePair(i, 'output', e.target.value)}
                    style={{ resize: 'vertical', minHeight: 80 }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="btn btn-secondary w-full" onClick={addPair} style={{ marginTop: 16 }}>
          <Plus size={16} /> Add Training Pair
        </button>

        {/* Stats */}
        <div className="card mt-6" style={{ marginTop: 24 }}>
          <div className="grid-3">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)' }}>{pairs.length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Total Pairs</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)' }}>
                {pairs.filter(p => p.instruction && p.output).length}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Complete</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--warning)' }}>
                {pairs.filter(p => !p.instruction || !p.output).length}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Incomplete</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

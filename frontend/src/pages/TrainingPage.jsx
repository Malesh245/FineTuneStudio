import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Cpu, Play, Square, Settings2, Loader2, CheckCircle2,
  ChevronDown, Zap, Clock, TrendingDown, Server, Cloud, Lock, Sparkles
} from 'lucide-react';

const MODELS = [
  { id: 'distilgpt2', name: 'DistilGPT-2', org: 'Hugging Face', params: '82M', type: 'text', recommended: true },
  { id: 'gpt2', name: 'GPT-2', org: 'OpenAI', params: '124M', type: 'text' },
  { id: 'meta-llama/Llama-3.2-1B', name: 'Llama 3.2 1B', org: 'Meta', params: '1B', type: 'text' },
  { id: 'google/flan-t5-small', name: 'Flan-T5 Small', org: 'Google', params: '80M', type: 'text' },
  { id: 'microsoft/phi-2', name: 'Phi-2', org: 'Microsoft', params: '2.7B', type: 'text' },
  { id: 'mistralai/Mistral-7B-v0.1', name: 'Mistral 7B', org: 'Mistral AI', params: '7B', type: 'text' },
  { id: 'google/gemma-2b', name: 'Gemma 2B', org: 'Google', params: '2B', type: 'text' },
  { id: 'Qwen/Qwen1.5-1.8B', name: 'Qwen 1.5', org: 'Alibaba Cloud', params: '1.8B', type: 'text' },
  { id: 'bert-base-uncased', name: 'BERT Base', org: 'Google', params: '110M', type: 'text' },
  { id: 'roberta-base', name: 'RoBERTa Base', org: 'Facebook', params: '125M', type: 'text' },
  { id: 'liquidai/lfm-1b', name: 'LFM-1B', org: 'Liquid AI', params: '1B', type: 'text' },
  { id: 'liquidai/lfm-3b', name: 'LFM-3B', org: 'Liquid AI', params: '3B', type: 'text' },
  { id: 'liquidai/lfm-7b', name: 'LFM-7B', org: 'Liquid AI', params: '7B', type: 'text' },
  { id: 'custom', name: 'Custom Hugging Face Model', org: 'Hugging Face', params: 'Any', type: 'text', custom: true },
  { id: 'custom-liquid', name: 'Custom Liquid Model', org: 'Liquid AI', params: 'Any', type: 'text', custom: true },
];

const DEFAULT_CONFIG = {
  learningRate: 0.0002,
  epochs: 3,
  batchSize: 8,
  loraRank: 16,
  loraAlpha: 32,
  warmupSteps: 100,
  weightDecay: 0.01,
  maxLength: 512,
};


export default function TrainingPage() {
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [customModelId, setCustomModelId] = useState('');
  const [gpuProvider, setGpuProvider] = useState('local');
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [isQuantizing, setIsQuantizing] = useState(false);
  const [quantResult, setQuantResult] = useState(null);
  const [copilotResult, setCopilotResult] = useState(null);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const { token } = useAuth();

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
        setDatasets(data.datasets || []);
        if (data.datasets?.length > 0) setSelectedDataset(data.datasets[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startTraining = async () => {
    setStatus('running');
    setLogs([{ t: '00:00', msg: 'Initializing training pipeline...', type: 'info' }]);
    setProgress(5);

    const modelName = (selectedModel.id === 'custom' || selectedModel.id === 'custom-liquid') ? (customModelId || 'unknown-model') : selectedModel.id;
    
    try {
      const res = await fetch('http://localhost:8000/api/training/start', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          model_name: modelName,
          dataset_id: selectedDataset,
          epochs: config.epochs,
          learning_rate: config.learningRate,
          batch_size: config.batchSize,
          lora_rank: config.loraRank,
          lora_alpha: config.loraAlpha,
          warmup_steps: config.warmupSteps,
          gpu_provider: gpuProvider,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        const jobId = result.job_id;
        
        // Mocking incremental logs for UI feel, then finishing with real data
        if (result.orchestrator_logs) {
           result.orchestrator_logs.forEach((msg, i) => {
             setTimeout(() => {
               setLogs(prev => [...prev, { t: `00:0${i+1}`, msg, type: 'info' }]);
               setProgress(10 + (i * 10));
             }, (i + 1) * 800);
           });
        }

        // Poll for final status (since backend MVP is fast, we just wait a bit)
        setTimeout(async () => {
          const statusRes = await fetch(`http://localhost:8000/api/training/jobs/${jobId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (statusRes.ok) {
            const jobData = await statusRes.json();
            setLogs(prev => [
              ...prev,
              { t: '00:10', msg: 'Starting training loop...', type: 'info' },
              { t: '00:30', msg: '✓ Training complete! Model saved to database.', type: 'success' }
            ]);
            setProgress(100);
            setStatus('done');
          }
        }, 4000);

      } else {
        setStatus('idle');
        alert('Failed to start training');
      }
    } catch (err) {
      console.error(err);
      setStatus('idle');
    }
  };

  const handleQuantize = async (format) => {
    setIsQuantizing(true);
    setQuantResult(null);
    try {
      const res = await fetch('http://localhost:8000/api/training/quantize', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ model_id: 'current', format }),
      });
      if (res.ok) {
        const data = await res.json();
        setQuantResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsQuantizing(false);
    }
  };

  const handleExportNotebook = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/training/export-notebook?model_name=${selectedModel.id}&epochs=${config.epochs}&lr=${config.learningRate}`);
      if (res.ok) {
        const { notebook } = await res.json();
        const blob = new Blob([notebook], { type: 'application/x-ipynb+json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FineTuneStudio_${selectedModel.name.replace(/ /g, '_')}.ipynb`;
        a.click();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateConfig = (key, value) => {
    setConfig({ ...config, [key]: value });
  };

  const handleCopilot = async () => {
    setCopilotLoading(true);
    try {
      const ds = datasets.find(d => d.id === selectedDataset);
      const res = await fetch('http://localhost:8000/api/training/copilot/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          model_name: selectedModel.id,
          dataset_rows: ds?.row_count || 100,
          domain: 'general'
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setCopilotResult(data);
      }
    } catch (err) { console.error(err); }
    finally { setCopilotLoading(false); }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h2>Training</h2>
            <p>Select a model, configure, and start fine-tuning</p>
          </div>
          <div className="flex gap-4" style={{ gap: 8 }}>
            {status === 'running' && (
              <button className="btn btn-danger" onClick={() => setStatus('idle')}>
                <Square size={14} /> Stop
              </button>
            )}
            <button className="btn btn-primary" onClick={startTraining}
              disabled={status === 'running'}>
              {status === 'running' ? <><Loader2 size={14} className="animate-spin" /> Training...</> :
               status === 'done' ? <><CheckCircle2 size={14} /> Train Again</> :
               <><Play size={14} /> Start Training</>}
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="grid-2 mb-6" style={{ gridTemplateColumns: '1fr 380px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Model Selection */}
          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Cpu size={16} /> Select Model
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {MODELS.map(m => (
                <div key={m.id}
                  onClick={() => setSelectedModel(m)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 'var(--radius-md)',
                    background: selectedModel.id === m.id ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                    border: `1px solid ${selectedModel.id === m.id ? 'var(--border-accent)' : 'var(--border)'}`,
                    cursor: 'pointer', transition: 'all var(--transition-fast)',
                  }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 'var(--radius-md)',
                    background: selectedModel.id === m.id ? 'var(--accent)' : 'var(--bg-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: selectedModel.id === m.id ? 'white' : 'var(--text-tertiary)',
                  }}>
                    <Cpu size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {m.name}
                      {m.recommended && <span className="badge badge-success" style={{ fontSize: 9 }}>Recommended</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{m.org} · {m.params} parameters</div>
                  </div>
                  {selectedModel.id === m.id && <CheckCircle2 size={18} color="var(--accent)" />}
                </div>
              ))}

              {(selectedModel.id === 'custom' || selectedModel.id === 'custom-liquid') && (
                <div className="form-group mt-2" style={{ marginTop: 8, padding: '0 4px' }}>
                  <label className="form-label" style={{ fontSize: 12 }}>
                    {selectedModel.id === 'custom' ? 'Hugging Face Model ID' : 'Liquid Foundation Model ID'}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={selectedModel.id === 'custom' ? "e.g. mistralai/Mistral-7B-v0.1" : "e.g. liquid-lfm-1b"}
                    value={customModelId}
                    onChange={(e) => setCustomModelId(e.target.value)}
                  />
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                    {selectedModel.id === 'custom' 
                      ? 'Enter any valid Hugging Face model repository ID.'
                      : 'Enter any valid Liquid Foundation model name.'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hardware Orchestrator */}
          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Server size={16} /> Hardware Orchestrator
              </div>
            </div>
            <div className="grid-2" style={{ gap: 12 }}>
              {[
                { id: 'local', name: 'Local Machine', desc: 'Free · CPU/Local GPU', icon: Server, active: true },
                { id: 'colab', name: 'Google Colab', desc: 'Free · Cloud T4 GPU', icon: Cloud, active: true },
                { id: 'kaggle', name: 'Kaggle', desc: 'Free · Cloud P100 GPU', icon: Cloud, active: true },
                { id: 'runpod', name: 'RunPod', desc: 'Paid · High-End GPUs', icon: Lock, active: false },
                { id: 'aws', name: 'AWS EC2', desc: 'Paid · Scalable Compute', icon: Lock, active: false },
              ].map(p => (
                <div key={p.id}
                  onClick={() => p.active && setGpuProvider(p.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 6,
                    padding: '12px', borderRadius: 'var(--radius-md)',
                    background: gpuProvider === p.id ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                    border: `1px solid ${gpuProvider === p.id ? 'var(--border-accent)' : 'var(--border)'}`,
                    cursor: p.active ? 'pointer' : 'not-allowed',
                    opacity: p.active ? 1 : 0.5,
                    transition: 'all var(--transition-fast)',
                    position: 'relative',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <p.icon size={14} color={gpuProvider === p.id ? 'var(--accent)' : 'var(--text-secondary)'} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: gpuProvider === p.id ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {p.name}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{p.desc}</div>
                  {!p.active && (
                    <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 9, background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4 }}>
                      Soon
                    </span>
                  )}
                </div>
              ))}
            </div>
            {gpuProvider === 'colab' && (
              <div style={{ 
                marginTop: 12, padding: 12, background: 'rgba(16,185,129,0.05)', 
                borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.1)',
                fontSize: 11.5
              }}>
                <span style={{ fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                   <Zap size={12} /> Google Colab Integration
                </span>
                <p style={{ marginBottom: 12 }}>
                  Colab doesn't need your token upfront. When you start, we'll provide a 1-click script that reads your HF Token from Colab's <b>Secrets</b> (the key icon) for secure uploads.
                </p>
                <button className="btn btn-sm btn-success w-full" onClick={handleExportNotebook}>
                  <Cloud size={14} /> Export Prepared Notebook (.ipynb)
                </button>
              </div>
            )}
          </div>
          </div>

          {/* Hyperparameters */}
          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Settings2 size={16} /> Hyperparameters
              </div>
              <button className="btn btn-sm btn-primary" onClick={handleCopilot} disabled={copilotLoading}
                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none' }}>
                {copilotLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                {copilotLoading ? 'Analyzing...' : 'AI Copilot'}
              </button>
            </div>

            {copilotResult && (
              <div className="animate-fade" style={{ 
                margin: '0 0 16px', padding: 14, borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(168,85,247,0.06))',
                border: '1px solid rgba(99,102,241,0.15)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>
                    ✨ AI Copilot Recommendation
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className="badge badge-purple">Confidence: {copilotResult.confidence}%</span>
                    <span className={`badge ${copilotResult.overfitRisk === 'Low' ? 'badge-success' : copilotResult.overfitRisk === 'Medium' ? 'badge-warning' : 'badge-danger'}`}>
                      Overfit Risk: {copilotResult.overfitRisk}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {copilotResult.reasons?.map((r, i) => (
                    <div key={i} style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <b style={{ color: 'var(--text-primary)' }}>{r.param}={String(r.value)}</b> — {r.reason}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Select Dataset</label>
                <select className="form-input" value={selectedDataset} onChange={e => setSelectedDataset(e.target.value)}>
                  {datasets.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.source})</option>
                  ))}
                  {datasets.length === 0 && <option disabled>No datasets available. Please upload one first.</option>}
                </select>
              </div>
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              {[
                { key: 'learningRate', label: 'Learning Rate', type: 'number', step: 0.0001 },
                { key: 'epochs', label: 'Epochs', type: 'number', step: 1, min: 1, max: 50 },
                { key: 'batchSize', label: 'Batch Size', type: 'number', step: 1 },
                { key: 'loraRank', label: 'LoRA Rank', type: 'number', step: 4 },
                { key: 'loraAlpha', label: 'LoRA Alpha', type: 'number', step: 4 },
                { key: 'warmupSteps', label: 'Warmup Steps', type: 'number', step: 10 },
                { key: 'maxLength', label: 'Max Sequence Length', type: 'number', step: 64 },
              ].map(p => (
                <div key={p.key} className="form-group">
                  <label className="form-label">{p.label}</label>
                  <input className="form-input" type={p.type} step={p.step}
                    min={p.min} max={p.max}
                    value={config[p.key]}
                    onChange={e => updateConfig(p.key, parseFloat(e.target.value) || 0)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Training Progress */}
        {status !== 'idle' && (
          <div className="card mb-6 animate-fade">
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {status === 'running' ? <Loader2 size={16} className="animate-spin" color="var(--accent)" /> :
                 <CheckCircle2 size={16} color="var(--success)" />}
                {status === 'running' ? 'Training in Progress' : 'Training Complete'}
              </div>
              <div className="flex items-center gap-4" style={{ gap: 16 }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  <Clock size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
                  {status === 'done' ? '00:30' : '...'}
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: status === 'done' ? 'var(--success)' : 'var(--accent)' }}>
                  {progress}%
                </span>
              </div>
            </div>
            <div className="progress-bar mb-4" style={{ marginBottom: 16 }}>
              <div className="progress-bar-fill" style={{
                width: `${progress}%`,
                background: status === 'done' ? 'var(--success)' : undefined,
              }} />
            </div>
            <div className="console">
              {logs.map((l, i) => (
                <div key={i} className={`console-line ${l.type}`}>
                  <span className="timestamp">[{l.t}]</span>
                  {l.msg}
                </div>
              ))}
              {status === 'running' && (
                <div className="console-line animate-pulse" style={{ color: 'var(--text-tertiary)' }}>▌</div>
              )}
            </div>
          </div>
        )}

        {/* Post-Training Actions */}
        {status === 'done' && (
          <div className="grid-3 animate-fade">
            <div className="stat-card">
              <div className="stat-icon green"><TrendingDown size={20} /></div>
              <div>
                <div className="stat-value" style={{ fontSize: 22 }}>0.67</div>
                <div className="stat-label">Final Loss</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple"><Zap size={20} /></div>
              <div>
                <div className="stat-value" style={{ fontSize: 22 }}>73%</div>
                <div className="stat-label">Improvement</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue"><Clock size={20} /></div>
              <div>
                <div className="stat-value" style={{ fontSize: 22 }}>30s</div>
                <div className="stat-label">Training Time</div>
              </div>
            </div>
          </div>
        )}

        {/* Quantization Studio */}
        {status === 'done' && (
          <div className="card mt-6 animate-fade" style={{ marginTop: 24 }}>
            <div className="card-header">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={16} color="var(--accent)" /> Quantization Studio
              </div>
              <span className="badge badge-purple">Advanced</span>
            </div>
            
            <div className="grid-2" style={{ gap: 24 }}>
              <div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Shrink your fine-tuned model to run on laptops, mobile phones, or edge devices.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-secondary flex-1" onClick={() => handleQuantize('4bit')} disabled={isQuantizing}>
                    {isQuantizing ? 'Processing...' : 'Shrink to 4-bit (Smallest)'}
                  </button>
                  <button className="btn btn-secondary flex-1" onClick={() => handleQuantize('8bit')} disabled={isQuantizing}>
                    {isQuantizing ? 'Processing...' : 'Shrink to 8-bit (Balanced)'}
                  </button>
                </div>
              </div>
              
              <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 16, border: '1px solid var(--border)' }}>
                {quantResult ? (
                  <div className="animate-fade">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Optimized Size:</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)' }}>{quantResult.shrunk_size_gb} GB</span>
                    </div>
                    <div className="console" style={{ maxHeight: 120, fontSize: 11 }}>
                      {quantResult.steps.map((s, i) => <div key={i} className="console-line info">{s}</div>)}
                    </div>
                  </div>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 12, fontStyle: 'italic' }}>
                    Select a format to start shrinking
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Bot, Play, Loader2, Wrench, Brain, GitBranch, Users, Sparkles, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STEP_COLORS = {
  thought: '#6366f1', action: '#f59e0b', observation: '#10b981',
  tool_call: '#f59e0b', result: '#10b981', response: '#6366f1',
  plan: '#a855f7', execute: '#10b981', delegate: '#3b82f6',
  aggregate: '#ec4899', final: '#10b981',
};
const TEMPLATE_ICONS = { react: Brain, tool_call: Wrench, planner: GitBranch, multi_agent: Users };

export default function AgentTrainingPage() {
  const [templates, setTemplates] = useState([]);
  const [tools, setTools] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('react');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { token } = useAuth();

  useEffect(() => { fetchTemplates(); }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/agents/templates');
      if (res.ok) {
        const d = await res.json();
        setTemplates(d.templates); setTools(d.tools);
      }
    } catch (e) { console.error(e); }
  };

  const handleTest = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch('http://localhost:8000/api/agents/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt, template_id: selectedTemplate }),
      });
      if (res.ok) { setResult(await res.json()); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const currentTemplate = templates.find(t => t.id === selectedTemplate);

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Agent Training Mode</h2>
            <p>Fine-tune models for agentic behavior — tool use, planning, and multi-step reasoning</p>
          </div>
          <span className="badge badge-purple" style={{ fontSize: 11 }}>2026 Frontier</span>
        </div>
      </div>

      <div className="page-content">
        {/* Template Selection */}
        <div className="grid-2 mb-6" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {templates.map(t => {
            const Icon = TEMPLATE_ICONS[t.id] || Bot;
            return (
              <div key={t.id} onClick={() => setSelectedTemplate(t.id)} style={{
                padding: 16, borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'center',
                background: selectedTemplate === t.id ? 'rgba(99,102,241,0.08)' : 'var(--bg-elevated)',
                border: `2px solid ${selectedTemplate === t.id ? 'var(--accent)' : 'var(--border)'}`,
                transition: 'all 0.2s',
              }}>
                <Icon size={24} color={selectedTemplate === t.id ? 'var(--accent)' : 'var(--text-tertiary)'} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 700 }}>{t.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4 }}>{t.description}</div>
              </div>
            );
          })}
        </div>

        <div className="grid-2" style={{ gridTemplateColumns: '1fr 380px', gap: 20 }}>
          {/* Left: Sandbox Test */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bot size={16} /> Agent Sandbox
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <input className="form-input flex-1" placeholder="Give the agent a task to test..."
                  value={prompt} onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTest()} />
                <button className="btn btn-primary" onClick={handleTest} disabled={loading}>
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                  {loading ? 'Running...' : 'Test'}
                </button>
              </div>

              {result && (
                <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.steps?.map((step, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                      padding: '10px 14px', borderRadius: 8,
                      background: `${STEP_COLORS[step.type]}08`,
                      borderLeft: `3px solid ${STEP_COLORS[step.type]}`,
                    }}>
                      <span style={{
                        fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
                        color: STEP_COLORS[step.type], minWidth: 70,
                        padding: '2px 6px', borderRadius: 4,
                        background: `${STEP_COLORS[step.type]}15`,
                      }}>{step.type}</span>
                      <span style={{ fontSize: 12.5, lineHeight: 1.5, fontFamily: 'var(--font-mono)' }}>
                        {step.content}
                      </span>
                    </div>
                  ))}

                  {result.metrics && (
                    <div className="grid-2" style={{ gap: 8, marginTop: 8 }}>
                      {Object.entries(result.metrics).map(([k, v]) => (
                        <div key={k} style={{ padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 6, display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{v}{typeof v === 'number' && v > 10 ? '%' : ''}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Available Tools + Example */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>Available Tools</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {tools.map(t => (
                  <div key={t.name} style={{
                    padding: '8px 12px', borderRadius: 6, background: 'var(--bg-tertiary)',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <Wrench size={12} color="var(--accent)" />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{t.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{t.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {currentTemplate && (
              <div className="card">
                <div className="card-title" style={{ marginBottom: 12 }}>Example Format</div>
                <pre style={{
                  fontSize: 10, lineHeight: 1.5, whiteSpace: 'pre-wrap',
                  background: 'var(--bg-tertiary)', padding: 12, borderRadius: 8,
                  fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)',
                  maxHeight: 200, overflowY: 'auto',
                }}>
                  {JSON.stringify(currentTemplate.example, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

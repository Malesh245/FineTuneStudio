import { useState } from 'react';
import { MessageCircle, Send, Settings2, Trash2, Sliders } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PlaygroundPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful, fine-tuned AI assistant.');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(256);
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(true);
  const { token } = useAuth();

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/playground/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          prompt: input,
          system_prompt: systemPrompt,
          temperature,
          max_tokens: maxTokens,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.response, tokens: data.tokens_used }]);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="animate-fade" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Inference Playground</h2>
            <p>Chat with your fine-tuned model in real-time</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowConfig(!showConfig)}>
              <Sliders size={14} /> {showConfig ? 'Hide' : 'Show'} Config
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setMessages([])}>
              <Trash2 size={14} /> Clear
            </button>
          </div>
        </div>
      </div>

      <div className="page-content" style={{ flex: 1, display: 'flex', gap: 20, minHeight: 0 }}>
        {/* Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 16 }}>
            {messages.length === 0 && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
                <div style={{ textAlign: 'center' }}>
                  <MessageCircle size={48} style={{ marginBottom: 16, opacity: 0.15 }} />
                  <p>Start chatting with your fine-tuned model</p>
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%', padding: '12px 16px', borderRadius: 16,
                  background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-tertiary)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                  fontSize: 13.5, lineHeight: 1.6, whiteSpace: 'pre-wrap',
                  border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                }}>
                  {msg.content}
                  {msg.tokens && (
                    <div style={{ fontSize: 10, opacity: 0.5, marginTop: 6, textAlign: 'right' }}>
                      {msg.tokens} tokens
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex' }}>
                <div className="card animate-pulse" style={{ padding: '12px 20px', fontSize: 13 }}>
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="card" style={{ padding: 12, display: 'flex', gap: 12 }}>
            <input className="form-input" value={input} onChange={e => setInput(e.target.value)}
              placeholder="Type your message..." style={{ flex: 1, border: 'none', background: 'transparent' }} />
            <button className="btn btn-primary btn-icon" type="submit" disabled={loading}>
              <Send size={16} />
            </button>
          </form>
        </div>

        {/* Config Panel */}
        {showConfig && (
          <div className="card" style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Settings2 size={16} /> Configuration
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 11 }}>System Prompt</label>
              <textarea className="form-input" rows={3} value={systemPrompt}
                onChange={e => setSystemPrompt(e.target.value)} style={{ resize: 'vertical', fontSize: 12 }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 11 }}>
                Temperature: <b>{temperature}</b>
              </label>
              <input type="range" min="0" max="2" step="0.1" value={temperature}
                onChange={e => setTemperature(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-tertiary)' }}>
                <span>Precise</span><span>Creative</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: 11 }}>Max Tokens</label>
              <input type="number" className="form-input" value={maxTokens}
                onChange={e => setMaxTokens(parseInt(e.target.value))} min={50} max={4096} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import {
  Database, Cpu, Rocket, TrendingUp, ArrowUpRight,
  Plus, Clock, CheckCircle2, AlertCircle, Loader2, Zap, Sparkles
} from 'lucide-react';

const stats = [
  { label: 'Datasets', value: '0', icon: Database, color: 'purple', change: null },
  { label: 'Training Jobs', value: '0', icon: Cpu, color: 'blue', change: null },
  { label: 'Deployed Models', value: '0', icon: Rocket, color: 'green', change: null },
  { label: 'Avg. Improvement', value: '—', icon: TrendingUp, color: 'amber', change: null },
];

const quickActions = [
  {
    icon: Database, title: 'Upload Dataset',
    desc: 'Import from CSV, JSON, Hugging Face, or Kaggle',
    path: '/datasets', gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
  },
  {
    icon: Cpu, title: 'Start Training',
    desc: 'Fine-tune a model with your custom dataset',
    path: '/training', gradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)'
  },
  {
    icon: Sparkles, title: 'Compare Models',
    desc: 'Test before vs after fine-tuning side by side',
    path: '/comparison', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)'
  },
];

const recentActivity = [
  { id: 1, type: 'info', message: 'Welcome to FineTuneStudio! Start by uploading a dataset.', time: 'Just now', icon: Sparkles },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h2>Dashboard</h2>
            <p>Welcome back! Your AI fine-tuning command center.</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/datasets')}>
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Stats */}
        <div className="stats-grid mb-6">
          {stats.map((s) => (
            <div className="stat-card" key={s.label}>
              <div className={`stat-icon ${s.color}`}>
                <s.icon size={20} />
              </div>
              <div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
                {s.change && (
                  <div className={`stat-change ${s.change > 0 ? 'up' : 'down'}`}>
                    <ArrowUpRight size={10} /> {s.change}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 12 }}>Quick Actions</h3>
          <div className="grid-3">
            {quickActions.map((a) => (
              <div
                key={a.title}
                className="card"
                style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                onClick={() => navigate(a.path)}
              >
                <div style={{
                  position: 'absolute', top: -20, right: -20,
                  width: 80, height: 80, borderRadius: '50%',
                  background: a.gradient, opacity: 0.08
                }} />
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-md)',
                  background: a.gradient, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginBottom: 12
                }}>
                  <a.icon size={20} color="white" />
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{a.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline Overview & Recent Activity */}
        <div className="grid-2">
          {/* Pipeline */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Fine-Tuning Pipeline</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { step: 1, label: 'Upload Dataset', status: 'pending', icon: Database },
                { step: 2, label: 'Clean & Preview', status: 'pending', icon: Zap },
                { step: 3, label: 'Select Model', status: 'pending', icon: Cpu },
                { step: 4, label: 'Fine-Tune', status: 'pending', icon: Loader2 },
                { step: 5, label: 'Compare Results', status: 'pending', icon: Sparkles },
                { step: 6, label: 'Deploy to HF', status: 'pending', icon: Rocket },
              ].map((p) => (
                <div key={p.step} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border)'
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: p.status === 'done' ? 'var(--success)' : 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: p.status === 'done' ? 'white' : 'var(--text-tertiary)'
                  }}>
                    {p.status === 'done' ? <CheckCircle2 size={14} /> : p.step}
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 500, flex: 1, color: 'var(--text-secondary)' }}>
                    {p.label}
                  </span>
                  <span className={`badge ${p.status === 'done' ? 'badge-success' : 'badge-purple'}`}>
                    {p.status === 'done' ? 'Done' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Recent Activity</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentActivity.map((a) => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '10px 12px', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)'
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-glow)', color: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <a.icon size={14} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{a.message}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                      <Clock size={10} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 4 }} />
                      {a.time}
                    </div>
                  </div>
                </div>
              ))}
              <div className="empty-state" style={{ padding: '30px 20px' }}>
                <p style={{ fontSize: 13 }}>Start a project to see activity here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Database, Cpu, GitCompare,
  BarChart3, Rocket, Settings, Zap, LogOut, BookOpen, Merge, PenTool, MessageCircle, FlaskConical, Shrink,
  Bot, Store, Shield, Image
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'PIPELINE', items: [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/datasets', icon: Database, label: 'Datasets' },
    { path: '/builder', icon: PenTool, label: 'Dataset Builder' },
    { path: '/training', icon: Cpu, label: 'Training' },
    { path: '/experiments', icon: FlaskConical, label: 'Experiments' },
  ]},
  { label: 'ANALYSIS', items: [
    { path: '/comparison', icon: GitCompare, label: 'Comparison' },
    { path: '/visualize', icon: BarChart3, label: 'Visualization' },
    { path: '/recipes', icon: BookOpen, label: 'Recipe Hub' },
    { path: '/fusion', icon: Merge, label: 'Fusion Lab' },
    { path: '/playground', icon: MessageCircle, label: 'Playground' },
    { path: '/distillation', icon: Shrink, label: 'Distillation' },
    { path: '/agents', icon: Bot, label: 'Agent Training' },
    { path: '/multimodal', icon: Image, label: 'Multi-Modal' },
  ]},
  { label: 'ECOSYSTEM', items: [
    { path: '/marketplace', icon: Store, label: 'Marketplace' },
    { path: '/local', icon: Shield, label: 'Privacy Mode' },
  ]},
  { label: 'SHIP', items: [
    { path: '/deploy', icon: Rocket, label: 'Deploy' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ]},
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Zap size={18} color="white" />
        </div>
        <div>
          <h1>FineTuneStudio</h1>
          <span>AI Model Platform</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <item.icon className="nav-icon" size={18} />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user ? (
          <div className="sidebar-user" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="sidebar-user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user.name || 'User'}</div>
                <div className="sidebar-user-plan">{user.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}</div>
              </div>
            </div>
            <button 
              onClick={logout}
              className="btn btn-icon btn-ghost"
              title="Logout"
              style={{ color: 'var(--text-tertiary)', padding: 4 }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

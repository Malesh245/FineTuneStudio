import { useState, useEffect } from 'react';
import { Store, Star, Download, Search, Filter, Tag, ArrowRight, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CATEGORY_COLORS = {
  Healthcare: '#ef4444', Coding: '#6366f1', Legal: '#f59e0b',
  Finance: '#10b981', Education: '#3b82f6', Lifestyle: '#a855f7', Creative: '#ec4899',
};

export default function MarketplacePage() {
  const [models, setModels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { token } = useAuth();

  useEffect(() => { fetchModels(); }, []);

  const fetchModels = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/marketplace/');
      if (res.ok) { const d = await res.json(); setModels(d.models); setCategories(d.categories); }
    } catch (e) { console.error(e); }
  };

  const filtered = models.filter(m => {
    const matchCat = activeCategory === 'All' || m.category === activeCategory;
    const matchSearch = !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Model Marketplace</h2>
            <p>Discover, share, and monetize fine-tuned AI models</p>
          </div>
          <button className="btn btn-primary">
            <TrendingUp size={14} /> Publish Your Model
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Search + Filter */}
        <div className="card mb-6" style={{ padding: '12px 20px', display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input className="form-input" placeholder="Search models by name, category, or use case..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ paddingLeft: 40 }} />
          </div>
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {categories.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)} className={`btn btn-sm ${activeCategory === c ? 'btn-primary' : 'btn-ghost'}`}
              style={activeCategory === c ? { background: CATEGORY_COLORS[c] || 'var(--accent)', border: 'none' } : {}}>
              {c}
            </button>
          ))}
        </div>

        {/* Models Grid */}
        <div className="grid-3" style={{ gap: 16 }}>
          {filtered.map(m => (
            <div key={m.id} className="card" style={{ display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="badge" style={{ background: `${CATEGORY_COLORS[m.category]}20`, color: CATEGORY_COLORS[m.category], fontSize: 10 }}>
                  {m.category}
                </span>
                <span style={{ fontSize: 13, fontWeight: 800, color: m.price === 'free' ? 'var(--success)' : 'var(--warning)' }}>
                  {m.price === 'free' ? 'Free' : m.price}
                </span>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{m.name}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, marginBottom: 12 }}>
                {m.description}
              </p>

              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                {m.tags.map(t => (
                  <span key={t} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 20, background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
                    {t}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-tertiary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Download size={11} /> {(m.downloads / 1000).toFixed(1)}K
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={11} fill="var(--warning)" color="var(--warning)" /> {m.stars}
                  </span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)' }}>{m.accuracy}% acc</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>by <b>@{m.author}</b></div>
                <button className="btn btn-sm btn-primary">
                  Use Model <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { BookOpen, Star, Copy, Search, Filter, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RecipeHubPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/recipes/');
      if (res.ok) {
        const data = await res.json();
        setRecipes(data.recipes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cloneRecipe = async (id) => {
    // In a real app, this would save to user's profile and redirect to Training with pre-filled config
    alert('Recipe cloned! Redirecting to Training with these optimized hyperparameters...');
    window.location.href = '/training';
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Community Recipe Hub</h2>
            <p>Discover and clone battle-tested training configurations</p>
          </div>
          <button className="btn btn-secondary">
            <Sparkles size={14} /> Submit a Recipe
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="card mb-6" style={{ padding: '12px 20px', display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input className="form-input" placeholder="Search by model, domain, or author..." style={{ paddingLeft: 40 }} />
          </div>
          <button className="btn btn-ghost" style={{ gap: 8 }}>
            <Filter size={14} /> Filter
          </button>
        </div>

        {loading ? (
          <div className="grid-3">
            {[1, 2, 3].map(i => <div key={i} className="card animate-pulse" style={{ height: 200 }} />)}
          </div>
        ) : (
          <div className="grid-3">
            {recipes.map(r => (
              <div key={r.id} className="card recipe-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span className="badge badge-purple">{r.model.split('/')[1] || r.model}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-tertiary)' }}>
                    <Star size={12} fill="var(--warning)" color="var(--warning)" /> {r.stars}
                  </div>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{r.name}</h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, marginBottom: 16 }}>
                  {r.description}
                </p>
                <div style={{ 
                  background: 'var(--bg-tertiary)', borderRadius: 8, padding: 10, 
                  fontSize: 11, fontFamily: 'var(--font-mono)', marginBottom: 16,
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8
                }}>
                  <div>LR: {r.config.learning_rate}</div>
                  <div>Rank: {r.config.lora_rank}</div>
                  <div>Epochs: {r.config.epochs}</div>
                  <div>Alpha: {r.config.lora_alpha}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>by <b>@{r.author}</b></div>
                  <button className="btn btn-sm btn-primary" onClick={() => cloneRecipe(r.id)}>
                    <Copy size={13} /> Clone
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

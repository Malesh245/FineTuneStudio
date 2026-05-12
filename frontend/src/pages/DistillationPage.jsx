import { useState, useEffect } from 'react';
import { ArrowRight, Zap, Loader2, CheckCircle2, Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DistillationPage() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [teacherId, setTeacherId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { token } = useAuth();

  useEffect(() => { fetchModels(); }, []);

  const fetchModels = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/distillation/models');
      if (res.ok) {
        const d = await res.json();
        setTeachers(d.teachers); setStudents(d.students);
        if (d.teachers.length) setTeacherId(d.teachers[0].id);
        if (d.students.length) setStudentId(d.students[0].id);
      }
    } catch (e) { console.error(e); }
  };

  const handleDistill = async () => {
    setLoading(true); setResult(null);
    try {
      const res = await fetch('http://localhost:8000/api/distillation/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ teacher_id: teacherId, student_id: studentId, dataset_rows: 1000 }),
      });
      if (res.ok) { setResult(await res.json()); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const teacher = teachers.find(t => t.id === teacherId);
  const student = students.find(s => s.id === studentId);

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h2>Knowledge Distillation Studio</h2>
        <p>Compress a large teacher model into a small, fast student model</p>
      </div>

      <div className="page-content">
        {/* Visual Pipeline */}
        <div className="card mb-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, justifyContent: 'center', padding: '30px 0' }}>
            {/* Teacher */}
            <div style={{
              flex: 1, maxWidth: 280, padding: 24, borderRadius: 16, textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))',
              border: '2px solid rgba(239,68,68,0.2)',
            }}>
              <Brain size={32} color="#ef4444" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 700, color: '#ef4444', marginBottom: 12 }}>Teacher (Large)</div>
              <select className="form-input" value={teacherId} onChange={e => setTeacherId(e.target.value)}
                style={{ textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.params})</option>)}
              </select>
              <div style={{ fontSize: 12, marginTop: 8, color: 'var(--text-tertiary)' }}>
                Quality: <b style={{ color: '#ef4444' }}>{teacher?.quality || 0}%</b>
              </div>
            </div>

            {/* Arrow */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <ArrowRight size={32} color="var(--accent)" />
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)' }}>DISTILL</div>
            </div>

            {/* Student */}
            <div style={{
              flex: 1, maxWidth: 280, padding: 24, borderRadius: 16, textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))',
              border: '2px solid rgba(16,185,129,0.2)',
            }}>
              <Zap size={32} color="#10b981" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 700, color: '#10b981', marginBottom: 12 }}>Student (Fast)</div>
              <select className="form-input" value={studentId} onChange={e => setStudentId(e.target.value)}
                style={{ textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.params})</option>)}
              </select>
              <div style={{ fontSize: 12, marginTop: 8, color: 'var(--text-tertiary)' }}>
                Speedup: <b style={{ color: '#10b981' }}>{student?.speedup || '—'}</b>
              </div>
            </div>
          </div>

          <button className="btn btn-primary btn-lg w-full" onClick={handleDistill} disabled={loading}
            style={{ background: 'linear-gradient(135deg, #ef4444, #6366f1, #10b981)', border: 'none' }}>
            {loading ? <><Loader2 size={18} className="animate-spin" /> Distilling...</> :
             <><Brain size={18} /> Start Knowledge Distillation</>}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="card animate-fade">
            <div style={{ textAlign: 'center', padding: 20, marginBottom: 20 }}>
              <CheckCircle2 size={48} color="var(--success)" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 18, fontWeight: 800 }}>Distillation Complete!</div>
            </div>
            <div className="grid-3" style={{ gap: 16, marginBottom: 20 }}>
              <div className="card" style={{ textAlign: 'center', background: 'var(--bg-tertiary)' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#ef4444' }}>{result.teacher_quality}%</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Teacher Quality</div>
              </div>
              <div className="card" style={{ textAlign: 'center', background: 'var(--bg-tertiary)' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--accent)' }}>{result.transfer_rate}%</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Transfer Rate</div>
              </div>
              <div className="card" style={{ textAlign: 'center', background: 'var(--bg-tertiary)' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#10b981' }}>{result.student_quality}%</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Student Quality</div>
              </div>
            </div>
            <div className="console" style={{ fontSize: 11 }}>
              {result.steps?.map((s, i) => <div key={i} className="console-line info">{s}</div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

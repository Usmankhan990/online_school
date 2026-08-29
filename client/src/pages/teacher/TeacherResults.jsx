import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function TeacherResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(null);
  const [gradeForm, setGradeForm] = useState({ marks_obtained: '', feedback: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    try { const r = await api.get('/teacher/results'); setResults(r.data.results || []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleGradeAnswer = async (answerId) => {
    try {
      await api.post('/teacher/exams/grade-answer', { answer_id: answerId, ...gradeForm });
      setMsg('✅ Answer graded!'); setGrading(null); fetchData();
    } catch (err) { setMsg('❌ Failed.'); }
  };

  const gradeColor = (g) => ({ 'A+': '#10b981', 'A': '#059669', 'B': '#3b82f6', 'C': '#f59e0b', 'D': '#f97316', 'F': '#ef4444' }[g] || '#6b7280');

  if (loading) return <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />)}</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div><h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>📊 Exam Results</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Review and grade exam attempts</p></div>
      {msg && <div className="alert alert-success">{msg}</div>}
      {results.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📊</span>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No exam attempts yet</p></div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {results.map(r => (
            <div key={r.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{r.student?.full_name}</h3>
                    <span className={`badge ${r.status === 'graded' ? 'badge-success' : 'badge-warning'}`}>{r.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                    <span>📝 {r.exam?.title}</span>
                    <span>📚 {r.exam?.course?.subject?.name} • {r.exam?.course?.class?.display_name}</span>
                    <span>📅 {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString('en-PK', { dateStyle: 'medium' }) : '-'}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: gradeColor(r.grade) }}>{r.grade || '-'}</div>
                  <div style={{ fontSize: 13 }}>{r.total_obtained || 0}/{r.exam?.total_marks || 0} ({parseFloat(r.percentage || 0).toFixed(0)}%)</div>
                </div>
              </div>
              {/* Show subjective answers needing grading */}
              {r.answers?.filter(a => a.marks_obtained == null).length > 0 && (
                <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-surface-2)', borderRadius: 8 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>⏳ {r.answers.filter(a => a.marks_obtained == null).length} answers need grading</p>
                  {r.answers.filter(a => a.marks_obtained == null).map(a => (
                    <div key={a.id} style={{ padding: 8, borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 13 }}>
                        <strong>Answer:</strong> {a.answer_text?.slice(0, 100) || '(File submitted)'}
                      </div>
                      <button className="btn btn-sm btn-accent" onClick={() => { setGrading(a.id); setGradeForm({ marks_obtained: '', feedback: '' }); }}>Grade</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {grading && (
        <div className="modal-overlay" onClick={() => setGrading(null)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Grade Answer</h2>
              <button className="btn btn-icon btn-ghost" onClick={() => setGrading(null)}>✕</button></div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label className="form-label">Marks *</label>
                <input type="number" className="form-input" value={gradeForm.marks_obtained} onChange={e => setGradeForm(f => ({ ...f, marks_obtained: e.target.value }))} min={0} /></div>
              <div><label className="form-label">Feedback</label>
                <textarea className="form-input" rows={3} value={gradeForm.feedback} onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setGrading(null)}>Cancel</button>
              <button className="btn btn-accent" onClick={() => handleGradeAnswer(grading)}>✅ Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

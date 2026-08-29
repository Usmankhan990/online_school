import { useState, useEffect } from 'react';
import api from '../../services/api';
const FILE_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function TeacherSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(null);
  const [gradeForm, setGradeForm] = useState({ marks_obtained: '', feedback: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    try { const r = await api.get('/teacher/submissions'); setSubmissions(r.data.submissions || []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleGrade = async (id) => {
    try {
      await api.put(`/teacher/submissions/${id}/grade`, gradeForm);
      setMsg('✅ Graded!'); setGrading(null); setGradeForm({ marks_obtained: '', feedback: '' }); fetchData();
    } catch (err) { setMsg('❌ ' + (err.response?.data?.error || 'Failed.')); }
  };

  const statusColors = { submitted: '#3b82f6', graded: '#10b981', late: '#f59e0b' };

  if (loading) return <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />)}</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div><h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>📥 Student Submissions</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Review and grade homework submissions</p></div>
      {msg && <div className="alert alert-success">{msg}</div>}
      {submissions.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📥</span>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No submissions yet</p></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          <table className="data-table">
            <thead><tr>
              <th>Student</th><th>Homework</th><th>Subject</th><th>Submitted</th><th>Status</th><th>Marks</th><th>Action</th>
            </tr></thead>
            <tbody>
              {submissions.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.student?.full_name}</td>
                  <td>{s.homework?.title}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.homework?.course?.subject?.name}</td>
                  <td style={{ fontSize: 13 }}>{new Date(s.submitted_at || s.createdAt).toLocaleDateString('en-PK', { dateStyle: 'medium' })}</td>
                  <td><span className="badge" style={{ background: `${statusColors[s.status]}15`, color: statusColors[s.status] }}>{s.status}</span></td>
                  <td style={{ fontWeight: 700 }}>{s.marks_obtained != null ? `${s.marks_obtained}/${s.homework?.total_marks || '-'}` : '-'}</td>
                  <td>
                    {s.file_path && <a href={`${FILE_BASE}/uploads/${s.file_path}`} target="_blank" className="btn btn-sm btn-secondary" style={{ marginRight: 4 }}>📎</a>}
                    {s.status !== 'graded' ? (
                      <button onClick={() => { setGrading(s.id); setGradeForm({ marks_obtained: '', feedback: '' }); }} className="btn btn-sm btn-accent">Grade</button>
                    ) : <span style={{ fontSize: 12, color: '#10b981' }}>✅</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {grading && (
        <div className="modal-overlay" onClick={() => setGrading(null)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Grade Submission</h2>
              <button className="btn btn-icon btn-ghost" onClick={() => setGrading(null)}>✕</button></div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label className="form-label">Marks Obtained *</label>
                <input type="number" className="form-input" value={gradeForm.marks_obtained} onChange={e => setGradeForm(f => ({ ...f, marks_obtained: e.target.value }))} min={0} /></div>
              <div><label className="form-label">Feedback</label>
                <textarea className="form-input" rows={3} value={gradeForm.feedback} onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))} placeholder="Teacher remarks..." /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setGrading(null)}>Cancel</button>
              <button className="btn btn-accent" onClick={() => handleGrade(grading)}>✅ Save Grade</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

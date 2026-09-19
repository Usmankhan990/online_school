import { useState, useEffect } from 'react';
import api, { FILE_BASE } from '../../services/api';

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
        <div className="card-glass table-responsive">
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
                    {s.file_path && (
                      <a href={`${FILE_BASE}/uploads/${s.file_path}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary" style={{ marginRight: 6 }}>
                        📎 File
                      </a>
                    )}
                    <button
                      onClick={() => {
                        setGrading(s);
                        setGradeForm({
                          marks_obtained: s.marks_obtained != null ? s.marks_obtained : '',
                          feedback: s.feedback || ''
                        });
                      }}
                      className="btn btn-sm btn-accent"
                    >
                      {s.status === 'graded' ? '✏️ Edit Grade' : '📝 Grade'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {grading && (
        <div className="modal-overlay" onClick={() => setGrading(null)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800 }}>Grade Submission</h2>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  Student: <strong>{grading.student?.full_name}</strong> • {grading.homework?.title}
                </p>
              </div>
              <button className="btn btn-icon btn-ghost" onClick={() => setGrading(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Student Written Response */}
              <div>
                <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Student Written Solution:</label>
                <div style={{ padding: 12, background: 'var(--bg-surface-2)', borderRadius: 8, border: '1px solid var(--border-light)', fontSize: 13, minHeight: 48, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                  {grading.answer_text || grading.content || <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No written text provided.</span>}
                </div>
              </div>

              {/* Student Attached File / Picture */}
              {grading.file_path && (
                <div>
                  <label className="form-label" style={{ fontSize: 12, fontWeight: 700 }}>Student Attached Solution (Photo / PDF):</label>
                  <div style={{ padding: 12, background: 'var(--bg-surface-2)', borderRadius: 8, border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                        📎 {grading.file_path.split('/').pop()}
                      </span>
                      <a
                        href={`${FILE_BASE}/uploads/${grading.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-primary"
                        style={{ textDecoration: 'none' }}
                      >
                        Open / View Full
                      </a>
                    </div>
                    {/\.(jpe?g|png|webp|gif)$/i.test(grading.file_path) && (
                      <div style={{ maxHeight: 200, overflow: 'hidden', borderRadius: 6, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={`${FILE_BASE}/uploads/${grading.file_path}`}
                          alt="Student Work"
                          style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Grading Input */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
                <div>
                  <label className="form-label">Marks Obtained * (Out of {grading.homework?.total_marks || 10})</label>
                  <input
                    type="number"
                    className="form-input"
                    value={gradeForm.marks_obtained}
                    onChange={e => setGradeForm(f => ({ ...f, marks_obtained: e.target.value }))}
                    min={0}
                    max={grading.homework?.total_marks || 100}
                    placeholder="e.g. 9"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Teacher Remarks / Feedback</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={gradeForm.feedback}
                  onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))}
                  placeholder="e.g. Excellent work, well explained!"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setGrading(null)}>Cancel</button>
              <button className="btn btn-accent" onClick={() => handleGrade(grading.id)}>✅ Save Grade</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

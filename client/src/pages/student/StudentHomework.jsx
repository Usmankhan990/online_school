import { useState, useEffect } from 'react';
import api, { FILE_BASE } from '../../services/api';

export default function StudentHomework() {
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [submitForm, setSubmitForm] = useState({ content: '' });
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState('all');
  const [previewSubmission, setPreviewSubmission] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try { const r = await api.get('/student/homework'); setHomework(r.data.homework || []); }
      catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSubmit = async (hwId) => {
    try {
      const fd = new FormData();
      fd.append('homework_id', hwId);
      fd.append('content', submitForm.content);
      if (file) fd.append('file', file);
      await api.post('/student/homework/submit', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMsg('✅ Homework submitted!'); setSubmitting(null); setFile(null); setSubmitForm({ content: '' });
      const r = await api.get('/student/homework'); setHomework(r.data.homework || []);
    } catch (err) { setMsg('❌ ' + (err.response?.data?.error || 'Submission failed.')); }
  };

  const getStatus = (hw) => {
    const sub = hw.submissions?.[0];
    if (sub?.status === 'graded') return { label: 'Graded', color: '#10b981', icon: '✅' };
    if (sub) return { label: 'Submitted', color: '#3b82f6', icon: '📤' };
    if (new Date(hw.due_date) < new Date()) return { label: 'Overdue', color: '#ef4444', icon: '⏰' };
    return { label: 'Pending', color: '#f59e0b', icon: '📋' };
  };

  const filtered = homework.filter(h => {
    if (filter === 'pending') return !h.submissions?.[0] && new Date(h.due_date) >= new Date();
    if (filter === 'submitted') return h.submissions?.[0] && h.submissions[0].status !== 'graded';
    if (filter === 'graded') return h.submissions?.[0]?.status === 'graded';
    return true;
  });

  if (loading) return <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />)}</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div><h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>📝 My Homework</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>View, submit and track your assignments</p></div>
      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="tabs">
        {['all', 'pending', 'submitted', 'graded'].map(f => (
          <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({homework.filter(h => {
              if (f === 'pending') return !h.submissions?.[0] && new Date(h.due_date) >= new Date();
              if (f === 'submitted') return h.submissions?.[0] && h.submissions[0].status !== 'graded';
              if (f === 'graded') return h.submissions?.[0]?.status === 'graded';
              return true;
            }).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📝</span>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No homework in this category</p></div>
      ) : filtered.map(hw => {
        const status = getStatus(hw);
        const sub = hw.submissions?.[0];
        return (
          <div key={hw.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{hw.title}</h3>
                  <span className="badge" style={{ background: `${status.color}15`, color: status.color }}>{status.icon} {status.label}</span>
                </div>
                {hw.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>{hw.description}</p>}
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                  <span>📚 {hw.course?.subject?.name}</span>
                  <span>📅 Due: {new Date(hw.due_date).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  <span>📊 {hw.total_marks} marks</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                {sub?.status === 'graded' && (
                  <div>
                    <span style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{sub.marks_obtained}/{hw.total_marks}</span>
                    {sub.feedback && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>💬 {sub.feedback}</p>}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {/* View Submission (Eye action) */}
                  {sub && (
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => setPreviewSubmission({ ...sub, hwTitle: hw.title, totalMarks: hw.total_marks })}
                      title="View your submitted work"
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <span>👁️</span> View Submission
                    </button>
                  )}

                  {/* Edit / Resubmit (Pencil action) */}
                  {sub && sub.status !== 'graded' && new Date(hw.due_date) >= new Date() && (
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => {
                        if (submitting === hw.id) {
                          setSubmitting(null);
                        } else {
                          setSubmitting(hw.id);
                          setSubmitForm({ content: sub.answer_text || '' });
                        }
                      }}
                      title="Edit and resubmit your work"
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <span>✏️</span> {submitting === hw.id ? 'Cancel' : 'Edit / Resubmit'}
                    </button>
                  )}

                  {/* Initial Submit */}
                  {!sub && new Date(hw.due_date) >= new Date() && (
                    <button className="btn btn-sm btn-accent" onClick={() => setSubmitting(submitting === hw.id ? null : hw.id)}>
                      {submitting === hw.id ? '✕ Cancel' : '📤 Submit'}
                    </button>
                  )}
                </div>
              </div>
            </div>
            {submitting === hw.id && (
              <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-surface-2)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <textarea
                  className="form-input"
                  rows={3}
                  value={submitForm.content}
                  onChange={e => setSubmitForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Your answer or notes..."
                />
                <input type="file" className="form-input" style={{ padding: 8 }} onChange={e => setFile(e.target.files[0])} />
                <button className="btn btn-accent" onClick={() => handleSubmit(hw.id)}>
                  {sub ? '🔄 Update & Resubmit' : '🚀 Submit Homework'}
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* View Submission Modal */}
      {previewSubmission && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ maxWidth: 550, width: '100%', padding: 28, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              onClick={() => setPreviewSubmission(null)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-tertiary)' }}
            >
              ✕
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>👁️</span>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Submission Preview</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{previewSubmission.hwTitle}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-surface-2)', borderRadius: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Submitted:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {new Date(previewSubmission.submitted_at || previewSubmission.createdAt).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>

              {previewSubmission.status === 'graded' && (
                <div style={{ padding: '12px 14px', background: '#ecfdf5', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>Grading Result:</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#059669' }}>
                      {previewSubmission.marks_obtained}/{previewSubmission.totalMarks}
                    </span>
                  </div>
                  {previewSubmission.feedback && (
                    <p style={{ fontSize: 13, color: '#047857', marginTop: 6 }}>
                      <strong>Feedback:</strong> {previewSubmission.feedback}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Written Response:
                </label>
                <div style={{ padding: 14, background: 'var(--bg-surface-2)', borderRadius: 8, border: '1px solid var(--border-light)', minHeight: 60, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                  {previewSubmission.answer_text || previewSubmission.content || (
                    <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No written response provided.</span>
                  )}
                </div>
              </div>

              {previewSubmission.file_path && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Attached File:
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-surface-2)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>📎</span> {previewSubmission.file_path.split('/').pop()}
                    </span>
                    <a
                      href={`${FILE_BASE}/uploads/${previewSubmission.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-primary"
                      style={{ textDecoration: 'none', flexShrink: 0, marginLeft: 12 }}
                    >
                      View / Download
                    </a>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn btn-secondary" onClick={() => setPreviewSubmission(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

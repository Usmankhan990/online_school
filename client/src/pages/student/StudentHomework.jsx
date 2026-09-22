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

  const [bookPageModal, setBookPageModal] = useState(null); // { title: '', images: [], activeIndex: 0, zoom: 1 }

  const getPageImages = (hw) => {
    if (!hw.page_images) return [];
    try {
      const parsed = typeof hw.page_images === 'string' ? JSON.parse(hw.page_images) : hw.page_images;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const openBookPagesViewer = (hw, initialIndex = 0) => {
    const images = getPageImages(hw);
    if (!images.length) return;
    setBookPageModal({
      title: hw.title,
      bookPages: hw.book_pages,
      subject: hw.course?.subject?.name,
      images,
      activeIndex: initialIndex,
      zoom: 1,
    });
  };

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
        const pageImgs = getPageImages(hw);
        return (
          <div key={hw.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{hw.title}</h3>
                  <span className="badge" style={{ background: `${status.color}15`, color: status.color }}>{status.icon} {status.label}</span>
                  {hw.book_pages && (
                    <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700 }}>
                      📖 Book Pages: {hw.book_pages}
                    </span>
                  )}
                </div>
                {hw.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, whiteSpace: 'pre-wrap' }}>{hw.description}</p>}

                {/* Assigned Book Page Images Section */}
                {pageImgs.length > 0 && (
                  <div style={{ marginTop: 10, marginBottom: 12, padding: 14, background: 'var(--bg-surface-2)', borderRadius: 10, border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                        <span>📖</span>
                        <span>Assigned Book Pages ({pageImgs.length} {pageImgs.length === 1 ? 'Page' : 'Pages'}):</span>
                      </div>
                      <button
                        onClick={() => openBookPagesViewer(hw, 0)}
                        className="btn btn-sm btn-primary"
                        style={{ fontSize: 12, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5 }}
                      >
                        <span>🔍</span> Read Book Pages
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {pageImgs.map((imgName, pIdx) => (
                        <div
                          key={pIdx}
                          onClick={() => openBookPagesViewer(hw, pIdx)}
                          style={{
                            position: 'relative',
                            width: 85,
                            height: 110,
                            borderRadius: 8,
                            overflow: 'hidden',
                            border: '2px solid var(--border-light)',
                            cursor: 'pointer',
                            background: '#090d16',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary-500)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                          title={`Click to open Page ${pIdx + 1}`}
                        >
                          <img
                            src={`${FILE_BASE}/uploads/${imgName}`}
                            alt={`Page ${pIdx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: 4 }}>
                            <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>P{pIdx + 1}</span>
                            <span style={{ color: '#60a5fa', fontSize: 10 }}>🔍</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-tertiary)', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span>📚 {hw.course?.subject?.name}</span>
                  <span>📅 Due: {new Date(hw.due_date).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  <span>📊 {hw.total_marks} marks</span>
                  {hw.file_path && (
                    <a
                      href={`${FILE_BASE}/uploads/${hw.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-ghost"
                      style={{ padding: '2px 8px', fontSize: 12, textDecoration: 'none' }}
                    >
                      📎 Download Attachment
                    </a>
                  )}
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
                      {submitting === hw.id ? '✕ Cancel' : '📤 Submit Homework'}
                    </button>
                  )}
                </div>
              </div>
            </div>
            {submitting === hw.id && (
              <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-surface-2)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                  ✍️ {sub ? 'Update Your Solution / Resubmit' : 'Your Homework Solution:'}
                </div>
                <textarea
                  className="form-input"
                  rows={4}
                  value={submitForm.content}
                  onChange={e => setSubmitForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Type your answers, solutions, or explanation here..."
                />
                <div>
                  <label className="form-label" style={{ fontSize: 12 }}>Attach Solution File or Photo (Optional)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="file"
                      id={`student-hw-file-${hw.id}`}
                      className="form-input"
                      style={{ display: 'none' }}
                      onChange={e => setFile(e.target.files?.[0] || null)}
                    />
                    <label
                      htmlFor={`student-hw-file-${hw.id}`}
                      className="form-input"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        padding: '8px 12px',
                        background: 'var(--bg-surface-2, #f8fafc)',
                        color: file ? 'var(--text-primary)' : 'var(--text-tertiary)',
                        userSelect: 'none'
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', pointerEvents: 'none', userSelect: 'none', cursor: 'pointer' }}>
                        {file ? `📄 ${file.name}` : '📁 Choose File or Photo...'}
                      </span>
                      {file ? (
                        <span
                          onClick={(e) => {
                            e.preventDefault();
                            setFile(null);
                            const el = document.getElementById(`student-hw-file-${hw.id}`);
                            if (el) el.value = '';
                          }}
                          style={{ cursor: 'pointer', color: '#ef4444', fontWeight: 'bold', marginLeft: 8, fontSize: '14px' }}
                          title="Remove file"
                        >
                          ✕
                        </span>
                      ) : (
                        <span className="btn btn-secondary btn-sm" style={{ padding: '2px 8px', fontSize: '11px', pointerEvents: 'none', userSelect: 'none', cursor: 'pointer' }}>
                          Browse
                        </span>
                      )}
                    </label>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setSubmitting(null)}>Cancel</button>
                  <button className="btn btn-accent btn-sm" onClick={() => handleSubmit(hw.id)}>
                    {sub ? '🔄 Update & Resubmit' : '🚀 Submit Homework'}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Book Pages Lightbox Modal */}
      {bookPageModal && (
        <div
          onClick={() => setBookPageModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.88)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2500,
            padding: 16,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="card animate-scale-in"
            style={{
              maxWidth: 900,
              width: '100%',
              height: '92vh',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg-surface-1)',
              padding: 0,
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-surface-2)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>📖</span>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {bookPageModal.title}
                  </h3>
                  {bookPageModal.bookPages && (
                    <span className="badge badge-purple" style={{ fontSize: 11 }}>
                      {bookPageModal.bookPages}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  {bookPageModal.subject} • Page {bookPageModal.activeIndex + 1} of {bookPageModal.images.length}
                </div>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setBookPageModal(m => ({ ...m, zoom: Math.max(0.6, m.zoom - 0.2) }))}
                  title="Zoom Out"
                  style={{ fontSize: 14, padding: '4px 8px' }}
                >
                  🔍-
                </button>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)', minWidth: 40, textAlign: 'center' }}>
                  {Math.round(bookPageModal.zoom * 100)}%
                </span>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setBookPageModal(m => ({ ...m, zoom: Math.min(3, m.zoom + 0.2) }))}
                  title="Zoom In"
                  style={{ fontSize: 14, padding: '4px 8px' }}
                >
                  🔍+
                </button>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setBookPageModal(m => ({ ...m, zoom: 1 }))}
                  title="Reset Zoom"
                  style={{ fontSize: 11, padding: '4px 8px' }}
                >
                  Reset
                </button>
                <a
                  href={`${FILE_BASE}/uploads/${bookPageModal.images[bookPageModal.activeIndex]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline"
                  download
                  style={{ fontSize: 12, padding: '4px 10px', textDecoration: 'none' }}
                >
                  📥 Download
                </a>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setBookPageModal(null)}
                  style={{ padding: '4px 10px' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Image Viewer Area */}
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                background: '#0a0d14',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                padding: 16,
              }}
            >
              {/* Previous Button */}
              {bookPageModal.images.length > 1 && (
                <button
                  onClick={() => setBookPageModal(m => ({ ...m, activeIndex: (m.activeIndex - 1 + m.images.length) % m.images.length, zoom: 1 }))}
                  style={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.65)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    width: 44,
                    height: 44,
                    fontSize: 20,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                  }}
                  title="Previous Page"
                >
                  ‹
                </button>
              )}

              {/* Main Book Page Image */}
              <img
                src={`${FILE_BASE}/uploads/${bookPageModal.images[bookPageModal.activeIndex]}`}
                alt={`Book Page ${bookPageModal.activeIndex + 1}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  transform: `scale(${bookPageModal.zoom})`,
                  transition: 'transform 0.15s ease',
                  borderRadius: 6,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                  objectFit: 'contain',
                }}
              />

              {/* Next Button */}
              {bookPageModal.images.length > 1 && (
                <button
                  onClick={() => setBookPageModal(m => ({ ...m, activeIndex: (m.activeIndex + 1) % m.images.length, zoom: 1 }))}
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.65)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    width: 44,
                    height: 44,
                    fontSize: 20,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                  }}
                  title="Next Page"
                >
                  ›
                </button>
              )}
            </div>

            {/* Bottom Thumbnail Strip */}
            {bookPageModal.images.length > 1 && (
              <div style={{ display: 'flex', gap: 10, padding: '10px 16px', background: 'var(--bg-surface-2)', borderTop: '1px solid var(--border-light)', overflowX: 'auto', justifyContent: 'center' }}>
                {bookPageModal.images.map((imgName, idx) => (
                  <button
                    key={idx}
                    onClick={() => setBookPageModal(m => ({ ...m, activeIndex: idx, zoom: 1 }))}
                    style={{
                      width: 48,
                      height: 60,
                      borderRadius: 6,
                      overflow: 'hidden',
                      border: idx === bookPageModal.activeIndex ? '2px solid var(--color-primary-500)' : '2px solid transparent',
                      opacity: idx === bookPageModal.activeIndex ? 1 : 0.6,
                      cursor: 'pointer',
                      padding: 0,
                      background: '#000',
                      flexShrink: 0,
                    }}
                  >
                    <img src={`${FILE_BASE}/uploads/${imgName}`} alt={`Page ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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

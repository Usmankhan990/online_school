import { useState, useEffect } from 'react';
import api, { FILE_BASE } from '../../services/api';

export default function ParentHomework() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hwLoading, setHwLoading] = useState(false);
  const [selectedImageModal, setSelectedImageModal] = useState(null);

  const [previewSubmission, setPreviewSubmission] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const r = await api.get('/parent/dashboard');
        setChildren(r.data.children || []);
        if (r.data.children?.length > 0) {
          setSelectedChild(r.data.children[0].profile.user_id);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!selectedChild) return;
    const fetch = async () => {
      setHwLoading(true);
      try {
        const r = await api.get(`/parent/child-homework?student_id=${selectedChild}`);
        setHomework(r.data.homework || []);
      } catch (err) { console.error(err); } finally { setHwLoading(false); }
    };
    fetch();
  }, [selectedChild]);

  const getStatus = (hw) => {
    const sub = hw.submissions?.[0];
    if (sub?.status === 'graded') return { label: 'Graded', color: '#10b981', icon: '✅' };
    if (sub) return { label: 'Submitted', color: '#3b82f6', icon: '📤' };
    if (new Date(hw.due_date) < new Date()) return { label: 'Overdue', color: '#ef4444', icon: '⏰' };
    return { label: 'Pending', color: '#f59e0b', icon: '📋' };
  };

  const getPageImages = (hw) => {
    if (!hw.page_images) return [];
    try {
      const parsed = typeof hw.page_images === 'string' ? JSON.parse(hw.page_images) : hw.page_images;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  if (loading) return <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />)}</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div><h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>📝 Child Homework</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Track your child's homework progress</p></div>
        {children.length > 1 && (
          <select className="form-select" style={{ width: 'auto' }} value={selectedChild} onChange={e => setSelectedChild(e.target.value)}>
            {children.map(c => <option key={c.profile.user_id} value={c.profile.user_id}>{c.profile.user?.full_name}</option>)}
          </select>
        )}
      </div>
      {hwLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />)}</div>
      ) : homework.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📝</span>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No homework assigned yet</p></div>
      ) : homework.map(hw => {
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
                    <span className="badge badge-purple" style={{ fontSize: 11, fontWeight: 700 }}>
                      📖 Book Pages: {hw.book_pages}
                    </span>
                  )}
                </div>

                {hw.description && (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, whiteSpace: 'pre-wrap' }}>
                    {hw.description}
                  </p>
                )}

                {/* Book Page Images Thumbnails */}
                {pageImgs.length > 0 && (
                  <div style={{ marginTop: 8, marginBottom: 10, padding: '8px 12px', background: 'var(--bg-surface-2)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      📖 Book Page Pictures ({pageImgs.length}):
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {pageImgs.map((imgName, pIdx) => (
                        <div
                          key={pIdx}
                          onClick={() => setSelectedImageModal({ url: `${FILE_BASE}/uploads/${imgName}`, title: `${hw.title} - Page ${pIdx + 1}` })}
                          style={{ position: 'relative', width: 65, height: 80, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border-light)', cursor: 'pointer', background: '#000' }}
                          title="Click to view full page"
                        >
                          <img
                            src={`${FILE_BASE}/uploads/${imgName}`}
                            alt={`Page ${pIdx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <span style={{ position: 'absolute', bottom: 2, right: 2, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 8, padding: '1px 3px', borderRadius: 2 }}>
                            P{pIdx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                  <span>📚 {hw.course?.subject?.name}</span>
                  <span>📅 Due: {new Date(hw.due_date).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  <span>📊 {hw.total_marks} marks</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                {sub?.status === 'graded' && (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{sub.marks_obtained}/{hw.total_marks}</span>
                    {sub.feedback && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>💬 {sub.feedback}</p>}
                  </div>
                )}
                {sub && (
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setPreviewSubmission({ ...sub, hwTitle: hw.title, totalMarks: hw.total_marks })}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}
                  >
                    <span>👁️</span> View Submission
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* View Child's Submission Modal */}
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
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Child's Homework Submission</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{previewSubmission.hwTitle}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-surface-2)', borderRadius: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Submitted On:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {new Date(previewSubmission.submitted_at || previewSubmission.createdAt).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>

              {previewSubmission.status === 'graded' && (
                <div style={{ padding: '12px 14px', background: '#ecfdf5', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>Teacher Grade:</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#059669' }}>
                      {previewSubmission.marks_obtained}/{previewSubmission.totalMarks}
                    </span>
                  </div>
                  {previewSubmission.feedback && (
                    <p style={{ fontSize: 13, color: '#047857', marginTop: 6 }}>
                      <strong>Remarks:</strong> {previewSubmission.feedback}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Written Solution:
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
                    Attached Work (Photo / PDF):
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 16px', background: 'var(--bg-surface-2)', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                        📎 {previewSubmission.file_path.split('/').pop()}
                      </span>
                      <a
                        href={`${FILE_BASE}/uploads/${previewSubmission.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-primary"
                        style={{ textDecoration: 'none' }}
                      >
                        View / Download
                      </a>
                    </div>
                    {/\.(jpe?g|png|webp|gif)$/i.test(previewSubmission.file_path) && (
                      <div style={{ maxHeight: 180, overflow: 'hidden', borderRadius: 6, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={`${FILE_BASE}/uploads/${previewSubmission.file_path}`}
                          alt="Student Work"
                          style={{ maxWidth: '100%', maxHeight: 180, objectFit: 'contain' }}
                        />
                      </div>
                    )}
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

      {/* Full Size Image Modal */}
      {selectedImageModal && (
        <div
          onClick={() => setSelectedImageModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="card animate-scale-in"
            style={{ maxWidth: 800, width: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface-1)', padding: 16, borderRadius: 12 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border-light)' }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedImageModal.title}</h4>
              <button className="btn btn-sm btn-secondary" onClick={() => setSelectedImageModal(null)}>✕ Close</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, background: '#000', borderRadius: 8, padding: 8 }}>
              <img
                src={selectedImageModal.url}
                alt="Book Page"
                style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

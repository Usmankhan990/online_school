import { useState, useEffect, useRef } from 'react';
import api, { FILE_BASE } from '../../services/api';

export default function TeacherHomework() {
  const [homework, setHomework] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ course_id: '', title: '', description: '', type: 'homework', due_date: '', total_marks: 10, book_pages: '' });
  const [file, setFile] = useState(null);
  const [pageImages, setPageImages] = useState([]);
  const [pagePreviews, setPagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [selectedImageModal, setSelectedImageModal] = useState(null);
  const dateTimerRef = useRef(null);

  const handleDateTimeChange = (e) => {
    const val = e.target.value;
    const target = e.target;
    setForm(f => ({ ...f, due_date: val }));
    if (dateTimerRef.current) clearTimeout(dateTimerRef.current);
    if (val && val.length >= 16) {
      dateTimerRef.current = setTimeout(() => {
        try { target.blur(); } catch {}
      }, 400);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    try {
      const [h, c] = await Promise.all([api.get('/teacher/homework'), api.get('/teacher/courses')]);
      setHomework(h.data.homework || []); setCourses(c.data.courses || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handlePageImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newFiles = [...pageImages, ...files];
    setPageImages(newFiles);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removePageImage = (index) => {
    setPageImages(prev => prev.filter((_, i) => i !== index));
    setPagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setMsg('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('file', file);
      pageImages.forEach(imgFile => {
        fd.append('page_images', imgFile);
      });

      await api.post('/teacher/homework', fd);
      setMsg('✅ Homework created successfully with assigned book pages!');
      setShowForm(false);
      setForm({ course_id: '', title: '', description: '', type: 'homework', due_date: '', total_marks: 10, book_pages: '' });
      setFile(null);
      setPageImages([]);
      pagePreviews.forEach(url => URL.revokeObjectURL(url));
      setPagePreviews([]);
      fetchData();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Failed to create homework.'));
    } finally {
      setSubmitting(false);
    }
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

  const [bookPageModal, setBookPageModal] = useState(null);

  const openBookPagesViewer = (hw, initialIndex = 0) => {
    const images = getPageImages(hw);
    if (!images.length) return;
    setBookPageModal({
      title: hw.title,
      bookPages: hw.book_pages,
      subject: hw.course?.subject?.name,
      className: hw.course?.class?.display_name,
      images,
      activeIndex: initialIndex,
      zoom: 1,
    });
  };

  if (loading) return <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />)}</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div><h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>📝 Homework Manager</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Create and manage assignments for your classes</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? '✕ Cancel' : '+ Create Homework'}</button>
      </div>
      {msg && <div className="alert" style={{ background: msg.startsWith('✅') ? '#ecfdf5' : '#fef2f2', color: msg.startsWith('✅') ? '#059669' : '#dc2626', border: `1px solid ${msg.startsWith('✅') ? '#a7f3d0' : '#fecaca'}` }}>{msg}</div>}
      
      {showForm && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Create New Homework</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div>
                <label className="form-label">Course *</label>
                <select className="form-select" value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))} required>
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.class?.display_name} • {c.subject?.name})</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g. Chapter 3 Questions" />
              </div>
              <div>
                <label className="form-label">Due Date *</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={form.due_date}
                  onChange={handleDateTimeChange}
                  onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                  required
                />
              </div>
              <div>
                <label className="form-label">Total Marks</label>
                <input type="number" className="form-input" value={form.total_marks} onChange={e => setForm(f => ({ ...f, total_marks: e.target.value }))} min={1} />
              </div>
            </div>

            {/* Book Pages Mention Field */}
            <div style={{ background: 'var(--bg-surface-2)', padding: 16, borderRadius: 10, border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>📖</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Book Pages & Pictures</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                <div>
                  <label className="form-label">Book Page(s) Mention</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.book_pages}
                    onChange={e => setForm(f => ({ ...f, book_pages: e.target.value }))}
                    placeholder="e.g. Page 24-27, Exercise 3.2"
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4, display: 'block' }}>
                    Mention which book pages students need to study or solve.
                  </span>
                </div>

                <div>
                  <label className="form-label">Upload Book Page Pictures (Photos)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePageImagesChange}
                    className="form-input"
                    style={{ padding: 8, color: 'transparent' }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4, display: 'block' }}>
                    Upload clear pictures of only these assigned pages for students to see.
                  </span>
                </div>
              </div>

              {/* Page Images Previews */}
              {pagePreviews.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
                    Selected Page Pictures ({pagePreviews.length}):
                  </label>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {pagePreviews.map((url, idx) => (
                      <div key={idx} style={{ position: 'relative', width: 90, height: 110, borderRadius: 8, overflow: 'hidden', border: '2px solid var(--color-primary-500)', background: '#000' }}>
                        <img src={url} alt={`Page ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', bottom: 2, left: 2, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 10, padding: '1px 5px', borderRadius: 4 }}>
                          P{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removePageImage(idx)}
                          style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Instructions / Description</label>
              <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Homework instructions..." />
            </div>

            <div>
              <label className="form-label">Additional Attachment (optional PDF / Doc)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="file"
                  id="teacher-homework-file-upload"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="teacher-homework-file-upload"
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
                    {file ? `📄 ${file.name}` : '📁 Choose File...'}
                  </span>
                  {file ? (
                    <span
                      onClick={(e) => {
                        e.preventDefault();
                        setFile(null);
                        const el = document.getElementById('teacher-homework-file-upload');
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

            <button type="submit" className="btn btn-accent" disabled={submitting}>
              {submitting ? '⏳ Creating Homework...' : '🚀 Create Homework'}
            </button>
          </form>
        </div>
      )}

      {/* Homework Cards List */}
      <div style={{ display: 'grid', gap: 14 }}>
        {homework.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📝</span>
            <p style={{ fontSize: 16, fontWeight: 600 }}>No homework created yet</p>
          </div>
        ) : homework.map(h => {
          const pageImgs = getPageImages(h);
          return (
            <div key={h.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{h.title}</h3>
                    <span className={`badge ${new Date(h.due_date) > new Date() ? 'badge-success' : 'badge-warning'}`}>
                      {new Date(h.due_date) > new Date() ? 'Active' : 'Past Due'}
                    </span>
                    {h.book_pages && (
                      <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        📖 {h.book_pages}
                      </span>
                    )}
                    {pageImgs.length > 0 && (
                      <button
                        onClick={() => openBookPagesViewer(h, 0)}
                        className="btn btn-sm btn-outline"
                        style={{
                          fontSize: 12,
                          padding: '3px 10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          borderRadius: 20,
                          fontWeight: 600,
                        }}
                      >
                        <span>🔍</span> Preview Book Pages ({pageImgs.length})
                      </button>
                    )}
                  </div>

                  {h.description && (
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, whiteSpace: 'pre-wrap' }}>
                      {h.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                    <span>📚 {h.course?.class?.display_name} • {h.course?.subject?.name}</span>
                    <span>📅 Due: {new Date(h.due_date).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    <span>📊 {h.total_marks} marks</span>
                    <span>📤 {h.submissions?.length || 0} submissions</span>
                    {h.file_path && (
                      <a
                        href={`${FILE_BASE}/uploads/${h.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--color-primary-600)', textDecoration: 'none', fontWeight: 600 }}
                      >
                        📎 Attachment
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
    </div>
  );
}


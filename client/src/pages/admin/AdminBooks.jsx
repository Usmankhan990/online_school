import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../services/api';
import FileDropZone from '../../components/FileDropZone';

const formatSize = (bytes) => {
  if (!bytes) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
};

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('info');
  const [bulkFiles, setBulkFiles] = useState([]);
  const [bulkClass, setBulkClass] = useState('');
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const bulkInputRef = useRef(null);
  const [form, setForm] = useState({
    class_id: '', subject_id: '', title: '', title_urdu: '', description: '',
    pdf_url: '', publisher: 'PCTB Punjab', year: 2026, medium: 'Both',
  });

  const fetchData = useCallback(async () => {
    try {
      const params = {};
      if (filterClass !== 'all') params.class_id = filterClass;
      if (filterSubject !== 'all') params.subject_id = filterSubject;
      if (filterStatus !== 'all') params.status = filterStatus;
      if (debouncedSearch) params.search = debouncedSearch;

      const [b, c, s] = await Promise.all([
        api.get('/books', { params }),
        api.get('/classes'),
        api.get('/subjects'),
      ]);
      setBooks(b.data.books || []);
      setClasses(c.data.classes || []);
      setSubjects(s.data.subjects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterClass, filterSubject, filterStatus, debouncedSearch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showMessage = (text, type = 'info') => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(''), 5000);
  };

  const resetForm = () => {
    setForm({ class_id: '', subject_id: '', title: '', title_urdu: '', description: '', pdf_url: '', publisher: 'PCTB Punjab', year: 2026, medium: 'Both' });
    setPdfFile(null);
    setUploadProgress(0);
  };

  // ── Add Book with File ──
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.class_id || !form.subject_id || !form.title) {
      showMessage('❌ Please fill Class, Subject, and Title', 'danger');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '' && v !== null && v !== undefined) formData.append(k, v); });
      if (pdfFile) formData.append('pdf', pdfFile);

      await api.post('/books', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        },
      });

      showMessage('✅ Book added successfully!', 'success');
      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      showMessage('❌ ' + (err.response?.data?.error || 'Failed to add book'), 'danger');
    } finally {
      setUploading(false);
    }
  };

  // ── Edit Book ──
  const openEdit = (book) => {
    setForm({
      class_id: String(book.class_id),
      subject_id: String(book.subject_id),
      title: book.title,
      title_urdu: book.title_urdu || '',
      description: book.description || '',
      pdf_url: book.pdf_url || '',
      publisher: book.publisher || 'PCTB Punjab',
      year: book.year || 2026,
      medium: book.medium || 'Both',
    });
    setPdfFile(null);
    setUploadProgress(0);
    setShowEditModal(book);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== undefined && v !== null) formData.append(k, v); });
      if (pdfFile) formData.append('pdf', pdfFile);

      await api.put(`/books/${showEditModal.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        },
      });

      showMessage('✅ Book updated!', 'success');
      setShowEditModal(null);
      resetForm();
      fetchData();
    } catch (err) {
      showMessage('❌ ' + (err.response?.data?.error || 'Failed to update book'), 'danger');
    } finally {
      setUploading(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (id) => {
    if (!confirm('Delete this book and its local PDF file?')) return;
    try {
      await api.delete(`/books/${id}`);
      setBooks(prev => prev.filter(b => b.id !== id));
      showMessage('✅ Book deleted', 'success');
    } catch (err) {
      showMessage('❌ ' + (err.response?.data?.error || 'Failed'), 'danger');
    }
  };

  // ── Toggle Active ──
  const handleToggle = async (book) => {
    try {
      await api.put(`/books/${book.id}`, { is_active: !book.is_active });
      showMessage(`✅ Book ${book.is_active ? 'deactivated' : 'activated'}!`, 'success');
      fetchData();
    } catch (err) {
      showMessage('❌ Failed to toggle status', 'danger');
    }
  };

  // ── Bulk File Upload ──
  const handleBulkFilesSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => {
      const ext = f.name.split('.').pop().toLowerCase();
      return ['pdf', 'doc', 'docx'].includes(ext);
    });
    setBulkFiles(prev => [...prev, ...validFiles]);
  };

  const removeBulkFile = (index) => {
    setBulkFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleBulkUpload = async () => {
    if (!bulkClass || !bulkSubject) {
      showMessage('❌ Please select class and subject for bulk upload', 'danger');
      return;
    }
    if (bulkFiles.length === 0) {
      showMessage('❌ Please select at least one file', 'danger');
      return;
    }

    setBulkUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < bulkFiles.length; i++) {
      const file = bulkFiles[i];
      try {
        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('class_id', bulkClass);
        formData.append('subject_id', bulkSubject);
        // Use filename (without extension) as title
        const title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        formData.append('title', title);
        formData.append('publisher', 'PCTB Punjab');
        formData.append('year', '2026');

        await api.post('/books', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        successCount++;
      } catch (err) {
        failCount++;
        console.error(`Failed to upload ${file.name}:`, err);
      }
      setBulkProgress(Math.round(((i + 1) / bulkFiles.length) * 100));
    }

    setBulkUploading(false);
    setBulkProgress(0);
    showMessage(`✅ ${successCount} books uploaded${failCount ? `, ${failCount} failed` : ''}!`, successCount > 0 ? 'success' : 'danger');
    if (successCount > 0) {
      setShowBulkModal(false);
      setBulkFiles([]);
      setBulkClass('');
      setBulkSubject('');
      fetchData();
    }
  };

  // ── Stats ──
  const totalBooks = books.length;
  const localPdfs = books.filter(b => b.local_file && b.local_file.trim()).length;
  const externalOnly = books.filter(b => (!b.local_file || !b.local_file.trim()) && b.pdf_url && b.pdf_url.trim()).length;
  const activeBooks = books.filter(b => b.is_active).length;

  // ── Render Form Modal ──
  const renderBookModal = (isEdit = false) => {
    const onClose = () => { isEdit ? setShowEditModal(null) : setShowAddModal(false); resetForm(); };
    const onSubmit = isEdit ? handleEdit : handleAdd;

    // Filter subjects based on selected class
    const filteredSubjects = form.class_id
      ? subjects.filter(s => {
          const cls = classes.find(c => String(c.id) === String(form.class_id));
          if (!cls || !cls.subjects) return true; // show all if no mapping
          return cls.subjects.some(cs => cs.id === s.id) || true; // show all for now
        })
      : subjects;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-panel" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{isEdit ? `✏️ Edit: ${showEditModal?.title}` : '📖 Add New Book'}</h2>
            <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
          </div>
          <form onSubmit={onSubmit}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Class *</label>
                  <select value={form.class_id} onChange={e => setForm({...form, class_id: e.target.value})}
                    required className="form-select">
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Subject *</label>
                  <select value={form.subject_id} onChange={e => setForm({...form, subject_id: e.target.value})}
                    required className="form-select">
                    <option value="">Select Subject</option>
                    {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-3">
                <div>
                  <label className="form-label">Title (English) *</label>
                  <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                    required className="form-input" placeholder="Enter book title" />
                </div>
                <div>
                  <label className="form-label">Medium</label>
                  <select value={form.medium} onChange={e => setForm({...form, medium: e.target.value})}
                    className="form-select">
                    <option value="Both">Both</option>
                    <option value="English">English</option>
                    <option value="Urdu">Urdu</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Title (Urdu)</label>
                <input type="text" value={form.title_urdu} onChange={e => setForm({...form, title_urdu: e.target.value})}
                  className="form-input" dir="rtl" placeholder="اردو ٹائٹل" />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="form-input" rows={2} placeholder="Book description" style={{ resize: 'vertical' }} />
              </div>
              {/* PDF Upload Zone */}
              <div>
                <label className="form-label">📤 PDF File Upload</label>
                <FileDropZone
                  onFileSelect={(f) => setPdfFile(f)}
                  existingFile={isEdit ? showEditModal?.local_file : null}
                  existingFileName={isEdit ? showEditModal?.original_filename : null}
                  allowedTypes={['.pdf', '.doc', '.docx']}
                  maxSizeMB={100}
                  progress={uploadProgress}
                  uploading={uploading}
                  label="Drop your PDF file here"
                />
              </div>
              <div>
                <label className="form-label">Online Book URL</label>
                <input type="url" value={form.pdf_url} onChange={e => setForm({...form, pdf_url: e.target.value})}
                  className="form-input" placeholder="https://... online textbook page or PDF" />
                <p className="form-helper">⚠️ External URL is used only as a fallback when no local file is uploaded</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Publisher</label>
                  <input type="text" value={form.publisher} onChange={e => setForm({...form, publisher: e.target.value})}
                    className="form-input" />
                </div>
                <div>
                  <label className="form-label">Year</label>
                  <input type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})}
                    className="form-input" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn btn-secondary" disabled={uploading}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? `⏳ Uploading... ${uploadProgress}%` : isEdit ? 'Save Changes' : 'Add Book'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid var(--border-light)', borderTopColor: '#1e3a5f', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>📚 Book Library Management</h1>
          <p>Manage PCTB 2026 textbooks • Upload local PDFs • Drag & drop support</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => { resetForm(); setShowAddModal(true); }} className="btn btn-primary">+ Add Book</button>
          <button onClick={() => { setBulkFiles([]); setBulkClass(''); setBulkSubject(''); setShowBulkModal(true); }} className="btn btn-accent">📤 Bulk Upload</button>
        </div>
      </div>

      {msg && <div className={`alert alert-${msgType}`} style={{ justifyContent: 'center' }}>{msg}</div>}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Books', value: totalBooks, color: '#1e3a5f', icon: '📚' },
          { label: 'Active', value: activeBooks, color: '#10b981', icon: '✅' },
          { label: 'Local PDFs', value: localPdfs, color: '#059669', icon: '📁' },
          { label: 'External Only', value: externalOnly, color: '#f59e0b', icon: '🌐' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ padding: 16 }}>
            <div>
              <div className="stat-value" style={{ color: s.color, fontSize: 24 }}>{s.value}</div>
              <div className="stat-label" style={{ fontSize: 11 }}>{s.label}</div>
            </div>
            <span style={{ fontSize: 22 }}>{s.icon}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="form-label">Search</label>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              className="form-input" placeholder="Search by title, subject..." />
          </div>
          <div style={{ minWidth: 160 }}>
            <label className="form-label">Class</label>
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="form-select">
              <option value="all">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
            </select>
          </div>
          <div style={{ minWidth: 160 }}>
            <label className="form-label">Subject</label>
            <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="form-select">
              <option value="all">All Subjects</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div style={{ minWidth: 130 }}>
            <label className="form-label">Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Books Table */}
      <div className="card" style={{ overflow: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Book</th>
              <th>Class</th>
              <th>Subject</th>
              <th>Source</th>
              <th>Size</th>
              <th>Status</th>
              <th>Uploaded</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
                <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>📭</span>
                No books found. Try adjusting your filters or add a new book.
              </td></tr>
            ) : books.map(b => {
              const hasLocal = b.local_file && b.local_file.trim() !== '';
              const hasExternal = b.pdf_url && b.pdf_url.trim() !== '';
              return (
                <tr key={b.id} style={{ opacity: b.is_active ? 1 : 0.6 }}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{b.title}</div>
                      {b.title_urdu && <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }} dir="rtl">{b.title_urdu}</div>}
                      {b.original_filename && <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>📄 {b.original_filename}</div>}
                    </div>
                  </td>
                  <td><span className="badge badge-info" style={{ fontSize: 11 }}>{b.class?.display_name || '—'}</span></td>
                  <td><span className="badge badge-purple" style={{ fontSize: 11 }}>{b.subject?.name || '—'}</span></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {hasLocal && (
                        <a href={b.local_file} target="_blank" rel="noopener" style={{ textDecoration: 'none' }}>
                          <span className="badge badge-success" style={{ fontSize: 10 }}>📁 Local PDF</span>
                        </a>
                      )}
                      {hasExternal && (
                        <a href={b.pdf_url} target="_blank" rel="noopener" style={{ textDecoration: 'none' }}>
                          <span className={`badge ${hasLocal ? 'badge-neutral' : 'badge-warning'}`} style={{ fontSize: 10 }}>
                            🌐 {hasLocal ? 'Fallback' : 'External'}
                          </span>
                        </a>
                      )}
                      {!hasLocal && !hasExternal && <span className="badge badge-danger" style={{ fontSize: 10 }}>❌ No File</span>}
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{formatSize(b.file_size)}</td>
                  <td>
                    <button onClick={() => handleToggle(b)}
                      className={`badge ${b.is_active ? 'badge-success' : 'badge-danger'}`}
                      style={{ cursor: 'pointer', border: 'none', fontSize: 10 }}>
                      {b.is_active ? '● Active' : '○ Inactive'}
                    </button>
                  </td>
                  <td>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                      {b.uploader?.full_name && <div>{b.uploader.full_name}</div>}
                      <div>{formatDate(b.createdAt)}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {(hasLocal || hasExternal) && (
                        <button onClick={() => setShowPreviewModal(b)}
                          className="btn btn-secondary btn-sm" style={{ fontSize: 11, padding: '4px 10px' }}>
                          👁️ View
                        </button>
                      )}
                      <button onClick={() => openEdit(b)} className="btn btn-accent btn-sm" style={{ fontSize: 11, padding: '4px 10px' }}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDelete(b.id)} className="btn btn-danger btn-sm" style={{ fontSize: 11, padding: '4px 10px' }}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ═══ ADD/EDIT MODALS ═══ */}
      {showAddModal && renderBookModal(false)}
      {showEditModal && renderBookModal(true)}

      {/* ═══ PREVIEW MODAL ═══ */}
      {showPreviewModal && (() => {
        const book = showPreviewModal;
        const hasLocal = book.local_file && book.local_file.trim() !== '';
        const hasExternal = book.pdf_url && book.pdf_url.trim() !== '';
        const viewUrl = hasLocal ? book.local_file : hasExternal ? book.pdf_url : null;
        const isLocal = hasLocal;

        return (
          <div className="modal-overlay" onClick={() => setShowPreviewModal(null)}>
            <div className="modal-panel" style={{ maxWidth: 900, maxHeight: '95vh' }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h2>📄 {book.title}</h2>
                  {isLocal && <span className="badge badge-success" style={{ fontSize: 10 }}>Local</span>}
                  {!isLocal && hasExternal && <span className="badge badge-warning" style={{ fontSize: 10 }}>External</span>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {viewUrl && (
                    <a href={viewUrl} target="_blank" rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm" style={{ fontSize: 12, textDecoration: 'none' }}>
                      Open in Tab ↗
                    </a>
                  )}
                  <button onClick={() => setShowPreviewModal(null)} className="btn btn-ghost btn-sm">✕</button>
                </div>
              </div>
              <div style={{ padding: '0 0 0' }}>
                {isLocal ? (
                  <iframe
                    src={viewUrl}
                    style={{ width: '100%', height: '75vh', border: 'none', display: 'block' }}
                    title={book.title}
                  />
                ) : hasExternal ? (
                  <div style={{ padding: 48, textAlign: 'center' }}>
                    <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🌐</span>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>External Resource</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
                      This book is hosted externally. Click below to open.
                    </p>
                    <button onClick={() => window.open(book.pdf_url, '_blank')} className="btn btn-warm btn-lg">
                      🌐 Open External Link →
                    </button>
                  </div>
                ) : (
                  <div style={{ padding: 48, textAlign: 'center' }}>
                    <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>❌</span>
                    <p style={{ color: 'var(--text-tertiary)' }}>No file available for preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══ BULK UPLOAD MODAL ═══ */}
      {showBulkModal && (
        <div className="modal-overlay" onClick={() => !bulkUploading && setShowBulkModal(false)}>
          <div className="modal-panel" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📤 Bulk Upload Books</h2>
              <button onClick={() => !bulkUploading && setShowBulkModal(false)} className="btn btn-ghost btn-sm" disabled={bulkUploading}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Select a class and subject, then upload multiple PDF files. Each file will be saved as a separate book.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Class *</label>
                  <select value={bulkClass} onChange={e => setBulkClass(e.target.value)} className="form-select" disabled={bulkUploading}>
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Subject *</label>
                  <select value={bulkSubject} onChange={e => setBulkSubject(e.target.value)} className="form-select" disabled={bulkUploading}>
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Drag and Drop zone for bulk */}
              <div
                onClick={() => !bulkUploading && bulkInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer?.files || []).filter(f => {
                    const ext = f.name.split('.').pop().toLowerCase();
                    return ['pdf', 'doc', 'docx'].includes(ext);
                  });
                  setBulkFiles(prev => [...prev, ...files]);
                }}
                onDragOver={(e) => e.preventDefault()}
                style={{
                  border: '2px dashed var(--border-medium)', borderRadius: 14,
                  padding: '32px 20px', textAlign: 'center', cursor: bulkUploading ? 'default' : 'pointer',
                  background: 'var(--bg-surface-2)', transition: 'all 0.2s ease',
                }}
              >
                <input ref={bulkInputRef} type="file" multiple accept=".pdf,.doc,.docx" onChange={handleBulkFilesSelect} style={{ display: 'none' }} />
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(30,58,95,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 28 }}>📤</div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Drop PDF files here for bulk upload
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  or <span style={{ color: '#1e3a5f', fontWeight: 600, textDecoration: 'underline' }}>click to browse</span> • PDF, DOC, DOCX • Max 100MB each
                </p>
              </div>

              {/* Selected files list */}
              {bulkFiles.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{bulkFiles.length} file(s) selected:</p>
                  {bulkFiles.map((file, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 8, background: 'var(--bg-surface-2)', border: '1px solid var(--border-light)' }}>
                      <span style={{ fontSize: 14 }}>📄</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{formatSize(file.size)}</div>
                      </div>
                      {!bulkUploading && (
                        <button type="button" onClick={() => removeBulkFile(i)} style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', fontSize: 12, color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Progress bar */}
              {bulkUploading && bulkProgress > 0 && (
                <div>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--border-light)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #10b981, #059669)', width: `${bulkProgress}%`, transition: 'width 0.3s ease' }} />
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Uploading... {bulkProgress}%</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowBulkModal(false)} className="btn btn-secondary" disabled={bulkUploading}>Cancel</button>
              <button onClick={handleBulkUpload} className="btn btn-accent" disabled={bulkUploading || bulkFiles.length === 0}>
                {bulkUploading ? '⏳ Uploading...' : `Upload ${bulkFiles.length} Book(s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

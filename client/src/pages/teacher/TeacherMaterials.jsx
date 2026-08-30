import { useState, useEffect } from 'react';
import api, { FILE_BASE } from '../../services/api';

export default function TeacherMaterials() {
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ course_id: '', title: '', type: 'notes', content: '', external_url: '' });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [m, c] = await Promise.all([api.get('/teacher/materials'), api.get('/teacher/courses')]);
      setMaterials(m.data.materials || []);
      setCourses(c.data.courses || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setMsg('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('file', file);
      await api.post('/teacher/materials', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMsg('✅ Material uploaded!');
      setShowForm(false); setForm({ course_id: '', title: '', type: 'notes', content: '', external_url: '' }); setFile(null);
      fetchData();
    } catch (err) { setMsg('❌ ' + (err.response?.data?.error || 'Upload failed.')); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this material?')) return;
    try { await api.delete(`/teacher/materials/${id}`); fetchData(); }
    catch (err) { console.error(err); }
  };

  const typeIcons = { notes: '📝', pdf: '📄', video: '🎥', link: '🔗', assignment: '📋' };

  if (loading) return <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />)}</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div><h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>📦 Course Materials</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Upload and manage learning materials for your courses</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? '✕ Cancel' : '+ Upload Material'}</button>
      </div>

      {msg && <div className="alert" style={{ background: msg.startsWith('✅') ? '#ecfdf5' : '#fef2f2', color: msg.startsWith('✅') ? '#059669' : '#dc2626', border: `1px solid ${msg.startsWith('✅') ? '#a7f3d0' : '#fecaca'}` }}>{msg}</div>}

      {showForm && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Upload New Material</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div><label className="form-label">Course *</label>
                <select className="form-select" value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))} required>
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.class?.display_name} • {c.subject?.name})</option>)}
                </select></div>
              <div><label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="Material title" /></div>
              <div><label className="form-label">Type</label>
                <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="notes">Notes</option><option value="pdf">PDF</option><option value="video">Video</option>
                  <option value="link">Link</option><option value="assignment">Assignment</option>
                </select></div>
            </div>
            <div><label className="form-label">Content / Description</label>
              <textarea className="form-input" rows={3} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Optional description or notes..." /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div><label className="form-label">File Upload</label>
                <input type="file" onChange={e => setFile(e.target.files[0])} className="form-input" style={{ padding: 8 }} /></div>
              <div><label className="form-label">External URL</label>
                <input className="form-input" value={form.external_url} onChange={e => setForm(f => ({ ...f, external_url: e.target.value }))} placeholder="https://..." /></div>
            </div>
            <button type="submit" className="btn btn-accent" disabled={submitting}>{submitting ? '⏳ Uploading...' : '🚀 Upload Material'}</button>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {materials.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📦</span>
            <p style={{ fontSize: 16, fontWeight: 600 }}>No materials uploaded yet</p></div>
        ) : materials.map(m => (
          <div key={m.id} className="card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flex: 1, minWidth: 200 }}>
              <span style={{ fontSize: 28 }}>{typeIcons[m.type] || '📄'}</span>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{m.title}</h4>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  {m.course?.class?.display_name} • {m.course?.subject?.name} • <span className="badge badge-info">{m.type}</span>
                </p>
                {m.content && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{m.content.slice(0, 100)}</p>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {m.file_path && <a href={`${FILE_BASE}/uploads/${m.file_path}`} target="_blank" className="btn btn-sm btn-secondary">📥 Download</a>}
              {m.external_url && <a href={m.external_url} target="_blank" className="btn btn-sm btn-secondary">🔗 Link</a>}
              <button onClick={() => handleDelete(m.id)} className="btn btn-sm btn-danger">🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

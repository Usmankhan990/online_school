import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function TeacherHomework() {
  const [homework, setHomework] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ course_id: '', title: '', description: '', type: 'homework', due_date: '', total_marks: 10 });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    try {
      const [h, c] = await Promise.all([api.get('/teacher/homework'), api.get('/teacher/courses')]);
      setHomework(h.data.homework || []); setCourses(c.data.courses || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setMsg('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('file', file);
      await api.post('/teacher/homework', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMsg('✅ Homework created!'); setShowForm(false);
      setForm({ course_id: '', title: '', description: '', type: 'homework', due_date: '', total_marks: 10 }); setFile(null);
      fetchData();
    } catch (err) { setMsg('❌ ' + (err.response?.data?.error || 'Failed.')); } finally { setSubmitting(false); }
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
              <div><label className="form-label">Course *</label>
                <select className="form-select" value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))} required>
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.class?.display_name} • {c.subject?.name})</option>)}
                </select></div>
              <div><label className="form-label">Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="Homework title" /></div>
              <div><label className="form-label">Due Date *</label>
                <input type="datetime-local" className="form-input" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} required /></div>
              <div><label className="form-label">Total Marks</label>
                <input type="number" className="form-input" value={form.total_marks} onChange={e => setForm(f => ({ ...f, total_marks: e.target.value }))} min={1} /></div>
            </div>
            <div><label className="form-label">Instructions / Description</label>
              <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Homework instructions..." /></div>
            <div><label className="form-label">Attachment (optional)</label>
              <input type="file" onChange={e => setFile(e.target.files[0])} className="form-input" style={{ padding: 8 }} /></div>
            <button type="submit" className="btn btn-accent" disabled={submitting}>{submitting ? '⏳...' : '🚀 Create Homework'}</button>
          </form>
        </div>
      )}
      <div style={{ display: 'grid', gap: 12 }}>
        {homework.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📝</span>
            <p style={{ fontSize: 16, fontWeight: 600 }}>No homework created yet</p></div>
        ) : homework.map(h => (
          <div key={h.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{h.title}</h3>
                  <span className={`badge ${new Date(h.due_date) > new Date() ? 'badge-success' : 'badge-warning'}`}>
                    {new Date(h.due_date) > new Date() ? 'Active' : 'Past Due'}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>{h.description}</p>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                  <span>📚 {h.course?.class?.display_name} • {h.course?.subject?.name}</span>
                  <span>📅 Due: {new Date(h.due_date).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  <span>📊 {h.total_marks} marks</span>
                  <span>📤 {h.submissions?.length || 0} submissions</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

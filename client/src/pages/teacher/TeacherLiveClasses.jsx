import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function TeacherLiveClasses() {
  const [liveClasses, setLiveClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ course_id: '', title: '', description: '', meeting_url: '', scheduled_at: '', duration_minutes: 45 });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [lc, c] = await Promise.all([
        api.get('/teacher/live-classes'),
        api.get('/teacher/courses'),
      ]);
      setLiveClasses(lc.data.liveClasses || []);
      setCourses(c.data.courses || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');
    try {
      const res = await api.post('/teacher/live-classes', form);
      setMsg(`✅ Live class created! ${res.data.notified || 0} students notified.`);
      setShowForm(false);
      setForm({ course_id: '', title: '', description: '', meeting_url: '', scheduled_at: '', duration_minutes: 45 });
      fetchData();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Failed to create live class.'));
    } finally { setSubmitting(false); }
  };

  const getStatusColor = (s) => ({ scheduled: '#3b82f6', live: '#10b981', completed: '#6b7280', cancelled: '#ef4444' }[s] || '#6b7280');
  const getStatusBg = (s) => ({ scheduled: '#eff6ff', live: '#ecfdf5', completed: '#f9fafb', cancelled: '#fef2f2' }[s] || '#f9fafb');

  if (loading) return <div className="flex flex-col gap-5 min-w-0">{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>📹 Live Classes</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Schedule online classes and auto-notify all students</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', fontWeight: 600, cursor: 'pointer', background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: 'white' }}>
          {showForm ? '✕ Cancel' : '+ Schedule Class'}
        </button>
      </div>

      {msg && <div className="card" style={{ padding: 16, background: msg.startsWith('✅') ? '#ecfdf5' : '#fef2f2', color: msg.startsWith('✅') ? '#059669' : '#dc2626', fontWeight: 600, fontSize: 14 }}>{msg}</div>}

      {showForm && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Schedule New Live Class</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Course *</label>
                <select value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))} required style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }}>
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.class?.display_name} • {c.subject?.name})</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g., Math Revision Class" required style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Date & Time *</label>
                <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} required style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Duration (minutes)</label>
                <input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} min={15} max={180} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Meeting URL (Zoom/Meet)</label>
                <input value={form.meeting_url} onChange={e => setForm(f => ({ ...f, meeting_url: e.target.value }))} placeholder="https://meet.google.com/..." style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Topics to be covered..." style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14, resize: 'vertical' }} />
            </div>
            <button type="submit" disabled={submitting} style={{ padding: '12px 24px', borderRadius: 10, border: 'none', fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', color: 'white', fontSize: 14, opacity: submitting ? 0.6 : 1 }}>
              {submitting ? '⏳ Creating...' : '🚀 Schedule & Notify Students'}
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gap: 16 }}>
        {liveClasses.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📹</span>
            <p style={{ fontSize: 16, fontWeight: 600 }}>No live classes scheduled yet</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Click "Schedule Class" to create your first online class</p>
          </div>
        ) : liveClasses.map(lc => (
          <div key={lc.id} className="card" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>📹</span>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{lc.title}</h3>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 99, color: getStatusColor(lc.status), background: getStatusBg(lc.status) }}>
                  {lc.status?.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{lc.description}</p>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                <span>📚 {lc.course?.class?.display_name} • {lc.course?.subject?.name}</span>
                <span>📅 {new Date(lc.scheduled_at).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                <span>⏱ {lc.duration_minutes} min</span>
              </div>
            </div>
            {lc.meeting_url && (
              <a href={lc.meeting_url} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 16px', borderRadius: 8, background: '#10b981', color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                🔗 Open Meeting
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

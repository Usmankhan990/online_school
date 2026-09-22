import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

export default function TeacherLiveClasses() {
  const [liveClasses, setLiveClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    course_id: '',
    title: '',
    description: '',
    meeting_url: '',
    scheduled_at: '',
    duration_minutes: 45,
    status: 'scheduled'
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const dateTimerRef = useRef(null);

  const handleDateTimeChange = (e) => {
    const val = e.target.value;
    const target = e.target;
    setForm(f => ({ ...f, scheduled_at: val }));
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
      const [lc, c] = await Promise.all([
        api.get('/teacher/live-classes'),
        api.get('/teacher/courses'),
      ]);
      setLiveClasses(lc.data.liveClasses || []);
      setCourses(c.data.courses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatForInput = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      course_id: '',
      title: '',
      description: '',
      meeting_url: '',
      scheduled_at: '',
      duration_minutes: 45,
      status: 'scheduled'
    });
    setShowForm(true);
    setMsg('');
  };

  const handleOpenEdit = (lc) => {
    setEditingId(lc.id);
    setForm({
      course_id: lc.course_id || '',
      title: lc.title || '',
      description: lc.description || '',
      meeting_url: lc.meeting_url || '',
      scheduled_at: formatForInput(lc.scheduled_at),
      duration_minutes: lc.duration_minutes || 45,
      status: lc.status || 'scheduled'
    });
    setShowForm(true);
    setMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.delete(`/teacher/live-classes/${id}`);
      setMsg('✅ Live class deleted successfully!');
      fetchData();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Failed to delete live class.'));
    }
  };

  const isTimeTooSoon = (dateStr) => {
    if (!dateStr) return false;
    const selected = new Date(dateStr).getTime();
    return selected < (Date.now() + 5 * 60 * 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isTimeTooSoon(form.scheduled_at)) {
      setMsg('❌ Please increase your time by at least 5 minutes from now.');
      return;
    }
    setSubmitting(true);
    setMsg('');
    try {
      if (editingId) {
        await api.put(`/teacher/live-classes/${editingId}`, form);
        setMsg('✅ Live class updated successfully!');
      } else {
        const res = await api.post('/teacher/live-classes', form);
        setMsg(`✅ Live class created! ${res.data.notified || 0} students notified.`);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ course_id: '', title: '', description: '', meeting_url: '', scheduled_at: '', duration_minutes: 45, status: 'scheduled' });
      fetchData();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || (editingId ? 'Failed to update live class.' : 'Failed to create live class.')));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (s) => ({ scheduled: '#3b82f6', live: '#10b981', completed: '#6b7280', cancelled: '#ef4444' }[s] || '#6b7280');
  const getStatusBg = (s) => ({ scheduled: '#eff6ff', live: '#ecfdf5', completed: '#f9fafb', cancelled: '#fef2f2' }[s] || '#f9fafb');

  if (loading) return <div className="flex flex-col gap-5 min-w-0">{[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>📹 Live Classes</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Schedule online classes, modify details, and auto-notify all students</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingId(null);
            } else {
              handleOpenCreate();
            }
          }}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
            background: showForm ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #7c3aed, #5b21b6)',
            color: showForm ? 'var(--text-primary)' : 'white'
          }}
        >
          {showForm ? '✕ Close Form' : '+ Schedule Class'}
        </button>
      </div>

      {msg && (
        <div
          className="card"
          style={{
            padding: 16,
            background: msg.startsWith('✅') ? '#ecfdf5' : '#fef2f2',
            color: msg.startsWith('✅') ? '#059669' : '#dc2626',
            border: `1px solid ${msg.startsWith('✅') ? '#a7f3d0' : '#fecaca'}`,
            fontWeight: 600,
            fontSize: 14,
            borderRadius: 10
          }}
        >
          {msg}
        </div>
      )}

      {showForm && (
        <div className="card" style={{ padding: 24, border: '2px solid var(--color-primary-600, #7c3aed)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {editingId ? '✏️ Edit Live Class' : '➕ Schedule New Live Class'}
            </h3>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              {editingId ? 'Modify class details and save changes' : 'Notify enrolled students'}
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Course *</label>
                <select
                  value={form.course_id}
                  onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }}
                >
                  <option value="">Select Course</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.class?.display_name} • {c.subject?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g., Math Revision Class"
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Date & Time *</label>
                <input
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={handleDateTimeChange}
                  onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: isTimeTooSoon(form.scheduled_at) ? '1.5px solid #ef4444' : '1px solid var(--border-light)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: 14
                  }}
                />
                {isTimeTooSoon(form.scheduled_at) && (
                  <span style={{ fontSize: 11, color: '#ef4444', marginTop: 4, display: 'block', fontWeight: 600 }}>
                    ⚠️ Please increase your time by at least 5 minutes from now.
                  </span>
                )}
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Duration (minutes)</label>
                <input
                  type="number"
                  value={form.duration_minutes}
                  onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
                  min={15}
                  max={180}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Meeting URL (Zoom/Meet)</label>
                <input
                  value={form.meeting_url}
                  onChange={e => setForm(f => ({ ...f, meeting_url: e.target.value }))}
                  placeholder="https://meet.google.com/..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }}
                />
              </div>

              {editingId && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live (Ongoing)</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="Topics to be covered in this live session..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14, resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '12px 28px',
                  borderRadius: 10,
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                  color: 'white',
                  fontSize: 14,
                  opacity: submitting ? 0.6 : 1
                }}
              >
                {submitting ? (editingId ? '⏳ Updating...' : '⏳ Creating...') : (editingId ? '💾 Save Changes' : '🚀 Schedule & Notify Students')}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); }}
                style={{
                  padding: '12px 20px',
                  borderRadius: 10,
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Live Classes List */}
      <div style={{ display: 'grid', gap: 16 }}>
        {liveClasses.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📹</span>
            <p style={{ fontSize: 16, fontWeight: 700 }}>No live classes scheduled yet</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Click "Schedule Class" to create your first online class</p>
          </div>
        ) : (
          liveClasses.map(lc => (
            <div key={lc.id} className="card" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 20 }}>📹</span>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{lc.title}</h3>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, color: getStatusColor(lc.status), background: getStatusBg(lc.status) }}>
                    {lc.status?.toUpperCase()}
                  </span>
                </div>
                {lc.description && (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{lc.description}</p>
                )}
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                  <span>📚 <b>Class:</b> {lc.course?.class?.display_name || 'Class'} • {lc.course?.subject?.name || 'Subject'}</span>
                  <span>📅 <b>Time:</b> {new Date(lc.scheduled_at).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  <span>⏱ <b>Duration:</b> {lc.duration_minutes} min</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(lc)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: '1px solid #7c3aed',
                    background: '#f5f3ff',
                    color: '#7c3aed',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                  title="Edit live class"
                >
                  ✏️ Edit
                </button>

                {lc.meeting_url && (
                  <a
                    href={lc.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      background: '#10b981',
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: 13,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    🔗 Open Meeting
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(lc.id, lc.title)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #fecaca',
                    background: '#fef2f2',
                    color: '#ef4444',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  title="Delete live class"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

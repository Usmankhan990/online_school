import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function StudentLiveClasses() {
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/student/live-classes').then(r => setLiveClasses(r.data.liveClasses || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const filtered = liveClasses.filter(lc => {
    if (filter === 'upcoming') return new Date(lc.scheduled_at) > now && lc.status === 'scheduled';
    if (filter === 'completed') return lc.status === 'completed';
    return true;
  });

  const getStatusStyle = (lc) => {
    const d = new Date(lc.scheduled_at);
    if (lc.status === 'live' || (d <= now && d.getTime() + lc.duration_minutes * 60000 > now.getTime())) return { color: '#10b981', bg: '#ecfdf5', label: '🔴 LIVE NOW' };
    if (lc.status === 'completed') return { color: '#6b7280', bg: '#f9fafb', label: '✅ Completed' };
    if (d > now) return { color: '#3b82f6', bg: '#eff6ff', label: '📅 Upcoming' };
    return { color: '#6b7280', bg: '#f9fafb', label: lc.status };
  };

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>🎥 Live Classes</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Join scheduled online classes with your teachers</p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['all', 'upcoming', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${filter === f ? '#7c3aed' : 'var(--border-light)'}`, background: filter === f ? '#7c3aed15' : 'transparent', color: filter === f ? '#7c3aed' : 'var(--text-secondary)', fontWeight: 600, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize' }}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🎥</span>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No live classes found</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Check back later for scheduled classes</p>
        </div>
      ) : filtered.map(lc => {
        const s = getStatusStyle(lc);
        return (
          <div key={lc.id} className="card" style={{ padding: 24, borderLeft: `4px solid ${s.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{lc.title}</h3>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 99, color: s.color, background: s.bg }}>{s.label}</span>
                </div>
                {lc.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>{lc.description}</p>}
                <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                  <span>📚 {lc.course?.subject?.name || 'Subject'}</span>
                  <span>👨‍🏫 {lc.course?.teacher?.full_name || 'Teacher'}</span>
                  <span>📅 {new Date(lc.scheduled_at).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  <span>⏱ {lc.duration_minutes} min</span>
                </div>
              </div>
              {lc.meeting_url && (
                <a href={lc.meeting_url} target="_blank" rel="noopener noreferrer" style={{ padding: '12px 24px', borderRadius: 10, background: s.label.includes('LIVE') ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                  {s.label.includes('LIVE') ? '🔴 Join Now' : '🔗 Open Link'}
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

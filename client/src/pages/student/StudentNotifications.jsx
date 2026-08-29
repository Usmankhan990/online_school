import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/student/notifications').then(r => setNotifications(r.data.notifications || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/student/notifications/${id}/read`);
      setNotifications(n => n.map(x => x.id === id ? { ...x, is_read: true } : x));
    } catch (err) { console.error(err); }
  };

  const markAllRead = async () => {
    try {
      await api.put('/student/notifications/read-all');
      setNotifications(n => n.map(x => ({ ...x, is_read: true })));
    } catch (err) { console.error(err); }
  };

  const typeIcons = { info: '📢', success: '✅', warning: '⚠️', error: '❌', approval: '🎫', result: '📊', fee: '💰', homework: '📝' };
  const typeColors = { info: '#3b82f6', success: '#10b981', warning: '#f59e0b', error: '#ef4444', approval: '#8b5cf6', result: '#6366f1', fee: '#f97316', homework: '#ec4899' };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter !== 'all') return n.type === filter;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 14 }} />)}</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>🔔 Notifications</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>✅ Mark All Read</button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['all', 'unread', 'info', 'fee', 'success', 'homework'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${filter === f ? '#7c3aed' : 'var(--border-light)'}`, background: filter === f ? '#7c3aed15' : 'transparent', color: filter === f ? '#7c3aed' : 'var(--text-secondary)', fontWeight: 600, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize' }}>
            {f === 'all' ? '📋 All' : f === 'unread' ? `🔴 Unread (${unreadCount})` : `${typeIcons[f] || ''} ${f}`}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🔕</span>
            <p style={{ fontSize: 16, fontWeight: 600 }}>No notifications</p>
          </div>
        ) : filtered.map(n => (
          <div key={n.id} onClick={() => !n.is_read && markRead(n.id)} className="card" style={{ padding: 16, cursor: !n.is_read ? 'pointer' : 'default', borderLeft: `4px solid ${typeColors[n.type] || '#6b7280'}`, opacity: n.is_read ? 0.7 : 1, background: n.is_read ? 'var(--bg-card)' : `${typeColors[n.type]}08` }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{typeIcons[n.type] || '📢'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{n.title}</h4>
                  {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message}</p>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6, display: 'block' }}>{new Date(n.createdAt || n.created_at).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

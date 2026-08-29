import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ParentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    try { const r = await api.get('/parent/notifications'); setNotifications(r.data.notifications || []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const markRead = async (id) => {
    try { await api.put(`/parent/notifications/${id}/read`); fetchData(); } catch (e) {}
  };
  const markAllRead = async () => {
    try { await api.put('/parent/notifications/read-all'); fetchData(); } catch (e) {}
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const typeIcons = { info: '📢', alert: '🔔', success: '✅', warning: '⚠️', class: '📹', exam: '📝', fee: '💰' };

  if (loading) return <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 14 }} />)}</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div><h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>🔔 Notifications</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{unreadCount} unread</p></div>
        {unreadCount > 0 && <button className="btn btn-sm btn-secondary" onClick={markAllRead}>✓ Mark All Read</button>}
      </div>
      {notifications.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🔔</span>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No notifications yet</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>You'll receive alerts about your child's activities here.</p></div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {notifications.map(n => (
            <div key={n.id} className="card" style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start', cursor: n.is_read ? 'default' : 'pointer', opacity: n.is_read ? 0.7 : 1, borderLeft: n.is_read ? 'none' : '3px solid #10b981' }} onClick={() => !n.is_read && markRead(n.id)}>
              <span style={{ fontSize: 24 }}>{typeIcons[n.type] || '📢'}</span>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{n.title}</h4>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{n.message}</p>
                <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>{new Date(n.created_at).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>
              {!n.is_read && <span className="badge badge-success" style={{ fontSize: 10 }}>New</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

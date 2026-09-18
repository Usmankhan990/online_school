import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function TeacherNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    try { const r = await api.get('/teacher/notifications'); setNotifications(r.data.notifications || []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const markRead = async (id) => {
    try { await api.put(`/teacher/notifications/${id}/read`); fetchData(); } catch (e) {}
  };
  const markAllRead = async () => {
    try { await api.put('/teacher/notifications/read-all'); fetchData(); } catch (e) {}
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const typeIcons = { info: '📢', alert: '🔔', success: '✅', warning: '⚠️', class: '📹', exam: '📝', fee: '💰' };

  if (loading) return <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 14 }} />)}</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div><h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>🔔 Notifications</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p></div>
        {unreadCount > 0 && <button className="btn btn-sm btn-secondary" onClick={markAllRead}>✓ Mark All Read</button>}
      </div>
      {notifications.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🔔</span>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No notifications</p></div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {notifications.map(notif => {
            const d = new Date(notif.createdAt || notif.created_at);
            const validDate = !isNaN(d) ? d : new Date();
            const tColor = notif.type === 'success' ? '#10b981' : notif.type === 'warning' ? '#f59e0b' : notif.type === 'error' ? '#ef4444' : notif.type === 'fee' ? '#f97316' : '#f59e0b';
            
            return (
              <div key={notif.id} onClick={() => !notif.is_read && markRead(notif.id)} style={{ padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: `4px solid ${tColor}`, borderRadius: 12, background: '#f8fafc', marginBottom: 12, cursor: !notif.is_read ? 'pointer' : 'default', opacity: notif.is_read ? 0.8 : 1 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{notif.type === 'success' ? '✅' : notif.type === 'warning' ? '⚠️' : notif.type === 'error' ? '🚨' : notif.type === 'fee' ? '💰' : typeIcons[notif.type] || 'ℹ️'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>{notif.title}</h4>
                      {!notif.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />}
                    </div>
                    <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.5, margin: 0 }}>{notif.message}</p>
                    <span style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 8, display: 'block' }}>{validDate.toLocaleTimeString('en-PK', { timeStyle: 'short' }).toLowerCase()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    role: 'all',
    title: '',
    message: '',
    type: 'info'
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/admin/notifications');
      setNotifications(data.notifications);
    } catch (err) {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) return alert('Title and message are required.');
    
    setSending(true);
    try {
      const { data } = await api.post('/admin/notifications', formData);
      alert(data.message);
      setFormData({ role: 'all', title: '', message: '', type: 'info' });
      fetchNotifications();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send announcement.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <h1>🔔 Notifications Center</h1>
        <p>Send announcements and manage system notifications.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'start' }}>
        {/* Send Notification Form */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ marginBottom: 16, fontSize: 18, fontWeight: 600 }}>New Announcement</h2>
          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Send To</label>
              <select name="role" value={formData.role} onChange={handleChange} className="input" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <option value="all">All Active Users</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
                <option value="parent">Parents</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className="input" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Urgent / Error</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="E.g. Holiday Announcement" className="input" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Message</label>
              <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Type your message here..." rows="4" className="input" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', resize: 'vertical' }}></textarea>
            </div>

            <button type="submit" disabled={sending} className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              {sending ? 'Sending...' : 'Send Announcement'}
            </button>
          </form>
        </div>

        {/* Recent Notifications List */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ marginBottom: 16, fontSize: 18, fontWeight: 600 }}>Recent System Notifications</h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading...</div>
          ) : error ? (
            <div style={{ padding: 16, background: '#fee2e2', color: '#b91c1c', borderRadius: 8 }}>{error}</div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No notifications found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 600, overflowY: 'auto' }}>
              {notifications.map(notif => (
                <div key={notif.id} style={{ padding: 16, border: '1px solid var(--border-color)', borderRadius: 8, display: 'flex', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    {notif.type === 'success' ? '✅' : notif.type === 'warning' ? '⚠️' : notif.type === 'error' ? '🚨' : 'ℹ️'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{notif.title}</h4>
                      <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {notif.message}
                    </p>
                    {notif.user && (
                      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-tertiary)' }}>
                        Sent to: {notif.user.full_name} ({notif.user.role})
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');

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

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const typeIcons = { info: '📢', success: '✅', warning: '⚠️', error: '❌', approval: '🎫', result: '📊', fee: '💰', homework: '📝' };

  return (
    <div className="page-container p-6 animate-fade-in max-w-7xl mx-auto flex flex-col md:flex-row gap-6 items-start">
      <div className="w-full md:w-1/3 shrink-0 sticky top-6">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3 leading-none">
            🔔 Notifications
          </h1>
          <p className="text-[16px] text-gray-500 mt-1 leading-relaxed">
            Send announcements and manage system notifications.
          </p>
        </div>

        {/* Create Notification Form */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">New Announcement</h2>
          <form onSubmit={handleSend} className="flex flex-col gap-5">
            <div>
              <label className="block mb-2 text-[15px] font-bold text-gray-900">Send To</label>
              <select name="role" value={formData.role} onChange={handleChange} className="form-input">
                <option value="all">All Active Users</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
                <option value="parent">Parents</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-2 text-[15px] font-bold text-gray-900">Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className="form-input">
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Urgent / Error</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-[15px] font-bold text-gray-900">Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="E.g. Holiday Announcement" className="form-input" />
            </div>

            <div>
              <label className="block mb-2 text-[15px] font-bold text-gray-900">Message</label>
              <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Type your message here..." rows="4" className="form-input resize-y"></textarea>
            </div>

            <button type="submit" disabled={sending} className="btn btn-primary w-full justify-center mt-2">
              {sending ? 'Sending...' : 'Send Announcement'}
            </button>
          </form>
        </div>
      </div>

      <div className="flex-1 w-full min-w-0">
        {/* Recent Notifications List */}
        <div className="glass-card p-6">
          <div className="flex flex-col gap-3" style={{ marginBottom: 32 }}>
            <h2 className="text-lg font-semibold text-gray-900 m-0 shrink-0">Recent System Notifications</h2>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['All', 'Unread', 'Info', 'Fee', 'Success'].map(f => (
                <button 
                  key={f} 
                  onClick={() => setFilter(f)} 
                  style={{ 
                    padding: '6px 14px', borderRadius: 8, 
                    border: `1px solid ${filter === f ? '#7c3aed' : '#e2e8f0'}`, 
                    background: filter === f ? '#7c3aed15' : 'transparent', 
                    color: filter === f ? '#7c3aed' : '#475569', 
                    fontWeight: 600, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize' 
                  }}
                >
                  {f === 'All' ? '📋 All' : f === 'Unread' ? `🔴 Unread (${unreadCount})` : `${typeIcons[f.toLowerCase()] || ''} ${f}`}
                </button>
              ))}
            </div>
          </div>
          
          {loading ? (
            <div className="text-center p-8 text-dark-500">Loading...</div>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 text-rose-500 rounded-lg">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="text-center p-8 text-dark-500">No notifications found.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {notifications.filter(notif => {
                if (filter === 'All') return true;
                if (filter === 'Unread') return !notif.is_read;
                
                const t = (notif.title || '').toLowerCase();
                const type = (notif.type || '').toLowerCase();
                
                if (filter === 'Fee') return t.includes('fee') || t.includes('payment') || t.includes('invoice');
                if (filter === 'Info') return type === 'info';
                if (filter === 'Success') return type === 'success';
                
                return true;
              }).map(notif => {
                const d = new Date(notif.createdAt || notif.created_at);
                const validDate = !isNaN(d) ? d : new Date();
                const tColor = notif.type === 'success' ? '#10b981' : notif.type === 'warning' ? '#f59e0b' : notif.type === 'error' ? '#ef4444' : notif.type === 'fee' ? '#f97316' : '#f59e0b';

                return (
                  <div key={notif.id} style={{ padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: `4px solid ${tColor}`, borderRadius: 12, background: '#f8fafc', marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>
                        {notif.type === 'success' ? '✅' : notif.type === 'warning' ? '⚠️' : notif.type === 'error' ? '🚨' : notif.type === 'fee' ? '💰' : 'ℹ️'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0, marginBottom: 6 }}>{notif.title}</h4>
                        <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.5, margin: 0 }}>{notif.message}</p>
                        <span style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 8, display: 'block' }}>
                          {validDate.toLocaleTimeString('en-PK', { timeStyle: 'short' }).toLowerCase()}
                        </span>
                        {notif.user && (
                          <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
                            Sent to: <span style={{ fontWeight: 600, color: '#334155' }}>{notif.user.full_name}</span> ({notif.user.role})
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

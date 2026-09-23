import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

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
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/admin/notifications/${id}/read`);
      setNotifications(n => n.map(x => x.id === id ? { ...x, is_read: true } : x));
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/admin/notifications/read-all');
      setNotifications(n => n.map(x => ({ ...x, is_read: true })));
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
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
      alert(data.message || 'Announcement sent successfully!');
      setFormData({ role: 'all', title: '', message: '', type: 'info' });
      setShowAnnouncementModal(false);
      fetchNotifications();
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send announcement.');
    } finally {
      setSending(false);
    }
  };

  const [expandedId, setExpandedId] = useState(null);

  const handleNotificationClick = (notif) => {
    if (!notif.is_read) {
      markRead(notif.id);
    }
    setExpandedId(prev => prev === notif.id ? null : notif.id);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const typeIcons = { info: '📢', success: '✅', warning: '⚠️', error: '❌', approval: '🎫', result: '📊', fee: '💰', homework: '📝' };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter !== 'all') return n.type === filter;
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col gap-5 min-w-0">
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 14 }} />)}
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>🔔 Notifications</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, margin: 0 }}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button 
            type="button" 
            onClick={() => setShowAnnouncementModal(true)} 
            style={{ 
              padding: '8px 16px', 
              borderRadius: 9999, 
              border: 'none', 
              background: '#1C1917', 
              color: '#ffffff', 
              fontWeight: 600, 
              fontSize: 13, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            📢 Send Announcement
          </button>
          {unreadCount > 0 && (
            <button 
              type="button" 
              onClick={markAllRead} 
              style={{ 
                padding: '8px 16px', 
                borderRadius: 8, 
                border: '1px solid var(--border-light)', 
                background: 'var(--bg-card)', 
                color: 'var(--text-secondary)', 
                fontWeight: 600, 
                fontSize: 13, 
                cursor: 'pointer' 
              }}
            >
              ✅ Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['all', 'unread', 'info', 'fee', 'success', 'warning', 'approval'].map(f => (
          <button 
            key={f} 
            type="button" 
            onClick={() => setFilter(f)} 
            style={{ 
              padding: '6px 14px', 
              borderRadius: 8, 
              border: `1px solid ${filter === f ? '#7c3aed' : 'var(--border-light)'}`, 
              background: filter === f ? '#7c3aed15' : 'transparent', 
              color: filter === f ? '#7c3aed' : 'var(--text-secondary)', 
              fontWeight: 600, 
              fontSize: 12, 
              cursor: 'pointer', 
              textTransform: 'capitalize' 
            }}
          >
            {f === 'all' ? '📋 All' : f === 'unread' ? `🔴 Unread (${unreadCount})` : `${typeIcons[f] || ''} ${f}`}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🔕</span>
            <p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>No notifications</p>
          </div>
        ) : filtered.map(notif => {
          const d = new Date(notif.createdAt || notif.created_at);
          const validDate = !isNaN(d) ? d : new Date();
          const tColor = notif.type === 'success' ? '#10b981' : notif.type === 'warning' ? '#f59e0b' : notif.type === 'error' ? '#ef4444' : notif.type === 'fee' ? '#f97316' : notif.type === 'approval' ? '#8b5cf6' : '#f59e0b';
          const isExpanded = expandedId === notif.id;

          return (
            <div 
              key={notif.id} 
              onClick={() => handleNotificationClick(notif)} 
              style={{ 
                padding: '16px 20px', 
                border: '1px solid var(--border-light)', 
                borderLeft: `4px solid ${tColor}`, 
                borderRadius: 12, 
                background: 'var(--bg-card)', 
                marginBottom: 12, 
                cursor: 'pointer', 
                opacity: notif.is_read ? 0.85 : 1,
                transition: 'all 0.2s ease',
                boxShadow: isExpanded ? '0 4px 12px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>
                  {notif.type === 'success' ? '✅' : notif.type === 'warning' ? '⚠️' : notif.type === 'error' ? '🚨' : notif.type === 'fee' ? '💰' : notif.type === 'approval' ? '🎫' : typeIcons[notif.type] || 'ℹ️'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{notif.title}</h4>
                    {!notif.is_read && (
                      <div 
                        style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} 
                        title="Unread" 
                      />
                    )}
                  </div>
                  <p 
                    style={{ 
                      fontSize: 13.5, 
                      color: 'var(--text-secondary)', 
                      lineHeight: 1.55, 
                      margin: 0,
                      display: isExpanded ? 'block' : '-webkit-box',
                      WebkitLineClamp: isExpanded ? 'unset' : 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: isExpanded ? 'visible' : 'hidden',
                      wordBreak: 'break-word',
                      whiteSpace: isExpanded ? 'pre-wrap' : 'normal'
                    }}
                  >
                    {notif.message}
                  </p>
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)', display: 'block' }}>
                      {validDate.toLocaleTimeString('en-PK', { timeStyle: 'short' }).toLowerCase()} • {validDate.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Announcement Modal */}
      {showAnnouncementModal && createPortal(
        <div 
          style={{ 
            position: 'fixed', 
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.65)', 
            backdropFilter: 'blur(4px)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 99999, 
            padding: '20px',
            boxSizing: 'border-box'
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAnnouncementModal(false); }}
        >
          <div 
            className="hide-scrollbar"
            style={{ 
              background: '#ffffff', 
              borderRadius: 16, 
              padding: '24px 28px', 
              maxWidth: 480, 
              width: '100%', 
              maxHeight: 'calc(100vh - 40px)',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', margin: 0 }}>📢 New Announcement</h2>
              <button 
                type="button" 
                onClick={() => setShowAnnouncementModal(false)} 
                style={{ 
                  background: '#f1f5f9', 
                  border: 'none', 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  fontSize: 16, 
                  cursor: 'pointer', 
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 700, color: '#334155' }}>Send To</label>
                <select name="role" value={formData.role} onChange={handleChange} className="form-input" style={{ width: '100%' }}>
                  <option value="all">All Active Users</option>
                  <option value="student">Students</option>
                  <option value="teacher">Teachers</option>
                  <option value="parent">Parents</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 700, color: '#334155' }}>Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className="form-input" style={{ width: '100%' }}>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Urgent / Error</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 700, color: '#334155' }}>Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="E.g. Holiday Announcement" className="form-input" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 700, color: '#334155' }}>Message</label>
                <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Type announcement details..." rows="3" className="form-input resize-y" style={{ width: '100%' }}></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                <button type="button" onClick={() => setShowAnnouncementModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={sending} className="btn btn-primary">
                  {sending ? 'Sending...' : 'Send Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

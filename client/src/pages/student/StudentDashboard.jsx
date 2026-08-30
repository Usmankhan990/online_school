import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/dashboard').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}
    </div>
  );

  const d = data || {};
  const cards = [
    { label: 'Enrolled Courses', value: d.enrolledCourses || 0, icon: '📚', color: '#3b82f6', bg: '#eff6ff', link: '/student/courses' },
    { label: 'Upcoming Exams', value: d.upcomingExams || 0, icon: '📝', color: '#f59e0b', bg: '#fffbeb', link: '/student/exams' },
    { label: 'Pending Homework', value: d.pendingHomework || 0, icon: '📋', color: '#ef4444', bg: '#fef2f2', link: '/student/homework' },
    { label: 'Attendance', value: `${d.attendancePercent || 0}%`, icon: '✅', color: '#10b981', bg: '#ecfdf5', link: '/student/attendance' },
    { label: 'Unread Notifications', value: d.unreadNotifications || 0, icon: '🔔', color: '#8b5cf6', bg: '#f5f3ff', link: '/student/notifications' },
    { label: 'Fees Due', value: d.feesDue ? `₨${d.feesDue.toLocaleString()}` : '₨0', icon: '💰', color: d.feesDue > 0 ? '#ef4444' : '#10b981', bg: d.feesDue > 0 ? '#fef2f2' : '#ecfdf5', link: '/student/fees' },
  ];

  const shortcuts = [
    { label: 'My Books', path: '/student/books', icon: '📚', desc: 'PCTB 2026 Library' },
    { label: 'Live Classes', path: '/student/live-classes', icon: '🎥', desc: 'Join now' },
    { label: 'Submit HW', path: '/student/homework', icon: '📝', desc: 'Pending tasks' },
    { label: 'Take Exam', path: '/student/exams', icon: '✍️', desc: 'Active exams' },
    { label: 'My Results', path: '/student/results', icon: '📊', desc: 'View grades' },
    { label: 'Report Card', path: '/student/report-card', icon: '🎓', desc: 'Download' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Welcome Banner */}
      <div className="card premium-gradient shadow-glow" style={{ padding: '40px', border: 'none', color: 'white', position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em' }}>
            Hello, {user?.full_name?.split(' ')[0]}! 🌟
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, maxWidth: 500 }}>
            Ready for your interactive tuition session? Success is built one lesson at a time.
          </p>
        </div>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 240, height: 240, background: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%', filter: 'blur(60px)' }} />
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
        {cards.map(c => (
          <Link key={c.label} to={c.link} className="stat-card hover-lift" style={{ textDecoration: 'none', padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="stat-label" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</div>
              <div className="stat-value" style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{c.value}</div>
            </div>
            <div className="stat-icon" style={{ background: c.bg, color: c.color, width: 52, height: 52, borderRadius: 14, fontSize: 24 }}>{c.icon}</div>
          </Link>
        ))}
      </div>

      {/* Tuition Hub Shortcuts */}
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20 }}>🚀 Your Tuition Hub</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
          {shortcuts.map(s => (
            <Link key={s.label} to={s.path} className="card-glass hover-lift" style={{ padding: '28px 20px', textDecoration: 'none', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 36 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{s.label}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginTop: 4, letterSpacing: '0.05em' }}>{s.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">
        
        {/* Left: Schedule */}
        <div className="card-glass" style={{ padding: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24 }}>📅 Interactive Class Schedule</h3>
          {(d.todaySchedule || []).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-tertiary)' }}>
              <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>📭</span>
              <p style={{ fontWeight: 600 }}>No live classes scheduled for today.</p>
              <Link to="/student/courses" className="btn btn-outline btn-sm" style={{ marginTop: 20 }}>Browse Recorded Courses</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {(d.todaySchedule || []).map((s, i) => (
                <div key={i} className="card hover-lift" style={{ display: 'flex', gap: 20, padding: 20, border: '1px solid var(--border-light)', background: 'var(--bg-surface-2)' }}>
                  <div style={{ width: 60, textAlign: 'center', flexShrink: 0, paddingRight: 20, borderRight: '2px solid var(--border-light)' }}>
                    <div style={{ fontWeight: 800, color: 'var(--color-primary-600)', fontSize: 13 }}>{s.start_time}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>{s.end_time}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{s.Subject?.name || s.subject_name || 'Subject'}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Instructor: <span style={{ fontWeight: 600 }}>{s.Teacher?.full_name || 'Staff'}</span></div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <Link to="/student/live-classes" className="btn btn-primary btn-sm">Join Live</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Notifications */}
        <div className="card-glass" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>🔔 Updates</h3>
            <Link to="/student/notifications" style={{ fontSize: 13, color: 'var(--color-primary-500)', fontWeight: 700, textDecoration: 'none' }}>All</Link>
          </div>
          {(d.notifications || []).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-tertiary)' }}>
              <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>🔕</span>
              <p style={{ fontSize: 14 }}>No new announcements.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {(d.notifications || []).slice(0, 5).map((n, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: 16, borderBottom: i !== 4 ? '1px solid var(--border-light)' : 'none' }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{n.type === 'success' ? '✅' : n.type === 'fee' ? '💰' : '📢'}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{n.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: 4 }}>{n.message?.substring(0, 80)}...</div>
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

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(res => {
      setStats(res.data.stats);
      setRecentStudents(res.data.recentStudents || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col gap-5 min-w-0">
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}
    </div>
  );

  const cards = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: '👨‍🎓', color: '#10b981', bg: '#ecfdf5', link: '/admin/students' },
    { label: 'Pending Admissions', value: stats?.pendingStudents || 0, icon: '⏳', color: '#f59e0b', bg: '#fffbeb', link: '/admin/pending-students' },
    { label: 'Total Teachers', value: stats?.totalTeachers || 0, icon: '👨‍🏫', color: '#3b82f6', bg: '#eff6ff', link: '/admin/teachers' },
    { label: 'Total Parents', value: stats?.totalParents || 0, icon: '👨‍👩‍👧', color: '#8b5cf6', bg: '#f5f3ff', link: '/admin/parents' },
    { label: 'Active Courses', value: stats?.totalCourses || 0, icon: '📚', color: '#06b6d4', bg: '#ecfeff', link: '/admin/courses' },
    { label: 'Total Exams', value: stats?.totalExams || 0, icon: '📝', color: '#ec4899', bg: '#fdf2f8', link: '/admin/exams' },
    { label: 'Fees Collected', value: `₨${(stats?.totalFeesPaid || 0).toLocaleString()}`, icon: '✅', color: '#10b981', bg: '#ecfdf5', link: '/admin/fees' },
    { label: 'Fees Pending', value: `₨${(stats?.totalFeesPending || 0).toLocaleString()}`, icon: '⚠️', color: '#ef4444', bg: '#fef2f2', link: '/admin/fees' },
  ];

  const quickActions = [
    { label: 'Approve Students', path: '/admin/pending-students', icon: '✅', color: '#10b981' },
    { label: 'Add Teacher', path: '/admin/teachers', icon: '➕', color: '#3b82f6' },
    { label: 'Manage Classes', path: '/admin/classes', icon: '🏫', color: '#8b5cf6' },
    { label: 'Upload Books', path: '/admin/books', icon: '📚', color: '#f59e0b' },
    { label: 'Send Notification', path: '/admin/notifications', icon: '🔔', color: '#06b6d4' },
    { label: 'Verify Payments', path: '/admin/payments', icon: '💳', color: '#ec4899' },
  ];

  return (
    <div className="animate-fade-in" className="flex flex-col gap-8 min-w-0">
      {/* Welcome Banner */}
      <div className="card premium-gradient" style={{ padding: '40px', border: 'none', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em' }}>
                Welcome, {user?.full_name?.split(' ')[0]}! 👑
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, maxWidth: 400 }}>
                The Usman Online School ecosystem is running smoothly. Your super-admin control panel is ready.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/admin/pending-students" className="btn btn-accent btn-lg hover-lift">
                Admissions <span className="badge badge-neutral" style={{marginLeft: 8}}>{stats?.pendingStudents}</span>
              </Link>
              <Link to="/admin/reports" className="btn btn-lg hover-lift" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                Analytics & ROI
              </Link>
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'rgba(16, 185, 129, 0.15)', borderRadius: '50%', filter: 'blur(50px)' }} />
      </div>

      {/* Main Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
        {cards.map(c => (
          <Link key={c.label} to={c.link} className="stat-card hover-lift" style={{ textDecoration: 'none', padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="stat-label" style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</div>
              <div className="stat-value" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{c.value}</div>
            </div>
            <div className="stat-icon" style={{ background: c.bg, color: c.color, width: 52, height: 52, borderRadius: 14, fontSize: 24 }}>{c.icon}</div>
          </Link>
        ))}
      </div>

      {/* Grid for Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8 items-start min-w-0">
        
        {/* Left Side: Table & Detailed Stats */}
        <div className="flex flex-col gap-8 min-w-0">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>📋 Recent Member Registrations</h3>
              <Link to="/admin/students" style={{ fontSize: 14, color: '#1e3a5f', fontWeight: 700, textDecoration: 'none' }}>View Detailed Directory →</Link>
            </div>
            <div className="card-glass table-responsive">
              <table className="data-table">
                <thead>
                  <tr><th>Identity</th><th>Class Level</th><th>Current Status</th><th>Joined</th></tr>
                </thead>
                <tbody>
                  {recentStudents.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: 48, color: 'var(--text-tertiary)' }}>No recent data available.</td></tr>
                  ) : recentStudents.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="avatar avatar-md" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', fontWeight: 800 }}>{s.full_name?.charAt(0)}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 15 }}>{s.full_name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{s.studentProfile?.class?.display_name || 'N/A'}</span>
                      </td>
                      <td>
                        <span className={`badge ${s.status === 'active' ? 'badge-success' : s.status === 'pending' ? 'badge-warning' : 'badge-danger'}`} style={{ padding: '6px 12px' }}>
                          {s.status?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Actions & System Info */}
        <div className="flex flex-col gap-8 min-w-0">
          <div className="card-glass" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20 }}>⚡ CRM Core Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map(a => (
                <Link key={a.label} to={a.path} className="card hover-lift" style={{ padding: '20px 12px', textDecoration: 'none', textAlign: 'center', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 24 }}>{a.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{a.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 24, background: 'var(--bg-surface-2)', border: '1px dashed var(--border-medium)' }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>System Health</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Database Status</span>
                <span className="badge badge-success">STABLE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Live Server Latency</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>12ms</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Storage Used</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>1.2 GB / 10 GB</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

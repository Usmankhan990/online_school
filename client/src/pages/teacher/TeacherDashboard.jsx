import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teacher/dashboard').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}
    </div>
  );

  const d = data || {};
  const cards = [
    { label: 'My Courses', value: d.totalCourses || 0, icon: '📚', color: '#3b82f6', bg: '#eff6ff', link: '/teacher/courses' },
    { label: 'Total Students', value: d.totalStudents || 0, icon: '👨‍🎓', color: '#10b981', bg: '#ecfdf5', link: '/teacher/courses' },
    { label: 'Pending Submissions', value: d.pendingSubmissions || 0, icon: '📋', color: '#f59e0b', bg: '#fffbeb', link: '/teacher/submissions' },
    { label: 'Upcoming Exams', value: d.upcomingExams || 0, icon: '📝', color: '#8b5cf6', bg: '#f5f3ff', link: '/teacher/exams' },
  ];

  const quickActions = [
    { label: 'Create Course', path: '/teacher/courses', icon: '➕' },
    { label: 'Upload Material', path: '/teacher/materials', icon: '📤' },
    { label: 'Post Homework', path: '/teacher/homework', icon: '📝' },
    { label: 'Mark Attendance', path: '/teacher/attendance', icon: '✅' },
    { label: 'Create Exam', path: '/teacher/exams', icon: '📋' },
    { label: 'Grade Papers', path: '/teacher/results', icon: '📊' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Welcome Banner */}
      <div className="card premium-gradient" style={{ padding: '40px', border: 'none', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em' }}>
            Good day, {user?.full_name?.split(' ')[0]}! 👨‍🏫
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, maxWidth: 500 }}>
            Your classroom is ready. Manage your modular courses, mark teacher/student attendance, and grade submissions with ease.
          </p>
        </div>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, background: 'rgba(59, 130, 246, 0.2)', borderRadius: '50%', filter: 'blur(60px)' }} />
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
        {cards.map(c => (
          <Link key={c.label} to={c.link} className="stat-card hover-lift" style={{ textDecoration: 'none', padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="stat-label" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</div>
              <div className="stat-value" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{c.value}</div>
            </div>
            <div className="stat-icon" style={{ background: c.bg, color: c.color, width: 52, height: 52, borderRadius: 14, fontSize: 24 }}>{c.icon}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions Bar */}
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>⚡ Instructor Toolbox</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {quickActions.map(a => (
            <Link key={a.label} to={a.path} className="card-glass hover-lift" style={{ padding: '24px 16px', textDecoration: 'none', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 32 }}>{a.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Detailed View Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
        
        {/* Left Side: Course Management */}
        <div className="card-glass" style={{ padding: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>📚 Modular Course Overview</h3>
            <Link to="/teacher/courses" style={{ fontSize: 14, color: 'var(--color-primary-500)', fontWeight: 700, textDecoration: 'none' }}>Build New Modules →</Link>
          </div>
          
          {(d.courses || []).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-tertiary)' }}>
              <p style={{ fontSize: 48, marginBottom: 16 }}>📭</p>
              <p style={{ fontWeight: 600 }}>No courses assigned to your profile yet.</p>
              <Link to="/teacher/courses" className="btn btn-primary" style={{ marginTop: 20 }}>Create Your First Course</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(d.courses || []).map(c => (
                <div key={c.id} className="card hover-lift" style={{ padding: 20, border: '1px solid var(--border-light)', background: 'var(--bg-surface-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{c.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                      <span className="badge badge-neutral">{c.class?.display_name || 'N/A'}</span>
                      <span style={{ margin: '0 8px', color: 'var(--border-medium)' }}>|</span>
                      <span>{c.subject?.name}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-accent-600)', background: 'var(--color-accent-50)', padding: '6px 14px', borderRadius: 99 }}>
                    {c.enrollments?.length || 0} Learners
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Feed / Activities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div className="card-glass" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20 }}>🔔 Activity Feed</h3>
            {(d.notifications || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-tertiary)' }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>🔕</p>
                <p style={{ fontSize: 14 }}>All quiet for now!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {(d.notifications || []).slice(0, 6).map((n, i) => (
                  <div key={i} style={{ paddingBottom: 16, borderBottom: i !== 5 ? '1px solid var(--border-light)' : 'none' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{n.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

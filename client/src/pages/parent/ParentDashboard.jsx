import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function ParentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/parent/dashboard').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col gap-5 min-w-0">
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}
    </div>
  );

  const d = data || {};

  const cards = [
    { label: 'Attendance', value: `${d.attendancePercent || 0}%`, icon: '✅', color: '#10b981', bg: '#ecfdf5', link: '/parent/attendance' },
    { label: 'Pending HW', value: d.pendingHomework || 0, icon: '📋', color: '#f59e0b', bg: '#fffbeb', link: '/parent/homework' },
    { label: 'Latest Result', value: d.latestResult || '-', icon: '📊', color: '#3b82f6', bg: '#eff6ff', link: '/parent/results' },
    { label: 'Fees Due', value: d.feesDue ? `₨${d.feesDue.toLocaleString()}` : '₨0', icon: '💰', color: d.feesDue > 0 ? '#ef4444' : '#10b981', bg: d.feesDue > 0 ? '#fef2f2' : '#ecfdf5', link: '/parent/fees' },
  ];

  const shortcuts = [
    { label: 'Child Overview', path: '/parent/child', icon: '👧' },
    { label: 'Attendance', path: '/parent/attendance', icon: '📅' },
    { label: 'Homework', path: '/parent/homework', icon: '📝' },
    { label: 'Results', path: '/parent/results', icon: '📊' },
    { label: 'Report Card', path: '/parent/report-card', icon: '🎓' },
    { label: 'Fee Status', path: '/parent/fees', icon: '💳' },
  ];

  return (
    <div className="animate-fade-in" className="flex flex-col gap-8 min-w-0">
      {/* Welcome Banner */}
      <div className="card" style={{ padding: '40px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', color: 'white', position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em' }}>
            Welcome, {user?.full_name?.split(' ')[0]}! 👨‍👩‍👧
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, maxWidth: 500 }}>
            {d.childName ? `Stay connected with ${d.childName}'s academic journey and school milestones.` : 'Monitor your child\'s academic progress and stay updated with school activities.'}
          </p>
        </div>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 220, height: 220, background: 'rgba(255, 255, 255, 0.15)', borderRadius: '50%', filter: 'blur(50px)' }} />
      </div>

      {/* Child Spotlight */}
      {d.childName && (
        <div className="card-glass shadow-glow" style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', gap: 24, border: '1px solid var(--border-light)' }}>
          <div className="avatar avatar-lg shadow-md" style={{ background: 'var(--color-primary-600)', color: 'white', fontSize: 24, width: 64, height: 64 }}>{d.childName?.charAt(0)}</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{d.childName}</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4, display: 'flex', gap: 12, alignItems: 'center' }}>
              <span className="badge badge-info">{d.childClass || 'Class'}</span>
              <span style={{ color: 'var(--border-medium)' }}>•</span>
              <span style={{ fontWeight: 600 }}>Roll No: {d.childRollNo || '-'}</span>
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Link to="/parent/report-card" className="btn btn-outline btn-sm hover-lift">Full Academic Profile</Link>
          </div>
        </div>
      )}

      {/* Quick Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
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

      {/* Portal Navigation */}
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20 }}>📱 Parent Portal Access</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {shortcuts.map(s => (
            <Link key={s.label} to={s.path} className="card-glass hover-lift" style={{ padding: '32px 16px', textDecoration: 'none', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 36 }}>{s.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{s.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

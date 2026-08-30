import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ParentAttendance() {
  const [dashboard, setDashboard] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/parent/dashboard');
        setDashboard(res.data);
        // Attendance from dashboard child data
        if (res.data.child?.attendance) {
          setAttendance(res.data.child.attendance);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const statusColors = { present: '#10b981', absent: '#ef4444', late: '#f59e0b', leave: '#6366f1' };
  const statusEmoji = { present: '✅', absent: '❌', late: '⏰', leave: '🏠' };

  if (loading) return <div className="flex flex-col gap-5 min-w-0">{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}</div>;

  const child = dashboard?.child;
  const stats = dashboard?.attendanceStats || {};

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>📅 Child's Attendance</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          Monitoring attendance for <strong>{child?.full_name || 'your child'}</strong> — {child?.class?.display_name || ''}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Days', value: stats.totalDays || 0, icon: '📅', color: '#3b82f6' },
          { label: 'Present', value: stats.presentDays || 0, icon: '✅', color: '#10b981' },
          { label: 'Absent', value: stats.absentDays || 0, icon: '❌', color: '#ef4444' },
          { label: 'Percentage', value: `${stats.percentage || 100}%`, icon: '📊', color: parseFloat(stats.percentage || 100) >= 75 ? '#10b981' : '#ef4444' },
        ].map(c => (
          <div key={c.label} className="stat-card">
            <div>
              <div className="stat-label">{c.label}</div>
              <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
            </div>
            <div className="stat-icon">{c.icon}</div>
          </div>
        ))}
      </div>

      {/* Attendance Grid */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Attendance Records</h3>
        {attendance.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>📭</span>
            <p>No attendance records available yet</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
            {attendance.map((a, i) => (
              <div key={i} style={{ padding: 12, borderRadius: 10, border: `1.5px solid ${statusColors[a.status]}30`, background: `${statusColors[a.status]}08`, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>{new Date(a.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</div>
                <div style={{ fontSize: 22 }}>{statusEmoji[a.status]}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: statusColors[a.status], textTransform: 'capitalize', marginTop: 2 }}>{a.status}</div>
                {a.verification_method === 'selfie' && <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>📸 Selfie Verified</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

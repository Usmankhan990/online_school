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
        const children = res.data.children || [];
        if (children.length > 0) {
          const firstChild = children[0];
          setDashboard({
            child: { ...firstChild.profile?.user, class: firstChild.profile?.class },
            attendanceStats: firstChild.attendance,
          });
          
          // Fetch actual attendance records for the child
          const studentId = firstChild.profile?.user_id || firstChild.profile?.id;
          const attRes = await api.get(`/parent/child-attendance?student_id=${studentId}`);
          setAttendance(attRes.data.attendance || []);
        } else {
          setDashboard(null);
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

      {/* Attendance Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Attendance Records</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Daily presence logs and verification history</p>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-surface-2, #f1f5f9)', padding: '4px 12px', borderRadius: 999 }}>
            {attendance.length} Total Records
          </span>
        </div>

        {attendance.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <span style={{ fontSize: 44, display: 'block', marginBottom: 10 }}>📭</span>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>No attendance records available yet</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Attendance records will appear here as they are marked.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-2, #f8fafc)', borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Day</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verification</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((a, i) => {
                  const dateObj = new Date(a.date);
                  const formattedDate = dateObj.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
                  const dayName = dateObj.toLocaleDateString('en-PK', { weekday: 'long' });
                  const isSelfie = a.verification_method === 'selfie';

                  const badgeStyles = {
                    present: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0', icon: '✅', label: 'Present' },
                    absent:  { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', icon: '❌', label: 'Absent' },
                    late:    { bg: '#fffbeb', text: '#d97706', border: '#fde68a', icon: '⏰', label: 'Late' },
                    leave:   { bg: '#eef2ff', text: '#4f46e5', border: '#c7d2fe', icon: '🏠', label: 'Leave' },
                  };
                  const badge = badgeStyles[a.status] || { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', icon: 'ℹ️', label: a.status };

                  return (
                    <tr
                      key={a.id || i}
                      style={{
                        borderBottom: '1px solid var(--border-light)',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-surface-2, #f8fafc)'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {formattedDate}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                        {dayName}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 12px',
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          background: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`
                        }}>
                          <span>{badge.icon}</span>
                          <span style={{ textTransform: 'capitalize' }}>{badge.label}</span>
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        {isSelfie ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '4px 10px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #dbeafe'
                          }}>
                            📸 Selfie Verified
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '4px 10px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 500,
                            background: 'var(--bg-surface-2)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-light)'
                          }}>
                            ✍️ Manual (Teacher)
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-tertiary)', fontSize: 12.5 }}>
                        {a.remarks || (a.status === 'present' ? 'Regular Attendance' : a.status === 'late' ? 'Marked Late' : a.status === 'leave' ? 'Approved Leave' : 'Absent')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

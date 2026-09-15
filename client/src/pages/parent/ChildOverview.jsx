import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function ChildOverview() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await api.get('/parent/dashboard');
        setChildren(res.data.children || []);
      } catch (err) {
        console.error('Failed to load child overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  if (loading) {
    return (
      <div className="animate-fade-in flex flex-col gap-5 min-w-0">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />
        ))}
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="animate-fade-in flex flex-col gap-8 min-w-0">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)' }}>👧 Child Overview</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Detailed student profile and academic analytics</p>
        </div>
        <div className="card" style={{ padding: 64, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <span style={{ fontSize: 56, display: 'block', marginBottom: 16 }}>👧</span>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>No Linked Children Found</h3>
          <p style={{ fontSize: 14 }}>There are currently no active students linked to your guardian account. Please contact school administration if this is an error.</p>
        </div>
      </div>
    );
  }

  const currentChild = children[selectedChildIndex] || children[0];
  const profile = currentChild.profile || {};
  const user = profile.user || {};
  const attendance = currentChild.attendance || { totalDays: 0, presentDays: 0, percentage: 100 };
  const results = currentChild.results || [];
  const submissions = currentChild.recentSubmissions || [];
  const fees = currentChild.fees || [];

  const pendingFees = fees.filter(f => f.status === 'pending' || f.status === 'overdue');
  const totalPendingFee = pendingFees.reduce((acc, f) => acc + (parseFloat(f.amount) || 0), 0);

  const gradeColor = (grade) => {
    if (grade === 'A+' || grade === 'A') return '#10b981';
    if (grade === 'B') return '#3b82f6';
    if (grade === 'C') return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="animate-fade-in flex flex-col gap-8 min-w-0">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>👧</span> Child Overview &amp; Analytics
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
            In-depth academic profile, attendance analytics, and performance tracker for your child.
          </p>
        </div>
        {/* Child Selector if multiple */}
        {children.length > 1 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {children.map((c, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedChildIndex(idx)}
                className={`btn btn-sm ${selectedChildIndex === idx ? 'btn-primary' : 'btn-secondary'}`}
              >
                {c.profile?.user?.full_name || `Child ${idx + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Child Identity Card */}
      <div className="card-glass shadow-glow" style={{ padding: '32px', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: 'white',
              fontSize: 28,
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.25)',
              flexShrink: 0,
            }}
          >
            {user.full_name?.charAt(0) || 'C'}
          </div>

          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)' }}>{user.full_name}</h2>
              <span className="badge badge-success" style={{ fontSize: 11 }}>ACTIVE STUDENT</span>
              <span className="badge badge-info" style={{ fontSize: 11 }}>{profile.class?.display_name || 'Class'}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
              Student ID / Roll No: <strong style={{ color: 'var(--text-primary)' }}>{profile.roll_number || 'N/A'}</strong> • Medium: <strong>{profile.medium || 'English'}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/parent/report-card" className="btn btn-outline btn-sm">
              🎓 View Report Card
            </Link>
            <Link to="/parent/attendance" className="btn btn-primary btn-sm">
              📅 Attendance History
            </Link>
          </div>
        </div>

        {/* Detailed Profile Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-light)' }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Father Name</span>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{profile.father_name || '-'}</div>
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Father CNIC</span>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{profile.father_cnic || '-'}</div>
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Contact Number</span>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{profile.contact_number_1 || '-'}</div>
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Date of Birth</span>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{profile.date_of_birth || '-'}</div>
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Address</span>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{profile.address || 'Lahore, Punjab'}</div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        <div className="stat-card">
          <div>
            <div className="stat-label">Attendance Rate</div>
            <div className="stat-value" style={{ color: '#10b981' }}>{attendance.percentage}%</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
              {attendance.presentDays} of {attendance.totalDays} days present
            </div>
          </div>
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>📅</div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Exams Completed</div>
            <div className="stat-value" style={{ color: '#3b82f6' }}>{results.length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
              {results.length > 0 ? `Latest: ${results[0].grade}` : 'No exams yet'}
            </div>
          </div>
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>📊</div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Homework Submissions</div>
            <div className="stat-value" style={{ color: '#8b5cf6' }}>{submissions.length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Assignments submitted</div>
          </div>
          <div className="stat-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>📝</div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Fee Status</div>
            <div className="stat-value" style={{ color: totalPendingFee > 0 ? '#ef4444' : '#10b981' }}>
              ₨{totalPendingFee.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
              {totalPendingFee > 0 ? `${pendingFees.length} invoice pending` : 'All dues clear'}
            </div>
          </div>
          <div className="stat-icon" style={{ background: totalPendingFee > 0 ? '#fef2f2' : '#ecfdf5', color: totalPendingFee > 0 ? '#ef4444' : '#10b981' }}>
            💰
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Results & Recent Homework */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Exam Results */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>📊 Recent Exam Performance</h3>
            <Link to="/parent/results" style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary-600)', textDecoration: 'none' }}>
              View All Results →
            </Link>
          </div>

          {results.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
              No graded exam attempts recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {results.slice(0, 4).map(res => (
                <div key={res.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-surface-2)', borderRadius: 10, border: '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {res.exam?.title || 'Exam'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {res.exam?.course?.subject?.name || 'Subject'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: gradeColor(res.grade) }}>
                      {res.grade} ({parseFloat(res.percentage || 0).toFixed(0)}%)
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                      {res.total_obtained}/{res.exam?.total_marks || 100} marks
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Homework Submissions */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>📝 Homework Activity</h3>
            <Link to="/parent/homework" style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary-600)', textDecoration: 'none' }}>
              View All Homework →
            </Link>
          </div>

          {submissions.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
              No homework submissions recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {submissions.slice(0, 4).map(sub => (
                <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-surface-2)', borderRadius: 10, border: '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {sub.homework?.title || 'Homework Assignment'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {sub.homework?.course?.subject?.name || 'Subject'} • {new Date(sub.submitted_at || sub.createdAt).toLocaleDateString('en-PK', { dateStyle: 'short' })}
                    </div>
                  </div>
                  <div>
                    <span className={`badge ${sub.status === 'graded' ? 'badge-success' : 'badge-info'}`}>
                      {sub.status === 'graded' ? `${sub.marks_obtained || 0} marks` : 'Submitted'}
                    </span>
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

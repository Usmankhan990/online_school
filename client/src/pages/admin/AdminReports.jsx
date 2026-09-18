import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminReports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await api.get('/admin/reports');
      setReports(data);
    } catch (err) {
      setError('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <h1>📈 Reports & Analytics</h1>
        <p>Comprehensive reports on enrollment and fees.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading...</div>
      ) : error ? (
        <div style={{ padding: 16, background: '#fee2e2', color: '#b91c1c', borderRadius: 8 }}>{error}</div>
      ) : reports ? (
        <>
          <h2 style={{ fontSize: 18, margin: '16px 0 0' }}>Enrollment Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Students', value: reports.enrollment.totalStudents, color: '#3b82f6' },
              { label: 'Pending Students', value: reports.enrollment.pendingStudents, color: '#f59e0b' },
              { label: 'Teachers', value: reports.enrollment.totalTeachers, color: '#8b5cf6' },
              { label: 'Parents', value: reports.enrollment.totalParents, color: '#10b981' }
            ].map(stat => (
              <div key={stat.label} className="card" style={{ padding: 24, textAlign: 'center', borderTop: `4px solid ${stat.color}` }}>
                <h3 style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{stat.label}</h3>
                <div style={{ fontSize: 32, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 18, margin: '24px 0 0' }}>Revenue (Last 12 Months)</h2>
          <div className="card" style={{ padding: 20, overflow: 'auto' }}>
            {reports.revenue.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>No revenue data available.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 400 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: 'var(--text-tertiary)' }}>Month</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 700, color: 'var(--text-tertiary)' }}>Revenue Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.revenue.map((rev, idx) => (
                    <tr key={rev.month} style={{ borderBottom: idx === reports.revenue.length - 1 ? 'none' : '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{rev.month}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: 15, fontWeight: 700, color: '#10b981' }}>Rs. {rev.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

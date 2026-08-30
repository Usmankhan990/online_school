import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminAttendance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/attendance?date=${date}`);
      setData(res.data);
    } catch (err) {
      setError('Failed to load attendance data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>📅 Attendance Overview</h1>
          <p>School-wide attendance summary.</p>
        </div>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)}
          className="input"
          style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)' }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading...</div>
      ) : error ? (
        <div style={{ padding: 16, background: '#fee2e2', color: '#b91c1c', borderRadius: 8 }}>{error}</div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Present', value: data.summary.present, color: '#10b981' },
              { label: 'Absent', value: data.summary.absent, color: '#ef4444' },
              { label: 'Late', value: data.summary.late, color: '#f59e0b' },
              { label: 'Leave', value: data.summary.leave, color: '#3b82f6' }
            ].map(stat => (
              <div key={stat.label} className="card" style={{ padding: 24, textAlign: 'center', borderTop: `4px solid ${stat.color}` }}>
                <h3 style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{stat.label}</h3>
                <div style={{ fontSize: 32, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="card table-responsive">
            <h2 style={{ padding: 20, borderBottom: '1px solid var(--border-color)', margin: 0, fontSize: 16 }}>Attendance Records</h2>
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)' }}>
                    <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>User</th>
                    <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Role</th>
                    <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Class</th>
                    <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.records.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>No records for this date.</td>
                    </tr>
                  ) : (
                    data.records.map(record => (
                      <tr key={record.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 20px' }}>{record.user?.full_name}</td>
                        <td style={{ padding: '12px 20px', textTransform: 'capitalize' }}>{record.user?.role}</td>
                        <td style={{ padding: '12px 20px' }}>{record.class ? `${record.class.grade_level} (${record.class.section})` : '-'}</td>
                        <td style={{ padding: '12px 20px' }}>
                          <span style={{ 
                            padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                            background: record.status === 'present' ? '#d1fae5' : record.status === 'absent' ? '#fee2e2' : record.status === 'late' ? '#fef3c7' : '#dbeafe',
                            color: record.status === 'present' ? '#065f46' : record.status === 'absent' ? '#991b1b' : record.status === 'late' ? '#92400e' : '#1e40af'
                          }}>
                            {record.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

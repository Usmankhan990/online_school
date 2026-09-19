import React, { useState, useEffect } from 'react';
import api, { FILE_BASE } from '../../services/api';

const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath.startsWith('/online_school/')) return cleanPath;
  return `${FILE_BASE}${cleanPath}`;
};

export default function AdminAttendance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'teacher', 'student'
  const [previewSelfie, setPreviewSelfie] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, [date, roleFilter]);

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/admin/attendance?date=${date}&role=${roleFilter}`);
      setData(res.data);
    } catch (err) {
      setError('Failed to load attendance data.');
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    present: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0', icon: '✅', label: 'Present' },
    absent: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', icon: '❌', label: 'Absent' },
    late: { bg: '#fffbeb', text: '#d97706', border: '#fde68a', icon: '⏰', label: 'Late' },
    leave: { bg: '#eef2ff', text: '#4f46e5', border: '#c7d2fe', icon: '🏠', label: 'Leave' },
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>📅 School-Wide Attendance Records</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Monitor and review daily attendance logs and live selfie verifications for Teachers and Students
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Select Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="form-input"
            style={{ padding: '8px 14px', borderRadius: 8, fontSize: 14 }}
          />
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All Attendance', icon: '🌐' },
          { key: 'teacher', label: '👨‍🏫 Teachers Only', icon: '👨‍🏫' },
          { key: 'student', label: '👥 Students Only', icon: '👥' },
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setRoleFilter(tab.key)}
            style={{
              padding: '9px 18px',
              borderRadius: 10,
              border: roleFilter === tab.key ? '2px solid var(--color-primary-600, #7c3aed)' : '1px solid var(--border-light)',
              background: roleFilter === tab.key ? 'var(--color-primary-50, #f5f3ff)' : 'var(--bg-card)',
              color: roleFilter === tab.key ? 'var(--color-primary-700, #6d28d9)' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="card" style={{ padding: 16, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontWeight: 600, fontSize: 14 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-5 min-w-0">
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}
        </div>
      ) : data ? (
        <>
          {/* Summary Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
            {[
              { label: 'Total Marked', value: data.summary.total, icon: '📊', color: '#3b82f6', bg: '#eff6ff' },
              { label: 'Present', value: data.summary.present, icon: '✅', color: '#10b981', bg: '#ecfdf5' },
              { label: 'Absent', value: data.summary.absent, icon: '❌', color: '#ef4444', bg: '#fef2f2' },
              { label: 'Late', value: data.summary.late, icon: '⏰', color: '#f59e0b', bg: '#fffbeb' },
              { label: 'Leave', value: data.summary.leave, icon: '🏠', color: '#6366f1', bg: '#eef2ff' },
              { label: 'Teachers Count', value: data.summary.teachersCount || 0, icon: '👨‍🏫', color: '#8b5cf6', bg: '#f5f3ff' },
              { label: 'Students Count', value: data.summary.studentsCount || 0, icon: '👥', color: '#06b6d4', bg: '#ecfeff' },
            ].map(stat => (
              <div key={stat.label} className="stat-card">
                <div>
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                </div>
                <div className="stat-icon" style={{ background: stat.bg }}>{stat.icon}</div>
              </div>
            ))}
          </div>

          {/* Records Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Attendance Logs for {new Date(date).toLocaleDateString('en-PK', { dateStyle: 'full' })}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  Showing {roleFilter === 'all' ? 'All Roles' : roleFilter === 'teacher' ? 'Teachers' : 'Students'}
                </p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', background: 'var(--bg-surface-2, #f1f5f9)', padding: '5px 14px', borderRadius: 999 }}>
                {data.records.length} Total Records
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-2, #f8fafc)', borderBottom: '1px solid var(--border-light)' }}>
                    <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase' }}>#</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase' }}>User & Email</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase' }}>Role</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase' }}>Class / Dept</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase' }}>Verification</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase' }}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {data.records.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: 48, color: 'var(--text-tertiary)' }}>
                        <span style={{ fontSize: 40, display: 'block', marginBottom: 10 }}>📭</span>
                        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>No attendance records found for this date.</p>
                      </td>
                    </tr>
                  ) : (
                    data.records.map((record, i) => {
                      const isTeacher = record.user_role === 'teacher' || record.user?.role === 'teacher';
                      const badge = statusColors[record.status] || { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', icon: 'ℹ️', label: record.status };
                      const hasSelfie = !!record.selfie_path;

                      return (
                        <tr
                          key={record.id}
                          style={{
                            borderBottom: '1px solid var(--border-light)',
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-surface-2, #f8fafc)'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ padding: '14px 20px', color: 'var(--text-tertiary)' }}>{i + 1}</td>
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 34,
                                height: 34,
                                borderRadius: '50%',
                                background: isTeacher ? '#f5f3ff' : 'var(--color-primary-100)',
                                color: isTeacher ? '#7c3aed' : 'var(--color-primary-700)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: 13
                              }}>
                                {record.user?.full_name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
                                  {record.user?.full_name || 'User #' + record.user_id}
                                </span>
                                <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>{record.user?.email || '-'}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '3px 10px',
                              borderRadius: 6,
                              fontSize: 11.5,
                              fontWeight: 800,
                              background: isTeacher ? '#f5f3ff' : '#eff6ff',
                              color: isTeacher ? '#7c3aed' : '#2563eb',
                              border: `1px solid ${isTeacher ? '#ddd6fe' : '#bfdbfe'}`
                            }}>
                              {isTeacher ? '👨‍🏫 Teacher' : '👥 Student'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                            {isTeacher ? (
                              <span style={{ color: '#7c3aed', fontWeight: 600 }}>Faculty / Staff</span>
                            ) : record.class ? (
                              <span style={{ fontWeight: 600 }}>{record.class.display_name || `Class ${record.class.grade_level}`}</span>
                            ) : (
                              <span style={{ color: 'var(--text-tertiary)' }}>-</span>
                            )}
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
                            {hasSelfie ? (
                              <button
                                type="button"
                                onClick={() => setPreviewSelfie(record)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  padding: '5px 12px',
                                  borderRadius: 8,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  background: '#eff6ff',
                                  color: '#1d4ed8',
                                  border: '1px solid #bfdbfe',
                                  cursor: 'pointer'
                                }}
                                title="View captured live selfie photo"
                              >
                                📸 Selfie Verified 👁️
                              </button>
                            ) : record.verification_method === 'selfie' ? (
                              <span style={{ fontSize: 12, color: '#1d4ed8', fontWeight: 600 }}>📸 Selfie</span>
                            ) : (
                              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>✍️ Manual</span>
                            )}
                          </td>
                          <td style={{ padding: '14px 20px', color: 'var(--text-tertiary)', fontSize: 12.5 }}>
                            {record.remarks || '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}

      {/* Selfie Verification Lightbox Modal */}
      {previewSelfie && (
        <div
          onClick={() => setPreviewSelfie(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="card animate-fade-in"
            style={{
              maxWidth: 480,
              width: '100%',
              padding: '24px 28px',
              position: 'relative',
              borderRadius: 18,
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-light, #e2e8f0)',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 20 }}>📸</span>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
                    {previewSelfie.user?.full_name || 'User'}
                  </h3>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    background: previewSelfie.user_role === 'teacher' ? '#f5f3ff' : '#eff6ff',
                    color: previewSelfie.user_role === 'teacher' ? '#7c3aed' : '#2563eb',
                    border: `1px solid ${previewSelfie.user_role === 'teacher' ? '#ddd6fe' : '#bfdbfe'}`
                  }}>
                    {previewSelfie.user_role === 'teacher' ? '👨‍🏫 Teacher' : '👥 Student'}
                  </span>
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-secondary, #64748b)', fontWeight: 500 }}>
                  📅 {new Date(previewSelfie.date).toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewSelfie(null)}
                style={{
                  border: '1px solid var(--border-light, #e2e8f0)',
                  background: 'var(--bg-secondary, #f8fafc)',
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  fontSize: 16,
                  cursor: 'pointer',
                  fontWeight: 700,
                  color: 'var(--text-primary, #0f172a)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{
              borderRadius: 14,
              overflow: 'hidden',
              border: '2px solid #10b981',
              background: '#050505',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.15)',
              marginBottom: 18,
              position: 'relative',
              minHeight: 240,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img
                src={getMediaUrl(previewSelfie.selfie_path)}
                alt="Attendance Live Selfie"
                onError={(e) => {
                  if (!e.target.dataset.triedRoot && previewSelfie.selfie_path) {
                    e.target.dataset.triedRoot = '1';
                    e.target.src = previewSelfie.selfie_path;
                  }
                }}
                style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 360, objectFit: 'contain' }}
              />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 13,
              background: 'var(--bg-secondary, #f8fafc)',
              border: '1px solid var(--border-light, #e2e8f0)',
              padding: '12px 16px',
              borderRadius: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary, #64748b)' }}>Status:</span>
                <span style={{
                  fontWeight: 800,
                  color: previewSelfie.status === 'present' ? '#059669' : '#dc2626',
                  textTransform: 'capitalize'
                }}>
                  {previewSelfie.status === 'present' ? '✅ Present' : previewSelfie.status}
                </span>
              </div>
              <span style={{
                padding: '3px 10px',
                borderRadius: 999,
                fontSize: 11.5,
                fontWeight: 700,
                background: '#ecfdf5',
                color: '#059669',
                border: '1px solid #a7f3d0'
              }}>
                📸 Live Selfie Proof
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

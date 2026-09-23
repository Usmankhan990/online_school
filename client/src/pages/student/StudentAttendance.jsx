import { useState, useEffect, useRef, useCallback } from 'react';
import api, { FILE_BASE } from '../../services/api';

const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath.startsWith('/online_school/')) return cleanPath;
  return `${FILE_BASE}${cleanPath}`;
};

export default function StudentAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({});
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [msg, setMsg] = useState('');
  const [previewSelfie, setPreviewSelfie] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/student/attendance?month=${month}`);
      setAttendance(res.data.attendance || []);
      setStats(res.data.stats || {});
    } catch (err) {
      console.error('Fetch attendance error:', err);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const startCamera = useCallback(async () => {
    setShowCamera(true);
    setMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 480, height: 360 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setMsg('❌ Camera access denied. Please allow camera permission in your browser.');
      setShowCamera(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  }, []);

  // Auto stop camera on unmount or tab switch or page hidden
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        stopCamera();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [stopCamera]);

  const captureAndMark = async () => {
    if (!videoRef.current) return;
    setCapturing(true);
    setMsg('');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 480;
      canvas.height = videoRef.current.videoHeight || 360;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const selfieData = canvas.toDataURL('image/jpeg', 0.8);

      const res = await api.post('/student/attendance/selfie', { selfie_data: selfieData });
      setMsg('✅ ' + (res.data.message || 'Attendance marked successfully via selfie!'));
      stopCamera();
      fetchAttendance();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Failed to mark attendance with selfie.'));
    } finally {
      setCapturing(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendance.find(a => a.date === todayStr);
  const todayMarked = !!todayRecord;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>📅 My Attendance</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Track your daily attendance record and verify your presence via live selfie
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {todayMarked && (
            <span style={{ padding: '8px 16px', borderRadius: 10, background: '#ecfdf5', color: '#059669', fontWeight: 700, fontSize: 13, border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: 6 }}>
              ✅ Marked Today ({todayRecord.status.toUpperCase()})
            </span>
          )}

          {!showCamera && (
            <button
              type="button"
              onClick={startCamera}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
              }}
            >
              📸 {todayMarked ? 'Re-take Selfie Attendance' : "Mark Today's Attendance (Selfie)"}
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div
          className="card"
          style={{
            padding: 16,
            background: msg.startsWith('✅') ? '#ecfdf5' : '#fef2f2',
            color: msg.startsWith('✅') ? '#059669' : '#dc2626',
            border: `1px solid ${msg.startsWith('✅') ? '#a7f3d0' : '#fecaca'}`,
            fontWeight: 600,
            fontSize: 14,
            borderRadius: 10,
          }}
        >
          {msg}
        </div>
      )}

      {/* Live Selfie Camera Modal / Section */}
      {showCamera && (
        <div className="card" style={{ padding: 24, textAlign: 'center', border: '2px solid #10b981' }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            📸 Live Selfie Verification
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18 }}>
            Look directly at the camera and click <b>"Capture & Mark Present"</b> to confirm your attendance.
          </p>

          <div
            style={{
              position: 'relative',
              display: 'inline-block',
              borderRadius: 16,
              overflow: 'hidden',
              border: '3px solid #10b981',
              boxShadow: '0 10px 30px rgba(16,185,129,0.25)',
              background: '#000',
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: 460, maxWidth: '100%', height: 320, objectFit: 'cover', display: 'block' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
            <button
              type="button"
              onClick={captureAndMark}
              disabled={capturing}
              style={{
                padding: '12px 32px',
                borderRadius: 10,
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                fontSize: 14,
                opacity: capturing ? 0.6 : 1,
              }}
            >
              {capturing ? '⏳ Saving Selfie...' : '📸 Capture & Mark Present'}
            </button>
            <button
              type="button"
              onClick={stopCamera}
              style={{
                padding: '12px 24px',
                borderRadius: 10,
                border: '1px solid var(--border-light)',
                background: 'var(--bg-card)',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Days', value: stats.totalDays || 0, icon: '📅', color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Present', value: stats.presentDays || 0, icon: '✅', color: '#10b981', bg: '#ecfdf5' },
          { label: 'Absent', value: stats.absentDays || 0, icon: '❌', color: '#ef4444', bg: '#fef2f2' },
          {
            label: 'Percentage',
            value: `${stats.percentage || 100}%`,
            icon: '📊',
            color: parseFloat(stats.percentage || 100) >= 75 ? '#10b981' : '#ef4444',
            bg: parseFloat(stats.percentage || 100) >= 75 ? '#ecfdf5' : '#fef2f2',
          },
        ].map(c => (
          <div key={c.label} className="stat-card">
            <div>
              <div className="stat-label">{c.label}</div>
              <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
            </div>
            <div className="stat-icon" style={{ background: c.bg }}>{c.icon}</div>
          </div>
        ))}
      </div>

      {/* Month selector */}
      <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>Month:</label>
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="form-input"
          style={{ padding: '8px 14px', borderRadius: 8, fontSize: 14 }}
        />
      </div>

      {/* Attendance Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Attendance Records</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Your daily presence logs and verification history</p>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', background: 'var(--bg-surface-2, #f1f5f9)', padding: '5px 14px', borderRadius: 999 }}>
            {attendance.length} Total Records
          </span>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <div style={{ width: 36, height: 36, border: '3px solid var(--border-light)', borderTopColor: '#FFCC4D', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14 }}>Loading records...</p>
          </div>
        ) : attendance.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <span style={{ fontSize: 44, display: 'block', marginBottom: 10 }}>📭</span>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>No attendance records for this month</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Mark your daily attendance using the selfie button above.</p>
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
                {attendance.map(a => {
                  const dateObj = new Date(a.date);
                  const formattedDate = dateObj.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
                  const dayName = dateObj.toLocaleDateString('en-PK', { weekday: 'long' });
                  const hasSelfie = !!a.selfie_path;

                  const badgeStyles = {
                    present: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0', icon: '✅', label: 'Present' },
                    absent: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', icon: '❌', label: 'Absent' },
                    late: { bg: '#fffbeb', text: '#d97706', border: '#fde68a', icon: '⏰', label: 'Late' },
                    leave: { bg: '#eef2ff', text: '#4f46e5', border: '#c7d2fe', icon: '🏠', label: 'Leave' },
                  };
                  const badge = badgeStyles[a.status] || { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', icon: 'ℹ️', label: a.status };

                  return (
                    <tr
                      key={a.id}
                      style={{
                        borderBottom: '1px solid var(--border-light)',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-surface-2, #f8fafc)'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-primary)' }}>
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
                        {hasSelfie ? (
                          <button
                            type="button"
                            onClick={() => setPreviewSelfie(a)}
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
                              cursor: 'pointer',
                            }}
                            title="Click to view captured selfie"
                          >
                            📸 Selfie Verified 👁️
                          </button>
                        ) : a.verification_method === 'selfie' ? (
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
                            background: '#f8fafc',
                            color: '#64748b',
                            border: '1px solid #e2e8f0'
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

      {/* Selfie Photo Preview Lightbox Modal */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 20 }}>📸</span>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: 0 }}>
                    Student Selfie Verification
                  </h3>
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
                alt="Student Attendance Selfie"
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
                📸 Live Selfie Verified
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

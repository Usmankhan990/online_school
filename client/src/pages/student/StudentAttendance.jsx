import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../services/api';

export default function StudentAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({});
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [msg, setMsg] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/student/attendance?month=${month}`);
      setAttendance(res.data.attendance || []);
      setStats(res.data.stats || {});
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [month]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const startCamera = useCallback(async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 480, height: 360 } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setMsg('❌ Camera access denied. Please allow camera permission.');
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

  const captureAndMark = async () => {
    setCapturing(true);
    setMsg('');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = 360;
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
      const selfieData = canvas.toDataURL('image/jpeg', 0.7);

      const res = await api.post('/student/attendance/selfie', { selfie_data: selfieData });
      setMsg('✅ ' + res.data.message);
      stopCamera();
      fetchAttendance();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Failed to mark attendance.'));
    } finally { setCapturing(false); }
  };

  const todayMarked = attendance.some(a => a.date === new Date().toISOString().split('T')[0]);
  const statusColors = { present: '#10b981', absent: '#ef4444', late: '#f59e0b', leave: '#6366f1' };
  const statusEmoji = { present: '✅', absent: '❌', late: '⏰', leave: '🏠' };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>📅 My Attendance</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Track your daily attendance and mark via selfie</p>
        </div>
        {!todayMarked && !showCamera && (
          <button onClick={startCamera} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            📸 Mark Today's Attendance
          </button>
        )}
        {todayMarked && (
          <span style={{ padding: '10px 20px', borderRadius: 10, background: '#ecfdf5', color: '#059669', fontWeight: 600, fontSize: 14 }}>✅ Attendance Marked Today</span>
        )}
      </div>

      {msg && <div className="card" style={{ padding: 16, background: msg.startsWith('✅') ? '#ecfdf5' : '#fef2f2', color: msg.startsWith('✅') ? '#059669' : '#dc2626', fontWeight: 600, fontSize: 14 }}>{msg}</div>}

      {showCamera && (
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>📸 Selfie Verification</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Look at the camera and click "Capture & Mark" to confirm your attendance</p>
          <div style={{ position: 'relative', display: 'inline-block', borderRadius: 16, overflow: 'hidden', border: '3px solid #10b981', boxShadow: '0 8px 30px rgba(16,185,129,0.2)' }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: 480, maxWidth: '100%', display: 'block' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
            <button onClick={captureAndMark} disabled={capturing} style={{ padding: '12px 32px', borderRadius: 10, border: 'none', fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontSize: 14, opacity: capturing ? 0.6 : 1 }}>
              {capturing ? '⏳ Processing...' : '📸 Capture & Mark Present'}
            </button>
            <button onClick={stopCamera} style={{ padding: '12px 24px', borderRadius: 10, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Days', value: stats.totalDays || 0, icon: '📅', color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Present', value: stats.presentDays || 0, icon: '✅', color: '#10b981', bg: '#ecfdf5' },
          { label: 'Absent', value: stats.absentDays || 0, icon: '❌', color: '#ef4444', bg: '#fef2f2' },
          { label: 'Percentage', value: `${stats.percentage || 100}%`, icon: '📊', color: parseFloat(stats.percentage || 100) >= 75 ? '#10b981' : '#ef4444', bg: parseFloat(stats.percentage || 100) >= 75 ? '#ecfdf5' : '#fef2f2' },
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
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Month:</label>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }} />
      </div>

      {/* Records */}
      <div className="card" style={{ padding: 20, overflow: 'auto' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Attendance Records</h3>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading...</div>
        ) : attendance.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>📭</span>
            <p>No attendance records for this month</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
            {attendance.map(a => (
              <div key={a.id} style={{ padding: 12, borderRadius: 10, border: `1.5px solid ${statusColors[a.status]}30`, background: `${statusColors[a.status]}08`, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>{new Date(a.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</div>
                <div style={{ fontSize: 22 }}>{statusEmoji[a.status]}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: statusColors[a.status], textTransform: 'capitalize', marginTop: 2 }}>{a.status}</div>
                {a.verification_method === 'selfie' && <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>📸 Selfie</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import api, { FILE_BASE } from '../../services/api';

const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath.startsWith('/online_school/')) return cleanPath;
  return `${FILE_BASE}${cleanPath}`;
};

export default function TeacherAttendance() {
  const [activeTab, setActiveTab] = useState('self'); // 'self' or 'students'

  // Teacher Self Attendance States
  const [selfAttendance, setSelfAttendance] = useState([]);
  const [selfStats, setSelfStats] = useState({});
  const [selfMonth, setSelfMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selfLoading, setSelfLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [selfMsg, setSelfMsg] = useState('');
  const [previewSelfie, setPreviewSelfie] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Student Attendance States
  const [courses, setCourses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [studentMsg, setStudentMsg] = useState('');
  const [updatingSectionId, setUpdatingSectionId] = useState(null);
  const [sectionMsg, setSectionMsg] = useState('');

  const getStudentAutoSection = (s, idx = 0) => {
    if (s?.section && s.section.trim()) {
      return s.section.trim().toUpperCase();
    }
    const rollStr = String(s?.roll_number || s?.user_id || s?.id || (idx + 1));
    const matches = rollStr.match(/\d+/g);
    if (!matches || matches.length === 0) return 'A';
    const num = parseInt(matches[matches.length - 1], 10);
    if (isNaN(num) || num <= 0) return 'A';
    const index = num - 1;
    const charCode = 65 + Math.floor(index / 15);
    return String.fromCharCode(Math.min(charCode, 90));
  };

  const handleUpdateStudentSection = async (studentUserId, newSection) => {
    setUpdatingSectionId(studentUserId);
    setSectionMsg('');
    try {
      await api.put(`/teacher/students/${studentUserId}/section`, { section: newSection });
      setStudents(prev => prev.map(s => s.user_id === studentUserId ? { ...s, section: newSection } : s));
      setSectionMsg(`✅ Student section changed to Section ${newSection}`);
      setTimeout(() => setSectionMsg(''), 3500);
    } catch (err) {
      console.error('Update student section error:', err);
      setSectionMsg('❌ ' + (err.response?.data?.error || 'Failed to update student section.'));
      setTimeout(() => setSectionMsg(''), 3500);
    } finally {
      setUpdatingSectionId(null);
    }
  };

  // Fetch Teacher's own attendance
  const fetchSelfAttendance = useCallback(async () => {
    setSelfLoading(true);
    try {
      const res = await api.get(`/teacher/attendance/self?month=${selfMonth}`);
      setSelfAttendance(res.data.attendance || []);
      setSelfStats(res.data.stats || {});
    } catch (err) {
      console.error('Fetch teacher self attendance error:', err);
    } finally {
      setSelfLoading(false);
    }
  }, [selfMonth]);

  useEffect(() => {
    fetchSelfAttendance();
  }, [fetchSelfAttendance]);

  // Teacher Camera Handlers
  const startCamera = useCallback(async () => {
    setShowCamera(true);
    setSelfMsg('');
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
      setSelfMsg('❌ Camera access denied. Please allow camera permission.');
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
    if (activeTab !== 'self') {
      stopCamera();
    }
  }, [activeTab, stopCamera]);

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

  const captureAndMarkSelf = async () => {
    if (!videoRef.current) return;
    setCapturing(true);
    setSelfMsg('');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 480;
      canvas.height = videoRef.current.videoHeight || 360;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const selfieData = canvas.toDataURL('image/jpeg', 0.8);

      const res = await api.post('/teacher/attendance/self', { selfie_data: selfieData });
      setSelfMsg('✅ ' + (res.data.message || 'Teacher attendance marked successfully via live selfie!'));
      stopCamera();
      fetchSelfAttendance();
    } catch (err) {
      setSelfMsg('❌ ' + (err.response?.data?.error || 'Failed to mark teacher attendance with selfie.'));
    } finally {
      setCapturing(false);
    }
  };

  // Extract unique classes and subjects taught by teacher
  const classMap = {};
  courses.forEach(c => {
    if (c.class) {
      if (!classMap[c.class.id]) {
        classMap[c.class.id] = { ...c.class, subjects: [] };
      }
      if (c.subject && !classMap[c.class.id].subjects.includes(c.subject.name)) {
        classMap[c.class.id].subjects.push(c.subject.name);
      }
    }
  });
  const classList = Object.values(classMap);

  const fetchStudents = useCallback(async (classId, targetDate = date) => {
    if (!classId) {
      setSelectedClass('');
      setStudents([]);
      return;
    }
    setSelectedClass(String(classId));
    setFetchingStudents(true);
    setStudentMsg('');
    try {
      const res = await api.get(`/teacher/class-students?class_id=${classId}`);
      const studentList = res.data.students || [];
      setStudents(studentList);

      const init = {};
      studentList.forEach(s => { init[s.user_id] = 'present'; });

      try {
        const att = await api.get(`/teacher/attendance?class_id=${classId}&date=${targetDate}`);
        (att.data.attendance || []).forEach(a => {
          const sId = a.user_id || a.student_id;
          if (sId) init[sId] = a.status;
        });
      } catch (attErr) {
        console.error('Fetch attendance error:', attErr);
      }

      setRecords(init);
    } catch (err) {
      console.error('Fetch students error:', err);
    } finally {
      setFetchingStudents(false);
    }
  }, [date]);

  useEffect(() => {
    api.get('/teacher/courses').then(r => {
      const crs = r.data.courses || [];
      setCourses(crs);

      const cmap = {};
      crs.forEach(c => { if (c.class) cmap[c.class.id] = c.class; });
      const clist = Object.values(cmap);
      if (clist.length > 0) {
        fetchStudents(clist[0].id);
      }
    }).catch(console.error).finally(() => setStudentsLoading(false));
  }, [fetchStudents]);

  const handleDateChange = (newDate) => {
    setDate(newDate);
    if (selectedClass) {
      fetchStudents(selectedClass, newDate);
    }
  };

  const handleSaveStudentAttendance = async () => {
    if (!selectedClass) {
      setStudentMsg('❌ Please select a class first.');
      return;
    }
    setSubmitting(true);
    setStudentMsg('');
    try {
      const attendanceRecords = Object.entries(records).map(([student_id, status]) => ({
        student_id: parseInt(student_id),
        status
      }));
      await api.post('/teacher/attendance', { class_id: selectedClass, date, records: attendanceRecords });
      setStudentMsg('✅ Attendance saved successfully for ' + new Date(date).toLocaleDateString('en-PK', { dateStyle: 'medium' }) + '!');
    } catch (err) {
      setStudentMsg('❌ ' + (err.response?.data?.error || 'Failed to save attendance.'));
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors = {
    present: { bg: '#ecfdf5', border: '#10b981', text: '#059669', activeBg: '#10b981' },
    absent: { bg: '#fef2f2', border: '#ef4444', text: '#dc2626', activeBg: '#ef4444' },
    late: { bg: '#fffbeb', border: '#f59e0b', text: '#d97706', activeBg: '#f59e0b' },
    leave: { bg: '#eef2ff', border: '#6366f1', text: '#4f46e5', activeBg: '#6366f1' },
  };

  const currentClassObj = classList.find(c => String(c.id) === String(selectedClass));
  const todayStr = new Date().toISOString().split('T')[0];
  const teacherTodayRecord = selfAttendance.find(a => a.date === todayStr);
  const teacherTodayMarked = !!teacherTodayRecord;

  // Student counts
  const presentCount = Object.values(records).filter(s => s === 'present').length;
  const absentCount = Object.values(records).filter(s => s === 'absent').length;
  const lateCount = Object.values(records).filter(s => s === 'late').length;
  const leaveCount = Object.values(records).filter(s => s === 'leave').length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>✅ Attendance Management</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          Mark your own attendance via live selfie and manage student daily attendance
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '2px solid var(--border-light)', paddingBottom: 10 }}>
        <button
          type="button"
          onClick={() => setActiveTab('self')}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: activeTab === 'self' ? '2px solid #10b981' : '1px solid var(--border-light)',
            background: activeTab === 'self' ? '#ecfdf5' : 'var(--bg-secondary)',
            color: activeTab === 'self' ? '#059669' : 'var(--text-secondary)',
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.15s ease'
          }}
        >
          📸 My Attendance (Live Selfie)
          {teacherTodayMarked && (
            <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 10, background: '#10b981', color: 'white' }}>
              Marked
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('students')}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: activeTab === 'students' ? '2px solid var(--color-primary-600)' : '1px solid var(--border-light)',
            background: activeTab === 'students' ? 'var(--color-primary-50)' : 'var(--bg-secondary)',
            color: activeTab === 'students' ? 'var(--color-primary-700)' : 'var(--text-secondary)',
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.15s ease'
          }}
        >
          👥 Mark Student Attendance ({classList.length} Classes)
        </button>
      </div>

      {/* ================= TAB 1: TEACHER SELF ATTENDANCE ================= */}
      {activeTab === 'self' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Top Action Bar */}
          <div className="card" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                📸 Teacher Daily Selfie Verification
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                Verify your presence and punctuality using live camera selfie. All records are sent directly to the Admin.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {teacherTodayMarked && (
                <span style={{ padding: '8px 16px', borderRadius: 10, background: '#ecfdf5', color: '#059669', fontWeight: 700, fontSize: 13, border: '1px solid #a7f3d0' }}>
                  ✅ Today: {teacherTodayRecord.status.toUpperCase()}
                </span>
              )}

              {!showCamera && (
                <button
                  type="button"
                  onClick={startCamera}
                  style={{
                    padding: '11px 22px',
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
                  📸 {teacherTodayMarked ? 'Re-take Selfie Attendance' : "Mark Today's Attendance (Selfie)"}
                </button>
              )}
            </div>
          </div>

          {selfMsg && (
            <div
              className="card"
              style={{
                padding: 16,
                background: selfMsg.startsWith('✅') ? '#ecfdf5' : '#fef2f2',
                color: selfMsg.startsWith('✅') ? '#059669' : '#dc2626',
                border: `1px solid ${selfMsg.startsWith('✅') ? '#a7f3d0' : '#fecaca'}`,
                fontWeight: 600,
                fontSize: 14,
                borderRadius: 10,
              }}
            >
              {selfMsg}
            </div>
          )}

          {/* Live Camera Modal / Card */}
          {showCamera && (
            <div className="card" style={{ padding: 24, textAlign: 'center', border: '2px solid #10b981' }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                📸 Teacher Live Selfie Verification
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18 }}>
                Position yourself in front of the camera and click <b>"Capture & Mark Present"</b>.
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
                  onClick={captureAndMarkSelf}
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

          {/* Teacher Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
            {[
              { label: 'Total Working Days', value: selfStats.totalDays || 0, icon: '📅', color: '#3b82f6', bg: '#eff6ff' },
              { label: 'Present Days', value: selfStats.presentDays || 0, icon: '✅', color: '#10b981', bg: '#ecfdf5' },
              { label: 'Absent Days', value: selfStats.absentDays || 0, icon: '❌', color: '#ef4444', bg: '#fef2f2' },
              {
                label: 'Attendance Rate',
                value: `${selfStats.percentage || 100}%`,
                icon: '📊',
                color: parseFloat(selfStats.percentage || 100) >= 80 ? '#10b981' : '#ef4444',
                bg: parseFloat(selfStats.percentage || 100) >= 80 ? '#ecfdf5' : '#fef2f2',
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

          {/* Month selector & Teacher Attendance Log */}
          <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>Month Filter:</label>
            <input
              type="month"
              value={selfMonth}
              onChange={e => setSelfMonth(e.target.value)}
              className="form-input"
              style={{ padding: '8px 14px', borderRadius: 8, fontSize: 14 }}
            />
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>My Attendance History</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Your presence records & selfie proofs recorded for Admin review</p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', background: 'var(--bg-surface-2, #f1f5f9)', padding: '5px 14px', borderRadius: 999 }}>
                {selfAttendance.length} Total Logs
              </span>
            </div>

            {selfLoading ? (
              <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                <div style={{ width: 36, height: 36, border: '3px solid var(--border-light)', borderTopColor: '#1e3a5f', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                <p style={{ fontSize: 14 }}>Loading records...</p>
              </div>
            ) : selfAttendance.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                <span style={{ fontSize: 44, display: 'block', marginBottom: 10 }}>📭</span>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>No attendance recorded for this month</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Mark your daily attendance using the selfie button above.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface-2, #f8fafc)', borderBottom: '1px solid var(--border-light)' }}>
                      <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase' }}>Date</th>
                      <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase' }}>Day</th>
                      <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase' }}>Verification</th>
                      <th style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase' }}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selfAttendance.map(a => {
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
                        <tr key={a.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-primary)' }}>{formattedDate}</td>
                          <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{dayName}</td>
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
                                title="Click to view captured selfie photo"
                              >
                                📸 Selfie Verified 👁️
                              </button>
                            ) : (
                              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>✍️ Manual</span>
                            )}
                          </td>
                          <td style={{ padding: '14px 20px', color: 'var(--text-tertiary)', fontSize: 12.5 }}>
                            {a.remarks || 'Teacher Attendance'}
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
      )}

      {/* ================= TAB 2: STUDENT ATTENDANCE ================= */}
      {activeTab === 'students' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {studentMsg && (
            <div
              className="card"
              style={{
                padding: 16,
                background: studentMsg.startsWith('✅') ? '#ecfdf5' : '#fef2f2',
                color: studentMsg.startsWith('✅') ? '#059669' : '#dc2626',
                border: `1px solid ${studentMsg.startsWith('✅') ? '#a7f3d0' : '#fecaca'}`,
                fontWeight: 600,
                fontSize: 14,
                borderRadius: 10,
              }}
            >
              {studentMsg}
            </div>
          )}

          {/* Classes Pills */}
          {classList.length > 0 && (
            <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                📚 Classes You Teach ({classList.length})
              </span>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {classList.map(c => {
                  const isSelected = String(c.id) === String(selectedClass);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => fetchStudents(c.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 4,
                        padding: '10px 16px',
                        borderRadius: 10,
                        border: isSelected ? '2px solid var(--color-primary-600)' : '1px solid var(--border-light)',
                        background: isSelected ? 'var(--color-primary-50)' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 800, fontSize: 14, color: isSelected ? 'var(--color-primary-700)' : 'var(--text-primary)' }}>
                          🏫 {c.display_name}
                        </span>
                        {isSelected && (
                          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 12, background: 'var(--color-primary-600)', color: 'white', fontWeight: 700 }}>
                            Active
                          </span>
                        )}
                      </div>
                      {c.subjects?.length > 0 && (
                        <span style={{ fontSize: 11, color: isSelected ? 'var(--color-primary-600)' : 'var(--text-tertiary)', fontWeight: 600 }}>
                          {c.subjects.join(' • ')}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Class & Date Controls */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                  Select Class *
                </label>
                <select
                  value={selectedClass}
                  onChange={e => fetchStudents(e.target.value)}
                  className="form-select"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14 }}
                >
                  <option value="">Choose a class</option>
                  {classList.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.display_name} {c.subjects?.length > 0 ? `(${c.subjects.join(', ')})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                  Attendance Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => handleDateChange(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14 }}
                />
              </div>
            </div>

            {currentClassObj && currentClassObj.subjects?.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>📖 Subjects Taught in {currentClassObj.display_name}:</span>
                <span style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>{currentClassObj.subjects.join(' • ')}</span>
              </div>
            )}
          </div>

          {/* Student List */}
          {fetchingStudents ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10 }} />)}
            </div>
          ) : !selectedClass ? (
            <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🏫</span>
              <p style={{ fontSize: 16, fontWeight: 600 }}>Please select a class to view and mark attendance</p>
            </div>
          ) : students.length === 0 ? (
            <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>👥</span>
              <p style={{ fontSize: 16, fontWeight: 600 }}>No registered students found in {currentClassObj?.display_name || 'this class'}</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 20, overflow: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                    Students in {currentClassObj?.display_name || 'Class'} ({students.length})
                  </h3>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap', fontSize: 12 }}>
                    <span style={{ color: '#059669', fontWeight: 700 }}>✅ Present: {presentCount}</span>
                    <span style={{ color: '#dc2626', fontWeight: 700 }}>❌ Absent: {absentCount}</span>
                    <span style={{ color: '#d97706', fontWeight: 700 }}>⏰ Late: {lateCount}</span>
                    <span style={{ color: '#4f46e5', fontWeight: 700 }}>🏠 Leave: {leaveCount}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => { const r = {}; students.forEach(s => { r[s.user_id] = 'present'; }); setRecords(r); }}
                    style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #10b981', background: '#ecfdf5', color: '#10b981', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    ✅ All Present
                  </button>
                  <button
                    type="button"
                    onClick={() => { const r = {}; students.forEach(s => { r[s.user_id] = 'absent'; }); setRecords(r); }}
                    style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #ef4444', background: '#fef2f2', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    ❌ All Absent
                  </button>
                </div>
              </div>
              
              {sectionMsg && (
                <div style={{
                  padding: '10px 16px',
                  borderRadius: 8,
                  marginBottom: 16,
                  background: sectionMsg.includes('✅') ? '#ecfdf5' : '#fef2f2',
                  color: sectionMsg.includes('✅') ? '#059669' : '#dc2626',
                  border: `1px solid ${sectionMsg.includes('✅') ? '#10b981' : '#ef4444'}`,
                  fontWeight: 700,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  {sectionMsg}
                </div>
              )}

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)' }}>#</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)' }}>Student Name</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)' }}>Roll Number / Contact</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)' }}>Section</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)' }}>Attendance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => {
                    const studentSection = s.section || getStudentAutoSection(s, i);
                    return (
                      <tr key={s.user_id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-tertiary)' }}>{i + 1}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--color-primary-100)', color: 'var(--color-primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>
                              {s.user?.full_name?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
                                {s.user?.full_name}
                              </span>
                              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{s.user?.email || '-'}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>
                          {s.roll_number ? (
                            <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 6, background: 'var(--bg-secondary)', fontWeight: 700, fontSize: 12 }}>
                              Roll #{s.roll_number}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-tertiary)' }}>ID: {s.user_id}</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <select
                              value={studentSection}
                              onChange={(e) => handleUpdateStudentSection(s.user_id, e.target.value)}
                              disabled={updatingSectionId === s.user_id}
                              title="Edit/Change student section"
                              style={{
                                padding: '5px 10px',
                                borderRadius: 8,
                                border: '1.5px solid var(--border-light)',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                fontWeight: 800,
                                fontSize: 12,
                                cursor: 'pointer',
                                outline: 'none'
                              }}
                            >
                              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(sec => (
                                <option key={sec} value={sec}>
                                  Section {sec}
                                </option>
                              ))}
                            </select>
                            {updatingSectionId === s.user_id && (
                              <span style={{ fontSize: 12, animation: 'spin 1s linear infinite' }}>⏳</span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                            {[
                              { key: 'present', label: 'Present', icon: '✅' },
                              { key: 'absent', label: 'Absent', icon: '❌' },
                              { key: 'late', label: 'Late', icon: '⏰' },
                              { key: 'leave', label: 'Leave', icon: '🏠' },
                            ].map(({ key: status, label, icon }) => {
                              const isCurrent = (records[s.user_id] || 'present') === status;
                              const col = statusColors[status];
                              return (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => setRecords(r => ({ ...r, [s.user_id]: status }))}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: 6,
                                    border: `1.5px solid ${isCurrent ? col.border : 'var(--border-light)'}`,
                                    background: isCurrent ? col.bg : 'transparent',
                                    color: isCurrent ? col.text : 'var(--text-tertiary)',
                                    fontSize: 12,
                                    fontWeight: isCurrent ? 800 : 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  {icon} {label}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <button
                onClick={handleSaveStudentAttendance}
                disabled={submitting}
                style={{
                  marginTop: 20,
                  padding: '12px 32px',
                  borderRadius: 10,
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  fontSize: 14,
                  width: '100%',
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? '⏳ Saving Attendance...' : '💾 Save Attendance'}
              </button>
            </div>
          )}
        </div>
      )}

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
                    Teacher Selfie Verification
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
                alt="Teacher Attendance Selfie"
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

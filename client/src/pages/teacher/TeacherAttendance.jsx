import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function TeacherAttendance() {
  const [courses, setCourses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/teacher/courses').then(r => {
      setCourses(r.data.courses || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Extract unique classes from courses
  const classMap = {};
  courses.forEach(c => { if (c.class) classMap[c.class.id] = c.class; });
  const classList = Object.values(classMap);

  const fetchStudents = async (classId) => {
    setSelectedClass(classId);
    if (!classId) { setStudents([]); return; }
    try {
      const res = await api.get(`/teacher/class-students?class_id=${classId}`);
      setStudents(res.data.students || []);
      // Initialize records
      const init = {};
      (res.data.students || []).forEach(s => { init[s.user_id] = 'present'; });
      setRecords(init);

      // Fetch existing attendance
      const att = await api.get(`/teacher/attendance?class_id=${classId}&date=${date}`);
      (att.data.attendance || []).forEach(a => { init[a.student_id] = a.status; });
      setRecords({ ...init });

    } catch (err) { console.error(err); }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setMsg('');
    try {
      const attendanceRecords = Object.entries(records).map(([student_id, status]) => ({
        student_id: parseInt(student_id), status
      }));
      await api.post('/teacher/attendance', { class_id: selectedClass, date, records: attendanceRecords });
      setMsg('✅ Attendance saved successfully!');
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Failed to save attendance.'));
    } finally { setSubmitting(false); }
  };

  const statusColors = { present: '#10b981', absent: '#ef4444', late: '#f59e0b', leave: '#6366f1' };

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>✅ Mark Attendance</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Select a class and date
 to mark daily attendance</p>
      </div>

      {msg && <div className="card" style={{ padding: 16, background: msg.startsWith('✅') ? '#ecfdf5' : '#fef2f2', color: msg.startsWith('✅') ? '#059669' : '#dc2626', fontWeight: 600, fontSize: 14 }}>{msg}</div>}

      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Select Class *</label>
            <select value={selectedClass} onChange={e => fetchStudents(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }}>
              <option value="">Choose a class</option>
              {classList.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Date *</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }} />
          </div>
        </div>
      </div>

      {students.length > 0 && (
        <div className="card" style={{ padding: 20, overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Students ({students.length})</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { const r = {}; students.forEach(s => { r[s.user_id] = 'present'; }); setRecords(r); }} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #10b981', background: '#ecfdf5', color: '#10b981', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>All Present</button>
              <button onClick={() => { const r = {}; students.forEach(s => { r[s.user_id] = 'absent'; }); setRecords(r); }} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ef4444', background: '#fef2f2', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>All Absent</button>
            </div>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)' }}>#</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)' }}>Name</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.user_id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '10px 12px', fontSize: 13, color: 'var(--text-tertiary)' }}>{i + 1}</td>
                  <td style={{ padding: '10px 12px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{s.user?.full_name}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      {['present', 'absent', 'late', 'leave'].map(status => (
                        <button key={status} onClick={() => setRecords(r => ({ ...r, [s.user_id]: status }))} style={{ padding: '4px 10px', borderRadius: 6, border: `1.5px solid ${records[s.user_id] === status ? statusColors[status] : 'var(--border-light)'}`, background: records[s.user_id] === status ? statusColors[status] + '20' : 'transparent', color: records[s.user_id] === status ? statusColors[status] : 'var(--text-tertiary)', fontSize: 11, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                          {status === 'present' ? '✅' : status === 'absent' ? '❌' : status === 'late' ? '⏰' : '🏠'} {status}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={handleSubmit} disabled={submitting} style={{ marginTop: 20, padding: '12px 32px', borderRadius: 10, border: 'none', fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontSize: 14, width: '100%', opacity: submitting ? 0.6 : 1 }}>
            {submitting ? '⏳ Saving...' : '💾 Save Attendance'}
          </button>
        </div>
      )}
    </div>
  );
}

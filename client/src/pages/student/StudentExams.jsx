import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function StudentExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try { const r = await api.get('/student/exams-list'); setExams(r.data.exams || []); }
      catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const getStatus = (exam) => {
    const attempt = exam.attempts?.[0];
    const now = new Date();
    const start = new Date(exam.start_time);
    const end = new Date(exam.end_time);

    if (attempt?.status === 'graded') return { label: `Graded: ${attempt.grade}`, color: '#10b981', canAttempt: false };
    if (attempt?.status === 'submitted') return { label: 'Submitted', color: '#3b82f6', canAttempt: false };
    if (attempt) return { label: 'In Progress', color: '#f59e0b', canAttempt: true };
    if (now < start) return { label: `Starts ${start.toLocaleDateString('en-PK', { dateStyle: 'medium' })}`, color: '#6b7280', canAttempt: false };
    if (now > end) return { label: 'Expired', color: '#ef4444', canAttempt: false };
    return { label: 'Available', color: '#10b981', canAttempt: true };
  };

  const gradeColors = { 'A+': '#10b981', 'A': '#059669', 'B': '#3b82f6', 'C': '#f59e0b', 'D': '#f97316', 'F': '#ef4444' };

  if (loading) return <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div><h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>📋 My Exams</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>View and attempt your exams</p></div>
      {exams.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📋</span>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No exams available</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Published exams will appear here.</p></div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {exams.map(exam => {
            const status = getStatus(exam);
            const attempt = exam.attempts?.[0];
            return (
              <div key={exam.id} className="card" style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex' }}>
                  <div style={{ width: 6, background: status.color, flexShrink: 0 }} />
                  <div style={{ padding: 20, flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 220 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{exam.title}</h3>
                          <span className="badge" style={{ background: `${status.color}15`, color: status.color }}>{status.label}</span>
                        </div>
                        {exam.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{exam.description}</p>}
                        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                          <span>📚 {exam.course?.subject?.name} • {exam.course?.class?.display_name}</span>
                          <span>📊 {exam.total_marks} marks (Pass: {exam.passing_marks})</span>
                          <span>⏱ {exam.duration_minutes} mins</span>
                          <span>🏷 {exam.type}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6 }}>
                          📅 {new Date(exam.start_time).toLocaleDateString('en-PK', { dateStyle: 'medium' })} — {new Date(exam.end_time).toLocaleDateString('en-PK', { dateStyle: 'medium' })}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        {attempt?.status === 'graded' && (
                          <div>
                            <div style={{ fontSize: 36, fontWeight: 800, color: gradeColors[attempt.grade] || '#6b7280' }}>{attempt.grade}</div>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{attempt.total_obtained}/{exam.total_marks}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{parseFloat(attempt.percentage || 0).toFixed(0)}%</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

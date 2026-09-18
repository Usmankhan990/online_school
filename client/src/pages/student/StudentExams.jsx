import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function StudentExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeExam, setActiveExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    if (now < start) return { label: `Starts ${start.toLocaleDateString('en-PK', { dateStyle: 'medium' })}`, color: '#6b7280', canAttempt: false };
    if (now > end && !attempt) return { label: 'Expired', color: '#ef4444', canAttempt: false };
    if (attempt) return { label: 'In Progress', color: '#f59e0b', canAttempt: true };
    return { label: 'Available', color: '#10b981', canAttempt: true };
  };

  const gradeColors = { 'A+': '#10b981', 'A': '#059669', 'B': '#3b82f6', 'C': '#f59e0b', 'D': '#f97316', 'F': '#ef4444' };

  const handleStartExam = async (exam_id) => {
    setStarting(true);
    try {
      const res = await api.post(`/student/exams/${exam_id}/start`);
      setActiveExam(res.data.exam);
      setAttempt(res.data.attempt);
      setAnswers({});
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to start exam');
    } finally {
      setStarting(false);
    }
  };

  const handleSaveAnswer = async (question_id, val) => {
    setAnswers(prev => ({ ...prev, [question_id]: val }));
    try {
      await api.post('/student/exams/save-answer', { attempt_id: attempt.id, question_id, answer_text: val });
    } catch (err) { console.error('Save failed', err); }
  };

  const handleSubmitExam = async () => {
    if (!window.confirm("Are you sure you want to submit this exam?")) return;
    setSubmitting(true);
    try {
      await api.post(`/student/exams/${attempt.id}/submit`);
      setActiveExam(null);
      setAttempt(null);
      setAnswers({});
      const r = await api.get('/student/exams-list'); setExams(r.data.exams || []);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

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
                      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                        {attempt?.status === 'graded' && (
                          <div>
                            <div style={{ fontSize: 36, fontWeight: 800, color: gradeColors[attempt.grade] || '#6b7280' }}>{attempt.grade}</div>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{attempt.total_obtained}/{exam.total_marks}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{parseFloat(attempt.percentage || 0).toFixed(0)}%</div>
                          </div>
                        )}
                        {status.canAttempt && (
                          <button onClick={() => handleStartExam(exam.id)} disabled={starting} style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', borderRadius: 8, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            {attempt ? 'Continue Exam' : 'Open Exam'}
                          </button>
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

      {/* Exam Modal */}
      {activeExam && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card animate-slide-up" style={{ width: '100%', maxWidth: 800, maxHeight: '90vh', overflow: 'auto', padding: 32, background: '#fff', borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 16, marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b' }}>{activeExam.title}</h2>
                <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Time Limit: {activeExam.duration_minutes} minutes • Total Marks: {activeExam.total_marks}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {activeExam.questions?.map((q, i) => (
                <div key={q.id} style={{ background: '#f8fafc', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: '#334155' }}>Q{i + 1}. {q.question_text}</h4>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>{q.marks} Marks</span>
                  </div>

                  {q.question_type === 'mcq' && q.options && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                      {JSON.parse(q.options).map((opt, oi) => (
                        <label key={oi} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: answers[q.id] === opt ? '#eff6ff' : '#fff', border: `1px solid ${answers[q.id] === opt ? '#3b82f6' : '#cbd5e1'}`, borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }}>
                          <input type="radio" name={`q_${q.id}`} value={opt} checked={answers[q.id] === opt} onChange={(e) => handleSaveAnswer(q.id, e.target.value)} style={{ width: 16, height: 16, accentColor: '#3b82f6' }} />
                          <span style={{ fontSize: 14, color: '#1e293b' }}>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.question_type === 'true_false' && (
                    <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                      {['True', 'False'].map(opt => (
                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', background: answers[q.id] === opt ? '#eff6ff' : '#fff', border: `1px solid ${answers[q.id] === opt ? '#3b82f6' : '#cbd5e1'}`, borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }}>
                          <input type="radio" name={`q_${q.id}`} value={opt} checked={answers[q.id] === opt} onChange={(e) => handleSaveAnswer(q.id, e.target.value)} style={{ width: 16, height: 16, accentColor: '#3b82f6' }} />
                          <span style={{ fontSize: 14, color: '#1e293b' }}>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.question_type === 'subjective' && (
                    <div style={{ marginTop: 16 }}>
                      <textarea
                        style={{ width: '100%', minHeight: 120, padding: 16, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }}
                        placeholder="Type your answer here..."
                        value={answers[q.id] || ''}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        onBlur={(e) => handleSaveAnswer(q.id, e.target.value)}
                      />
                      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>Answer is auto-saved when you click outside the text box.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 32, borderTop: '1px solid #e2e8f0', paddingTop: 24 }}>
              <button onClick={() => { if(window.confirm('Save progress and close?')) setActiveExam(null); }} style={{ padding: '10px 24px', background: '#fff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Save & Close</button>
              <button onClick={handleSubmitExam} disabled={submitting} style={{ padding: '10px 32px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>{submitting ? 'Submitting...' : 'Submit Exam'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

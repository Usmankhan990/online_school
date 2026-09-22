import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';

export default function StudentExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeExam, setActiveExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewAttempt, setReviewAttempt] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(null);

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

  const handleOpenReview = async (exam_id) => {
    setReviewLoading(exam_id);
    try {
      const res = await api.get(`/student/exams/${exam_id}/review`);
      setReviewAttempt(res.data.attempt);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to load exam preview');
    } finally {
      setReviewLoading(null);
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
            const isCompleted = attempt?.status === 'graded' || attempt?.status === 'submitted';
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
                      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', minWidth: 65 }}>
                        {attempt?.status === 'graded' && (
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: gradeColors[attempt.grade] || '#6b7280', lineHeight: 1 }}>{attempt.grade}</div>
                            <div style={{ fontSize: 11, fontWeight: 700, marginTop: 1, color: 'var(--text-primary)' }}>{attempt.total_obtained}/{exam.total_marks}</div>
                            <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)' }}>{parseFloat(attempt.percentage || 0).toFixed(0)}%</div>
                          </div>
                        )}
                        {status.canAttempt && (
                          <button onClick={() => handleStartExam(exam.id)} disabled={starting} style={{ padding: '4px 10px', background: '#3b82f6', color: '#fff', borderRadius: 5, fontWeight: 600, fontSize: 11, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            {attempt ? 'Continue' : 'Open'}
                          </button>
                        )}
                        {isCompleted && (
                          <button
                            type="button"
                            onClick={() => handleOpenReview(exam.id)}
                            disabled={reviewLoading === exam.id}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 3,
                              padding: '3px 8px',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              border: '1px solid #bfdbfe',
                              borderRadius: 5,
                              fontWeight: 700,
                              fontSize: 10.5,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span>👁️</span> {reviewLoading === exam.id ? '...' : 'Preview'}
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

      {/* Exam Modal (Taking Exam) */}
      {activeExam && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px', boxSizing: 'border-box' }}>
          <div className="card animate-slide-up hide-scrollbar" style={{ width: '100%', maxWidth: 860, maxHeight: '90vh', overflowY: 'auto', padding: 32, background: '#fff', borderRadius: 18, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginTop: 16 }}>
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
        </div>,
        document.body
      )}

      {/* Exam Review / Preview Modal */}
      {reviewAttempt && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 16px',
            boxSizing: 'border-box'
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setReviewAttempt(null); }}
        >
          <div
            className="card animate-slide-up hide-scrollbar"
            style={{
              width: '100%',
              maxWidth: 860,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px 32px',
              background: 'var(--bg-card, #ffffff)',
              borderRadius: 18,
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              border: '1px solid var(--border-light, #e2e8f0)',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px solid var(--border-light, #e2e8f0)', paddingBottom: 18, marginBottom: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>📋</span>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary, #1e293b)', margin: 0 }}>
                    Exam Preview & Answer Key
                  </h2>
                </div>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary, #64748b)', marginTop: 6, margin: '6px 0 0 0' }}>
                  <strong>{reviewAttempt.exam?.title}</strong> • {reviewAttempt.exam?.course?.subject?.name || 'Subject'} ({reviewAttempt.exam?.course?.class?.display_name || 'Class'})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewAttempt(null)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: '1px solid var(--border-light, #e2e8f0)',
                  background: 'var(--bg-surface-2, #f1f5f9)',
                  color: 'var(--text-secondary, #64748b)',
                  fontSize: 16,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                ✕
              </button>
            </div>

            {/* Performance Summary Banner */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 24, padding: 16, borderRadius: 12, background: 'var(--bg-surface-2, #f8fafc)', border: '1px solid var(--border-light, #e2e8f0)' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary, #94a3b8)', textTransform: 'uppercase' }}>Score Obtained</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--color-primary-600, #2563eb)', marginTop: 2 }}>
                  {reviewAttempt.total_obtained || 0} / {reviewAttempt.exam?.total_marks}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary, #94a3b8)', textTransform: 'uppercase' }}>Percentage</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: parseFloat(reviewAttempt.percentage || 0) >= 50 ? '#10b981' : '#ef4444', marginTop: 2 }}>
                  {parseFloat(reviewAttempt.percentage || 0).toFixed(1)}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary, #94a3b8)', textTransform: 'uppercase' }}>Grade</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: gradeColors[reviewAttempt.grade] || '#3b82f6', marginTop: 2 }}>
                  {reviewAttempt.grade || '-'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary, #94a3b8)', textTransform: 'uppercase' }}>Status</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: reviewAttempt.status === 'graded' ? '#10b981' : '#f59e0b', marginTop: 6, textTransform: 'capitalize' }}>
                  {reviewAttempt.status}
                </div>
              </div>
            </div>

            {/* Questions with Answer Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {reviewAttempt.exam?.questions?.map((q, i) => {
                const ans = reviewAttempt.answers?.find(a => a.question_id === q.id);
                const isSubjective = q.question_type === 'subjective';
                const studentAnsText = ans?.answer_text?.trim() || '';
                const correctAnsText = q.correct_answer?.trim() || '';
                
                // For MCQ & True/False auto-grading check
                const isAutoGraded = q.question_type === 'mcq' || q.question_type === 'true_false';
                const isCorrect = ans?.is_correct !== undefined && ans?.is_correct !== null
                  ? ans.is_correct
                  : (isAutoGraded ? (studentAnsText.toLowerCase() === correctAnsText.toLowerCase() && studentAnsText !== '') : false);
                
                const hasAnswered = Boolean(studentAnsText);
                const marksObtained = ans?.marks_obtained !== undefined && ans?.marks_obtained !== null
                  ? ans.marks_obtained
                  : (isCorrect ? q.marks : 0);

                return (
                  <div
                    key={q.id}
                    style={{
                      background: 'var(--bg-card, #ffffff)',
                      padding: 22,
                      borderRadius: 14,
                      border: `1.5px solid ${isSubjective ? '#e2e8f0' : (hasAnswered ? (isCorrect ? '#a7f3d0' : '#fecaca') : '#cbd5e1')}`,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                    }}
                  >
                    {/* Question Header & Result Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--text-primary, #1e293b)', margin: 0, flex: 1 }}>
                        <span style={{ color: 'var(--color-primary-600, #2563eb)', marginRight: 6 }}>Q{i + 1}.</span>
                        {q.question_text}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary, #64748b)', background: '#f1f5f9', padding: '4px 10px', borderRadius: 6 }}>
                          {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                        </span>
                        
                        {isAutoGraded && (
                          hasAnswered ? (
                            isCorrect ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: 999, fontWeight: 800, fontSize: 12 }}>
                                ✓ Correct (+{marksObtained})
                              </span>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: 999, fontWeight: 800, fontSize: 12 }}>
                                ✗ Incorrect (0/{q.marks})
                              </span>
                            )
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: 999, fontWeight: 700, fontSize: 12 }}>
                              ⚠️ Unanswered (0/{q.marks})
                            </span>
                          )
                        )}

                        {isSubjective && (
                          reviewAttempt.status === 'graded' ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: 999, fontWeight: 800, fontSize: 12 }}>
                              {marksObtained} / {q.marks} Marks
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: 999, fontWeight: 700, fontSize: 12 }}>
                              ⏳ Pending Review
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    {/* MCQ Options Rendering */}
                    {q.question_type === 'mcq' && q.options && (() => {
                      let parsedOpts = [];
                      try { parsedOpts = JSON.parse(q.options); } catch (e) { parsedOpts = []; }
                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
                          {parsedOpts.map((opt, oi) => {
                            const isStudentChoice = studentAnsText.toLowerCase() === opt.trim().toLowerCase();
                            const isCorrectChoice = correctAnsText.toLowerCase() === opt.trim().toLowerCase();
                            
                            let optBg = '#ffffff';
                            let optBorder = '1.5px solid #e2e8f0';
                            let optColor = '#334155';
                            let badge = null;

                            if (isStudentChoice && isCorrectChoice) {
                              optBg = '#ecfdf5';
                              optBorder = '2px solid #10b981';
                              optColor = '#065f46';
                              badge = <span style={{ fontSize: 11, fontWeight: 800, color: '#059669', background: '#d1fae5', padding: '3px 8px', borderRadius: 6, flexShrink: 0 }}>✓ Correct Answer</span>;
                            } else if (isStudentChoice && !isCorrectChoice) {
                              optBg = '#fef2f2';
                              optBorder = '2px solid #ef4444';
                              optColor = '#991b1b';
                              badge = <span style={{ fontSize: 11, fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '3px 8px', borderRadius: 6, flexShrink: 0 }}>✗ Your Choice (Wrong)</span>;
                            } else if (!isStudentChoice && isCorrectChoice) {
                              optBg = '#f0fdf4';
                              optBorder = '2px solid #10b981';
                              optColor = '#15803d';
                              badge = <span style={{ fontSize: 11, fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '3px 8px', borderRadius: 6, flexShrink: 0 }}>✓ Correct Answer</span>;
                            }

                            return (
                              <div
                                key={oi}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: 10,
                                  padding: '12px 16px',
                                  background: optBg,
                                  border: optBorder,
                                  borderRadius: 8,
                                  fontWeight: isStudentChoice || isCorrectChoice ? 700 : 500,
                                  color: optColor,
                                  fontSize: 14,
                                  minHeight: 48
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <span style={{ width: 18, height: 18, borderRadius: '50%', border: isStudentChoice ? `5px solid ${isCorrectChoice ? '#10b981' : '#ef4444'}` : '1.5px solid #cbd5e1', display: 'inline-block', flexShrink: 0 }} />
                                  <span>{opt}</span>
                                </div>
                                {badge}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* True / False Options Rendering */}
                    {q.question_type === 'true_false' && (
                      <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
                        {['True', 'False'].map(opt => {
                          const isStudentChoice = studentAnsText.toLowerCase() === opt.toLowerCase();
                          const isCorrectChoice = correctAnsText.toLowerCase() === opt.toLowerCase();

                          let optBg = '#ffffff';
                          let optBorder = '1.5px solid #e2e8f0';
                          let optColor = '#334155';
                          let badge = null;

                          if (isStudentChoice && isCorrectChoice) {
                            optBg = '#ecfdf5';
                            optBorder = '2px solid #10b981';
                            optColor = '#065f46';
                            badge = <span style={{ fontSize: 11, fontWeight: 800, color: '#059669', background: '#d1fae5', padding: '3px 8px', borderRadius: 6, flexShrink: 0 }}>✓ Your Choice</span>;
                          } else if (isStudentChoice && !isCorrectChoice) {
                            optBg = '#fef2f2';
                            optBorder = '2px solid #ef4444';
                            optColor = '#991b1b';
                            badge = <span style={{ fontSize: 11, fontWeight: 800, color: '#dc2626', background: '#fee2e2', padding: '3px 8px', borderRadius: 6, flexShrink: 0 }}>✗ Your Choice</span>;
                          } else if (!isStudentChoice && isCorrectChoice) {
                            optBg = '#f0fdf4';
                            optBorder = '2px solid #10b981';
                            optColor = '#15803d';
                            badge = <span style={{ fontSize: 11, fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '3px 8px', borderRadius: 6, flexShrink: 0 }}>✓ Correct Answer</span>;
                          }

                          return (
                            <div
                              key={opt}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 20px',
                                background: optBg,
                                border: optBorder,
                                borderRadius: 8,
                                fontWeight: isStudentChoice || isCorrectChoice ? 700 : 500,
                                color: optColor,
                                fontSize: 14,
                                flex: 1,
                                justifyContent: 'space-between'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ width: 18, height: 18, borderRadius: '50%', border: isStudentChoice ? `5px solid ${isCorrectChoice ? '#10b981' : '#ef4444'}` : '1.5px solid #cbd5e1', display: 'inline-block', flexShrink: 0 }} />
                                <span>{opt}</span>
                              </div>
                              {badge}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* MCQ & True/False Detailed Answer Comparison Box */}
                    {isAutoGraded && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginTop: 14 }}>
                        <div style={{ padding: '10px 14px', borderRadius: 8, background: hasAnswered ? (isCorrect ? '#ecfdf5' : '#fef2f2') : '#f8fafc', border: `1px solid ${hasAnswered ? (isCorrect ? '#a7f3d0' : '#fecaca') : '#e2e8f0'}` }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: hasAnswered ? (isCorrect ? '#065f46' : '#991b1b') : '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {hasAnswered ? (isCorrect ? '✓ Your Answer (Correct)' : '✗ Your Answer (Incorrect)') : '⚠️ Your Answer'}
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: hasAnswered ? (isCorrect ? '#047857' : '#b91c1c') : '#94a3b8', marginTop: 4 }}>
                            {studentAnsText || '<No Answer Submitted>'}
                          </div>
                        </div>

                        <div style={{ padding: '10px 14px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #86efac' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            ✓ Correct Answer
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#166534', marginTop: 4 }}>
                            {correctAnsText || 'N/A'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Subjective / Long Answer Preview */}
                    {isSubjective && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
                        <div style={{ padding: '12px 16px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                            Your Submitted Answer:
                          </div>
                          <div style={{ fontSize: 14, color: '#1e293b', marginTop: 6, whiteSpace: 'pre-wrap' }}>
                            {studentAnsText || '<No answer submitted>'}
                          </div>
                        </div>

                        {correctAnsText && (
                          <div style={{ padding: '12px 16px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #86efac' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>
                              ✓ Model / Correct Answer:
                            </div>
                            <div style={{ fontSize: 14, color: '#166534', marginTop: 6, whiteSpace: 'pre-wrap' }}>
                              {correctAnsText}
                            </div>
                          </div>
                        )}

                        {ans?.teacher_feedback && (
                          <div style={{ padding: '12px 16px', borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>
                              💬 Teacher Feedback:
                            </div>
                            <div style={{ fontSize: 14, color: '#1e40af', marginTop: 6 }}>
                              {ans.teacher_feedback}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28, borderTop: '1.5px solid var(--border-light, #e2e8f0)', paddingTop: 18 }}>
              <button
                type="button"
                onClick={() => setReviewAttempt(null)}
                style={{
                  padding: '10px 24px',
                  background: 'var(--color-primary-600, #2563eb)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(37,99,235,0.2)'
                }}
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
}


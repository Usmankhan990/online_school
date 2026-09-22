import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import { HiOutlineChartBar, HiOutlineAcademicCap, HiOutlineCheckCircle } from 'react-icons/hi';

export const getExamCategory = (exam) => {
  const t = (exam?.type || '').toLowerCase();
  const title = (exam?.title || '').toLowerCase();

  if (t === 'first_term' || title.includes('1st term') || title.includes('first term') || title.includes('term 1') || t === 'midterm' || title.includes('midterm')) {
    return { key: 'first_term', label: '1st Term Exam', icon: '🥇', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' };
  }
  if (t === 'second_term' || title.includes('2nd term') || title.includes('second term') || title.includes('term 2')) {
    return { key: 'second_term', label: '2nd Term Exam', icon: '🥈', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' };
  }
  if (t === 'final_exam' || t === 'final' || title.includes('final') || title.includes('annual') || title.includes('term 3')) {
    return { key: 'final_exam', label: 'Final Exam', icon: '🏆', color: '#ef4444', bg: '#fef2f2', border: '#fecaca' };
  }
  return { key: 'daily_test', label: 'Daily Test', icon: '📝', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' };
};

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all'); // 'all', 'daily_test', 'first_term', 'second_term', 'final_exam'
  const [reviewAttempt, setReviewAttempt] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(null);

  useEffect(() => {
    api.get('/student/results')
      .then(res => setResults(res.data.results || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

  const gradeColors = { 'A+': '#10b981', 'A': '#059669', 'B': '#3b82f6', 'C': '#f59e0b', 'D': '#f97316', 'F': '#ef4444' };

  const getGradeStyle = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' };
      case 'B':
        return { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' };
      case 'C':
        return { bg: '#fffbeb', color: '#d97706', border: '#fde68a' };
      case 'D':
        return { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' };
      default:
        return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
    }
  };

  // Category Counts
  const counts = useMemo(() => {
    const c = { all: results.length, daily_test: 0, first_term: 0, second_term: 0, final_exam: 0 };
    results.forEach(r => {
      const cat = getExamCategory(r.exam);
      if (c[cat.key] !== undefined) c[cat.key] += 1;
    });
    return c;
  }, [results]);

  // Filtered Results
  const filteredResults = useMemo(() => {
    if (activeCategory === 'all') return results;
    return results.filter(r => getExamCategory(r.exam).key === activeCategory);
  }, [results, activeCategory]);

  // Stats for filtered
  const totalMarksObt = filteredResults.reduce((sum, r) => sum + (parseFloat(r.total_obtained) || 0), 0);
  const totalMarksMax = filteredResults.reduce((sum, r) => sum + (parseFloat(r.exam?.total_marks) || 0), 0);
  const avgPct = totalMarksMax > 0 ? ((totalMarksObt / totalMarksMax) * 100).toFixed(1) : '0.0';

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10 }} />)}
      </div>
    );
  }

  const categoryTabs = [
    { key: 'all', label: 'All Results', icon: '📋', count: counts.all },
    { key: 'daily_test', label: 'Daily Tests', icon: '📝', count: counts.daily_test },
    { key: 'first_term', label: '1st Term Exam', icon: '🥇', count: counts.first_term },
    { key: 'second_term', label: '2nd Term Exam', icon: '🥈', count: counts.second_term },
    { key: 'final_exam', label: 'Final Exam', icon: '🏆', count: counts.final_exam },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            📊 My Exam Results
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, margin: '4px 0 0 0' }}>
            Daily test reports, 1st term, 2nd term, and final examination performance
          </p>
        </div>
        {results.length > 0 && (
          <span
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              background: 'var(--color-primary-50, #eff6ff)',
              color: 'var(--color-primary-700, #1d4ed8)',
              border: '1px solid var(--border-light, #bfdbfe)'
            }}
          >
            {results.length} Total Exams
          </span>
        )}
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid var(--border-light)', paddingBottom: 10 }}>
        {categoryTabs.map(tab => {
          const isActive = activeCategory === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveCategory(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 16px',
                borderRadius: 10,
                border: isActive ? '2px solid var(--color-primary-600, #1e3a5f)' : '1px solid var(--border-light)',
                background: isActive ? 'var(--color-primary-50, #eff6ff)' : 'var(--bg-card)',
                color: isActive ? 'var(--color-primary-700, #1d4ed8)' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab.icon} {tab.label}</span>
              {tab.count > 0 && (
                <span
                  style={{
                    background: isActive ? 'var(--color-primary-600, #1e3a5f)' : 'var(--bg-surface-2, #e2e8f0)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    padding: '2px 8px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 800
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Overview Cards */}
      {filteredResults.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          <div className="card" style={{ padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Exams in Category
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', marginTop: 4 }}>
              {filteredResults.length}
            </div>
          </div>

          <div className="card" style={{ padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Total Marks Obtained
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#3b82f6', marginTop: 4 }}>
              {totalMarksObt} / {totalMarksMax}
            </div>
          </div>

          <div className="card" style={{ padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Category Average
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: parseFloat(avgPct) >= 50 ? '#10b981' : '#ef4444', marginTop: 4 }}>
              {avgPct}%
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      {filteredResults.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '60px 24px',
            textAlign: 'center',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 14
          }}
        >
          <HiOutlineChartBar size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 12px', opacity: 0.6 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            No results in this category
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            You haven't completed any {categoryTabs.find(t => t.key === activeCategory)?.label || 'exams'} yet.
          </p>
        </div>
      ) : (
        <div
          className="card"
          style={{
            border: '1px solid var(--border-light)',
            borderRadius: 14,
            background: 'var(--bg-card)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            padding: 0
          }}
        >
          <div className="table-responsive hide-scrollbar" style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-2, #f8fafc)', borderBottom: '1.5px solid var(--border-light)' }}>
                  <th style={{ padding: '12px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Exam / Title
                  </th>
                  <th style={{ padding: '12px 8px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Category
                  </th>
                  <th style={{ padding: '12px 8px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Subject
                  </th>
                  <th style={{ padding: '12px 8px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>
                    Marks
                  </th>
                  <th style={{ padding: '12px 8px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>
                    Percentage
                  </th>
                  <th style={{ padding: '12px 8px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>
                    Grade
                  </th>
                  <th style={{ padding: '12px 8px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>
                    Status
                  </th>
                  <th style={{ padding: '12px 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'center' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map(result => {
                  const gStyle = getGradeStyle(result.grade);
                  const cat = getExamCategory(result.exam);
                  const pct = parseFloat(result.percentage || 0);

                  return (
                    <tr
                      key={result.id}
                      style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.15s ease' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--bg-surface-2, rgba(255,255,255,0.03))'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: 'var(--color-primary-50, #eff6ff)',
                            color: 'var(--color-primary-600, #2563eb)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <HiOutlineAcademicCap size={18} />
                          </div>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                              {result.exam?.title || 'Exam'}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                              {result.submitted_at ? new Date(result.submitted_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: cat.bg,
                          color: cat.color,
                          border: `1px solid ${cat.border}`,
                          fontSize: 11,
                          fontWeight: 800
                        }}>
                          {cat.icon} {cat.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: 'var(--bg-surface-2, #f1f5f9)',
                          color: 'var(--text-secondary, #334155)',
                          fontSize: 11.5,
                          fontWeight: 700,
                          border: '1px solid var(--border-light)'
                        }}>
                          {result.exam?.course?.subject?.name || 'General'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text-primary)' }}>
                          {result.total_obtained}
                        </span>
                        <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginLeft: 2 }}>
                          /{result.exam?.total_marks}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                          <span style={{ fontSize: 12, fontWeight: 800, color: pct >= 50 ? '#10b981' : '#ef4444' }}>
                            {pct.toFixed(1)}%
                          </span>
                          <div style={{ width: 48, height: 5, borderRadius: 99, background: 'var(--bg-surface-2, #e2e8f0)', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: pct >= 50 ? '#10b981' : '#ef4444', borderRadius: 99 }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-block',
                          minWidth: 32,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: gStyle.bg,
                          color: gStyle.color,
                          border: `1px solid ${gStyle.border}`,
                          fontSize: 12.5,
                          fontWeight: 800,
                          textAlign: 'center'
                        }}>
                          {result.grade || '-'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '3px 8px',
                          borderRadius: 20,
                          background: result.status === 'graded' ? '#ecfdf5' : '#fffbeb',
                          color: result.status === 'graded' ? '#059669' : '#d97706',
                          border: result.status === 'graded' ? '1px solid #a7f3d0' : '1px solid #fde68a',
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}>
                          {result.status === 'graded' && <HiOutlineCheckCircle size={13} />}
                          {result.status || 'Graded'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenReview(result.exam_id)}
                          disabled={reviewLoading === result.exam_id}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '5px 10px',
                            borderRadius: 7,
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>👁️</span> {reviewLoading === result.exam_id ? 'Loading...' : 'Preview'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
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

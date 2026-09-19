import { useState, useEffect, useMemo } from 'react';
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

  useEffect(() => {
    api.get('/student/results')
      .then(res => setResults(res.data.results || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '100%' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-2, #f8fafc)', borderBottom: '1.5px solid var(--border-light)' }}>
                  <th style={{ padding: '14px 18px', fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Exam / Title
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Category
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Subject
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
                    Marks
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
                    Percentage
                  </th>
                  <th style={{ padding: '14px 16px', fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
                    Grade
                  </th>
                  <th style={{ padding: '14px 18px', fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
                    Status
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
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: 'var(--color-primary-50, #eff6ff)',
                            color: 'var(--color-primary-600, #2563eb)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <HiOutlineAcademicCap size={20} />
                          </div>
                          <div>
                            <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                              {result.exam?.title || 'Exam'}
                            </div>
                            <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 2 }}>
                              {result.submitted_at ? new Date(result.submitted_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 10px',
                          borderRadius: 6,
                          background: cat.bg,
                          color: cat.color,
                          border: `1px solid ${cat.border}`,
                          fontSize: 11.5,
                          fontWeight: 800
                        }}>
                          {cat.icon} {cat.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: 6,
                          background: 'var(--bg-surface-2, #f1f5f9)',
                          color: 'var(--text-secondary, #334155)',
                          fontSize: 12,
                          fontWeight: 700,
                          border: '1px solid var(--border-light)'
                        }}>
                          {result.exam?.course?.subject?.name || 'General'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--text-primary)' }}>
                          {result.total_obtained}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 3 }}>
                          / {result.exam?.total_marks}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: pct >= 50 ? '#10b981' : '#ef4444' }}>
                            {pct.toFixed(1)}%
                          </span>
                          <div style={{ width: 68, height: 6, borderRadius: 99, background: 'var(--bg-surface-2, #e2e8f0)', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: pct >= 50 ? '#10b981' : '#ef4444', borderRadius: 99 }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-block',
                          minWidth: 38,
                          padding: '3px 10px',
                          borderRadius: 8,
                          background: gStyle.bg,
                          color: gStyle.color,
                          border: `1px solid ${gStyle.border}`,
                          fontSize: 13.5,
                          fontWeight: 800,
                          textAlign: 'center'
                        }}>
                          {result.grade || '-'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          padding: '4px 12px',
                          borderRadius: 20,
                          background: result.status === 'graded' ? '#ecfdf5' : '#fffbeb',
                          color: result.status === 'graded' ? '#059669' : '#d97706',
                          border: result.status === 'graded' ? '1px solid #a7f3d0' : '1px solid #fde68a',
                          fontSize: 11.5,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}>
                          {result.status === 'graded' && <HiOutlineCheckCircle size={14} />}
                          {result.status || 'Graded'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

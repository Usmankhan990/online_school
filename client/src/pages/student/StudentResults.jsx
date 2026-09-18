import { useState, useEffect } from 'react';
import api from '../../services/api';
import { HiOutlineChartBar, HiOutlineAcademicCap, HiOutlineCheckCircle } from 'react-icons/hi';

export default function StudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10 }} />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📊 My Results</h1>
          <p className="text-dark-400 text-sm mt-1">View your exam results and performance breakdown</p>
        </div>
        {results.length > 0 && (
          <span className="badge badge-info text-sm px-3 py-1">
            {results.length} Exam{results.length > 1 ? 's' : ''} Taken
          </span>
        )}
      </div>

      {results.length === 0 ? (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
          <HiOutlineChartBar size={48} style={{ color: '#94a3b8', margin: '0 auto 12px', opacity: 0.6 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>No Results Yet</h3>
          <p style={{ color: '#64748b', fontSize: 14 }}>You haven't completed any graded exams or quizzes yet.</p>
        </div>
      ) : (
        <div className="card" style={{ border: '1px solid #e2e8f0', borderRadius: 12, background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '100%' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Exam / Title</th>
                  <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subject</th>
                  <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Marks</th>
                  <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Percentage</th>
                  <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Grade</th>
                  <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map(result => {
                  const gStyle = getGradeStyle(result.grade);
                  const pct = parseFloat(result.percentage || 0);

                  return (
                    <tr
                      key={result.id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                      onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseOut={e => e.currentTarget.style.background = '#ffffff'}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
                            <HiOutlineAcademicCap size={18} />
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                              {result.exam?.title || 'Exam'}
                            </div>
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, textTransform: 'capitalize' }}>
                              {result.exam?.type || 'Quiz'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-block', padding: '3px 9px', borderRadius: 6, background: '#f1f5f9', color: '#334155', fontSize: 12, fontWeight: 600 }}>
                          {result.exam?.course?.subject?.name || 'General'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                          {result.total_obtained}
                        </span>
                        <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 2 }}>
                          / {result.exam?.total_marks}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: pct >= 50 ? '#059669' : '#dc2626' }}>
                            {pct.toFixed(1)}%
                          </span>
                          <div style={{ width: 64, height: 5, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: pct >= 50 ? '#10b981' : '#ef4444', borderRadius: 3 }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-block',
                          minWidth: 36,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: gStyle.bg,
                          color: gStyle.color,
                          border: `1px solid ${gStyle.border}`,
                          fontSize: 13,
                          fontWeight: 800,
                          textAlign: 'center'
                        }}>
                          {result.grade || '-'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '3px 10px',
                          borderRadius: 20,
                          background: result.status === 'graded' ? '#ecfdf5' : '#fffbeb',
                          color: result.status === 'graded' ? '#059669' : '#d97706',
                          border: result.status === 'graded' ? '1px solid #a7f3d0' : '1px solid #fde68a',
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}>
                          {result.status === 'graded' && <HiOutlineCheckCircle size={13} />}
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

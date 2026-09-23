import { useState, useEffect } from 'react';
import api from '../../services/api';
import logoImg from '../../assets/logo.jpg';
import { getExamCategory } from '../student/StudentResults';

export default function ParentReportCard() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTerms, setSelectedTerms] = useState({}); // childId -> selectedTerm

  useEffect(() => {
    const fetch = async () => {
      try {
        const r = await api.get('/parent/dashboard');
        setChildren(r.data.children || []);
      } catch (err) {
        console.error('Parent report card fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const gradeColors = {
    'A+': '#10b981',
    'A': '#059669',
    'B': '#3b82f6',
    'C': '#f59e0b',
    'D': '#f97316',
    'F': '#ef4444'
  };

  const getGrade = (p) => {
    if (p >= 90) return 'A+';
    if (p >= 80) return 'A';
    if (p >= 70) return 'B';
    if (p >= 60) return 'C';
    if (p >= 50) return 'D';
    return 'F';
  };

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />
        ))}
      </div>
    );
  }

  const termTabs = [
    { key: 'all', label: 'All Terms & Tests (Combined)', icon: '📋' },
    { key: 'daily_test', label: 'Daily Tests', icon: '📝' },
    { key: 'first_term', label: '1st Term Exam', icon: '🥇' },
    { key: 'second_term', label: '2nd Term Exam', icon: '🥈' },
    { key: 'final_exam', label: 'Final Exam', icon: '🏆' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>🎓 Child Report Card</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Official academic transcripts for Daily Tests, 1st Term, 2nd Term & Final Exams
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => window.print()}
          style={{ fontWeight: 700 }}
        >
          🖨 Print Report
        </button>
      </div>

      {children.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🎓</span>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No linked children found</p>
        </div>
      ) : (
        children.map(child => {
          const childId = child.profile.user_id;
          const currentTerm = selectedTerms[childId] || 'all';
          const rawResults = child.results || [];
          const att = child.attendance || {};
          const attPct = parseFloat(att.percentage || 100);

          // Filter by term
          const matchedResults = currentTerm === 'all'
            ? rawResults
            : rawResults.filter(r => getExamCategory(r.exam).key === currentTerm);

          // Group by subject
          const subjectMap = {};
          matchedResults.forEach(r => {
            const sn = r.exam?.course?.subject?.name || 'General';
            if (!subjectMap[sn]) subjectMap[sn] = { subject: sn, totalObtained: 0, totalMarks: 0 };
            subjectMap[sn].totalObtained += (r.total_obtained || 0);
            subjectMap[sn].totalMarks += (r.exam?.total_marks || 0);
          });
          const subjects = Object.values(subjectMap).map(s => ({
            ...s,
            pct: s.totalMarks > 0 ? ((s.totalObtained / s.totalMarks) * 100).toFixed(1) : 0,
          }));
          const grandO = subjects.reduce((a, s) => a + s.totalObtained, 0);
          const grandM = subjects.reduce((a, s) => a + s.totalMarks, 0);
          const overallPct = grandM > 0 ? ((grandO / grandM) * 100).toFixed(1) : 0;
          const overallGrade = getGrade(overallPct);

          return (
            <div key={childId} className="card" style={{ overflow: 'hidden', borderRadius: 16, border: '1.5px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Header Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #1C1917, #292524)',
                padding: 24,
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <img
                    src={logoImg}
                    alt="Taleem Ghar"
                    style={{ width: 52, height: 52, borderRadius: 12, background: '#ffffff', padding: 2, objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>{child.profile.user?.full_name}</h3>
                    <p style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
                      Class: <strong>{child.profile.class?.display_name || `Class ${child.profile.class?.grade_level}`}</strong> | Roll No: <strong>{child.profile.roll_number || '-'}</strong>
                    </p>
                    <p style={{ fontSize: 11.5, opacity: 0.65, marginTop: 2, margin: '2px 0 0 0' }}>
                      Taleem Ghar Online School — Punjab Curriculum & Textbook Board (PCTB)
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'center', minWidth: 90 }}>
                  <div style={{ fontSize: 40, fontWeight: 900, color: gradeColors[overallGrade] || 'white', lineHeight: 1 }}>
                    {overallGrade}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>{overallPct}% Overall</div>
                  <span style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase' }}>Academic Grade</span>
                </div>
              </div>

              {/* Term Selection Tabs for Child */}
              <div style={{ padding: '0 20px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {termTabs.map(tab => {
                  const isActive = currentTerm === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setSelectedTerms(prev => ({ ...prev, [childId]: tab.key }))}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: isActive ? '2px solid var(--color-primary-600, #1e3a5f)' : '1px solid var(--border-light)',
                        background: isActive ? 'var(--color-primary-50, #eff6ff)' : 'var(--bg-secondary)',
                        color: isActive ? 'var(--color-primary-700, #1d4ed8)' : 'var(--text-secondary)',
                        fontWeight: 800,
                        fontSize: 12.5,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{tab.icon} {tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* ================= ATTENDANCE SECTION ================= */}
              <div style={{ padding: '0 20px' }}>
                <div style={{ padding: 18, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>📅</span>
                      <div>
                        <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                          Attendance & Punctuality Record
                        </h4>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                          Verified class sessions and attendance rate
                        </p>
                      </div>
                    </div>

                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 800,
                      background: attPct >= 80 ? '#ecfdf5' : '#fef2f2',
                      color: attPct >= 80 ? '#059669' : '#dc2626',
                      border: `1px solid ${attPct >= 80 ? '#a7f3d0' : '#fecaca'}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      {attPct >= 80 ? '⭐' : '⚠️'} {att.remark || 'Regular Attendance'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                    <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Days</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#3b82f6', marginTop: 2 }}>{att.totalDays || 0}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>Sessions</div>
                    </div>

                    <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Present</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#10b981', marginTop: 2 }}>{att.presentDays || 0}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>On Time</div>
                    </div>

                    <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Late</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#f59e0b', marginTop: 2 }}>{att.lateDays || 0}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>Late</div>
                    </div>

                    <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Absent</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#ef4444', marginTop: 2 }}>{att.absentDays || 0}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>Absent</div>
                    </div>

                    <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Attendance Rate</div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: attPct >= 80 ? '#10b981' : '#ef4444', marginTop: 2 }}>
                        {att.percentage || 100}%
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>Overall</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subjects Table */}
              <div style={{ padding: '0 20px 20px 20px', overflowX: 'auto' }}>
                <div style={{ border: '1px solid var(--border-light)', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      📚 {termTabs.find(t => t.key === currentTerm)?.label} Evaluation
                    </h4>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {subjects.length} Subjects Evaluated
                    </span>
                  </div>

                  {subjects.length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                      No exams found for {termTabs.find(t => t.key === currentTerm)?.label}
                    </div>
                  ) : (
                    <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'var(--bg-surface-2, #f8fafc)' }}>
                          <th style={{ padding: '12px 18px', fontWeight: 700 }}>Subject</th>
                          <th style={{ padding: '12px 18px', fontWeight: 700 }}>Obtained</th>
                          <th style={{ padding: '12px 18px', fontWeight: 700 }}>Total</th>
                          <th style={{ padding: '12px 18px', fontWeight: 700 }}>Percentage</th>
                          <th style={{ padding: '12px 18px', fontWeight: 700 }}>Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjects.map((s, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-primary)' }}>{s.subject}</td>
                            <td style={{ padding: '12px 18px', fontWeight: 600 }}>{s.totalObtained}</td>
                            <td style={{ padding: '12px 18px', color: 'var(--text-secondary)' }}>{s.totalMarks}</td>
                            <td style={{ padding: '12px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ flex: 1, maxWidth: 100, height: 7, background: 'var(--bg-surface-2, #e2e8f0)', borderRadius: 99, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: `${Math.min(s.pct, 100)}%`,
                                      height: '100%',
                                      background: gradeColors[getGrade(s.pct)] || '#6b7280',
                                      borderRadius: 99,
                                    }}
                                  />
                                </div>
                                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>{s.pct}%</span>
                              </div>
                            </td>
                            <td style={{ padding: '12px 18px', fontWeight: 900, color: gradeColors[getGrade(s.pct)] }}>
                              {getGrade(s.pct)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ fontWeight: 800, background: 'var(--bg-surface-2, #f8fafc)', borderTop: '2px solid var(--border-light)' }}>
                          <td style={{ padding: '12px 18px' }}>Grand Total</td>
                          <td style={{ padding: '12px 18px' }}>{grandO}</td>
                          <td style={{ padding: '12px 18px' }}>{grandM}</td>
                          <td style={{ padding: '12px 18px' }}>{overallPct}%</td>
                          <td style={{ padding: '12px 18px', fontWeight: 900, color: gradeColors[overallGrade] }}>
                            {overallGrade}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import logoImg from '../../assets/logo.jpg';
import { getExamCategory } from './StudentResults';

export default function StudentReportCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState('all'); // 'all', 'daily_test', 'first_term', 'second_term', 'final_exam'

  useEffect(() => {
    const fetch = async () => {
      try {
        const r = await api.get('/student/report-card');
        setData(r.data);
      } catch (err) {
        console.error('Report card fetch error:', err);
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

  // Compute filtered report by term/category
  const filteredReport = useMemo(() => {
    if (!data || !data.results) return data;
    const rawAttempts = data.results || [];
    
    // Filter attempts by term
    const matchedAttempts = selectedTerm === 'all'
      ? rawAttempts
      : rawAttempts.filter(a => getExamCategory(a.exam).key === selectedTerm);

    // Group by subject
    const subjectMap = {};
    for (const attempt of matchedAttempts) {
      const subjectName = attempt.exam?.course?.subject?.name || 'General';
      if (!subjectMap[subjectName]) {
        subjectMap[subjectName] = { subject: subjectName, exams: [], totalObtained: 0, totalMarks: 0 };
      }
      subjectMap[subjectName].exams.push({
        title: attempt.exam.title,
        obtained: attempt.total_obtained || 0,
        total: attempt.exam.total_marks || 0,
        percentage: attempt.percentage || 0,
        grade: attempt.grade || '-',
      });
      subjectMap[subjectName].totalObtained += (attempt.total_obtained || 0);
      subjectMap[subjectName].totalMarks += (attempt.exam.total_marks || 0);
    }

    const subjects = Object.values(subjectMap).map(s => ({
      ...s,
      percentage: s.totalMarks > 0 ? ((s.totalObtained / s.totalMarks) * 100).toFixed(1) : 0,
      grade: getGrade(s.totalMarks > 0 ? (s.totalObtained / s.totalMarks) * 100 : 0),
    }));

    const grandTotal = subjects.reduce((s, sub) => s + sub.totalObtained, 0);
    const grandMax = subjects.reduce((s, sub) => s + sub.totalMarks, 0);
    const overallPercentage = grandMax > 0 ? ((grandTotal / grandMax) * 100).toFixed(1) : 0;

    return {
      ...data,
      subjects: subjects.length > 0 ? subjects : (selectedTerm === 'all' ? data.subjects : []),
      summary: {
        totalObtained: grandTotal,
        totalMarks: grandMax,
        percentage: overallPercentage,
        grade: getGrade(overallPercentage),
      },
      attemptCount: matchedAttempts.length
    };
  }, [data, selectedTerm]);

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />
        ))}
      </div>
    );
  }

  if (!data || !data.subjects?.length) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>🎓 Report Card</h1>
        </div>
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🎓</span>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No graded results yet</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Your report card will appear once exam results are published.</p>
        </div>
      </div>
    );
  }

  const att = data.attendance || {};
  const attPct = parseFloat(att.percentage || 100);

  const termTabs = [
    { key: 'all', label: 'All Terms & Tests (Combined)', icon: '📋' },
    { key: 'daily_test', label: 'Daily Tests', icon: '📝' },
    { key: 'first_term', label: '1st Term Exam', icon: '🥇' },
    { key: 'second_term', label: '2nd Term Exam', icon: '🥈' },
    { key: 'final_exam', label: 'Final Exam', icon: '🏆' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>🎓 Student Report Card</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Official academic transcripts for Daily Tests, 1st Term, 2nd Term & Final Exams
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => window.print()}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
        >
          🖨 Print Official Report
        </button>
      </div>

      {/* Term / Exam Category Selector Pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid var(--border-light)', paddingBottom: 10 }}>
        {termTabs.map(tab => {
          const isActive = selectedTerm === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedTerm(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
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
            </button>
          );
        })}
      </div>

      {/* Student Info & Header Banner */}
      <div className="card" style={{ padding: 24, background: 'linear-gradient(135deg, #1C1917, #292524)', color: 'white', borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img
              src={logoImg}
              alt="Taleem Ghar"
              style={{ width: 56, height: 56, borderRadius: 12, background: '#ffffff', padding: 3, objectFit: 'cover', flexShrink: 0 }}
            />
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>{data.student?.name}</h2>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 13, opacity: 0.85, marginTop: 6 }}>
                <span>🏫 Class: <strong>{data.student?.class}</strong></span>
                <span>•</span>
                <span>🔢 Roll No: <strong>{data.student?.rollNo || '-'}</strong></span>
                <span>•</span>
                <span>📜 Evaluation: <strong>{termTabs.find(t => t.key === selectedTerm)?.label}</strong></span>
              </div>
              <p style={{ fontSize: 11.5, opacity: 0.65, marginTop: 4, margin: '4px 0 0 0' }}>
                Taleem Ghar Online School — Punjab Curriculum & Textbook Board (PCTB)
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'center', minWidth: 110 }}>
            <div style={{ fontSize: 44, fontWeight: 900, color: gradeColors[filteredReport?.summary?.grade] || '#10b981', lineHeight: 1 }}>
              {filteredReport?.summary?.grade || '-'}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>
              {filteredReport?.summary?.percentage || 0}% Overall
            </div>
            <span style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase' }}>Academic Grade</span>
          </div>
        </div>
      </div>

      {/* ================= ATTENDANCE & PUNCTUALITY SECTION ================= */}
      <div className="card" style={{ padding: 20, borderRadius: 14, border: '1.5px solid var(--border-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>📅</span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Attendance & Punctuality Record
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Official attendance tracking verified via live biometric & teacher records
              </p>
            </div>
          </div>

          <span style={{
            padding: '5px 14px',
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Days</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#3b82f6', marginTop: 4 }}>{att.totalDays || 0}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>Recorded Sessions</div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Present</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#10b981', marginTop: 4 }}>{att.presentDays || 0}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>On-Time Classes</div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Late</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#f59e0b', marginTop: 4 }}>{att.lateDays || 0}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>Late Arrivals</div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Absent</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#ef4444', marginTop: 4 }}>{att.absentDays || 0}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>Unexcused</div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Attendance Rate</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: attPct >= 80 ? '#10b981' : '#ef4444', marginTop: 4 }}>
              {att.percentage || 100}%
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>Overall Presence</div>
          </div>
        </div>
      </div>

      {/* Subject-wise Results */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 14 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            📚 {termTabs.find(t => t.key === selectedTerm)?.label} Performance
          </h3>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
            {filteredReport?.subjects?.length || 0} Subjects Evaluated
          </span>
        </div>

        {filteredReport?.subjects?.length === 0 ? (
          <div style={{ padding: 36, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <span style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>📝</span>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              No exams found for {termTabs.find(t => t.key === selectedTerm)?.label}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-2, #f8fafc)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Subject</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Marks Obtained</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Total Marks</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Percentage</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Grade</th>
                </tr>
              </thead>
              <tbody>
                {filteredReport?.subjects?.map((s, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--text-primary)' }}>{s.subject}</td>
                    <td style={{ padding: '14px 20px', fontWeight: 600 }}>{s.totalObtained}</td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>{s.totalMarks}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, maxWidth: 120, height: 8, background: 'var(--bg-surface-2, #e2e8f0)', borderRadius: 99, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.min(s.percentage, 100)}%`,
                              height: '100%',
                              background: gradeColors[s.grade] || '#6b7280',
                              borderRadius: 99,
                              transition: 'width 0.5s ease',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{s.percentage}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: 17, fontWeight: 900, color: gradeColors[s.grade] || '#6b7280' }}>
                        {s.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ fontWeight: 800, background: 'var(--bg-surface-2, #f8fafc)', borderTop: '2px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 20px' }}>Grand Total</td>
                  <td style={{ padding: '14px 20px' }}>{filteredReport?.summary?.totalObtained}</td>
                  <td style={{ padding: '14px 20px' }}>{filteredReport?.summary?.totalMarks}</td>
                  <td style={{ padding: '14px 20px' }}>{filteredReport?.summary?.percentage}%</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: 19, fontWeight: 900, color: gradeColors[filteredReport?.summary?.grade] || '#6b7280' }}>
                      {filteredReport?.summary?.grade}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Grading Scale */}
      <div className="card" style={{ padding: 16 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>📐 Grading Scale & Benchmark</h4>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { g: 'A+', r: '90-100% (Outstanding)' },
            { g: 'A', r: '80-89% (Excellent)' },
            { g: 'B', r: '70-79% (Very Good)' },
            { g: 'C', r: '60-69% (Good)' },
            { g: 'D', r: '50-59% (Satisfactory)' },
            { g: 'F', r: 'Below 50% (Fail)' },
          ].map(x => (
            <span
              key={x.g}
              className="badge"
              style={{
                background: `${gradeColors[x.g]}15`,
                color: gradeColors[x.g],
                padding: '4px 12px',
                border: `1px solid ${gradeColors[x.g]}30`,
                fontWeight: 700,
                fontSize: 12
              }}
            >
              {x.g}: {x.r}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';

export default function TeacherResults() {
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'graded', 'pending'
  const [searchQuery, setSearchQuery] = useState('');
  
  const [grading, setGrading] = useState(null);
  const [gradeForm, setGradeForm] = useState({ marks_obtained: '', feedback: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resResults, resCourses] = await Promise.all([
        api.get('/teacher/results'),
        api.get('/teacher/courses').catch(() => ({ data: { courses: [] } })),
      ]);
      setResults(resResults.data.results || []);
      setCourses(resCourses.data.courses || []);
    } catch (err) {
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeAnswer = async (answerId) => {
    try {
      await api.post('/teacher/exams/grade-answer', { answer_id: answerId, ...gradeForm });
      setMsg('✅ Answer graded successfully!');
      setGrading(null);
      fetchData();
    } catch (err) {
      setMsg('❌ Failed to grade answer.');
    }
  };

  const gradeColor = (g) => ({
    'A+': '#10b981',
    'A': '#059669',
    'B': '#3b82f6',
    'C': '#f59e0b',
    'D': '#f97316',
    'F': '#ef4444'
  }[g] || '#6b7280');

  // Build class & subject hierarchy from courses and results
  const classHierarchy = useMemo(() => {
    const map = {};

    // From courses taught
    courses.forEach(c => {
      if (c.class) {
        const cId = String(c.class.id);
        if (!map[cId]) {
          map[cId] = {
            id: cId,
            name: c.class.display_name || `Class ${c.class.grade_level}`,
            grade: c.class.grade_level,
            subjects: new Set(),
            count: 0,
          };
        }
        if (c.subject?.name) {
          map[cId].subjects.add(c.subject.name);
        }
      }
    });

    // From actual exam results
    results.forEach(r => {
      const cls = r.exam?.course?.class;
      const subj = r.exam?.course?.subject;
      if (cls) {
        const cId = String(cls.id);
        if (!map[cId]) {
          map[cId] = {
            id: cId,
            name: cls.display_name || `Class ${cls.grade_level}`,
            grade: cls.grade_level,
            subjects: new Set(),
            count: 0,
          };
        }
        map[cId].count += 1;
        if (subj?.name) {
          map[cId].subjects.add(subj.name);
        }
      }
    });

    return Object.values(map).map(c => ({
      ...c,
      subjects: Array.from(c.subjects),
    })).sort((a, b) => (a.grade || 0) - (b.grade || 0));
  }, [courses, results]);

  // Available subjects for current class
  const availableSubjects = useMemo(() => {
    if (selectedClass === 'all') {
      const allSubjs = new Set();
      classHierarchy.forEach(c => c.subjects.forEach(s => allSubjs.add(s)));
      return Array.from(allSubjs);
    }
    const currentClass = classHierarchy.find(c => c.id === selectedClass);
    return currentClass ? currentClass.subjects : [];
  }, [classHierarchy, selectedClass]);

  // Filtered Results
  const filteredResults = useMemo(() => {
    return results.filter(r => {
      const clsId = String(r.exam?.course?.class?.id || '');
      const subjName = r.exam?.course?.subject?.name || '';
      const studentName = (r.student?.full_name || '').toLowerCase();
      const examTitle = (r.exam?.title || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      // Class Filter
      if (selectedClass !== 'all' && clsId !== selectedClass) return false;

      // Subject Filter
      if (selectedSubject !== 'all' && subjName !== selectedSubject) return false;

      // Status Filter
      if (statusFilter === 'graded' && r.status !== 'graded') return false;
      if (statusFilter === 'pending' && r.status === 'graded') return false;

      // Search Query
      if (q && !studentName.includes(q) && !examTitle.includes(q) && !subjName.toLowerCase().includes(q)) {
        return false;
      }

      return true;
    });
  }, [results, selectedClass, selectedSubject, statusFilter, searchQuery]);

  // Stats calculation
  const totalCount = filteredResults.length;
  const gradedCount = filteredResults.filter(r => r.status === 'graded').length;
  const pendingCount = totalCount - gradedCount;
  const avgPercentage = totalCount > 0
    ? (filteredResults.reduce((acc, r) => acc + (parseFloat(r.percentage) || 0), 0) / totalCount).toFixed(0)
    : 0;

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="skeleton" style={{ height: 40, width: 250, borderRadius: 10 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />
          ))}
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 110, borderRadius: 14 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>📊 Exam Results & Grading</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Review student exam performance and grade subjective answers by class & subject
          </p>
        </div>
        <button
          type="button"
          onClick={fetchData}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          🔄 Refresh
        </button>
      </div>

      {msg && (
        <div
          className="card"
          style={{
            padding: 14,
            background: msg.startsWith('✅') ? '#ecfdf5' : '#fef2f2',
            color: msg.startsWith('✅') ? '#059669' : '#dc2626',
            border: `1px solid ${msg.startsWith('✅') ? '#a7f3d0' : '#fecaca'}`,
            fontWeight: 700,
            fontSize: 13,
            borderRadius: 10
          }}
        >
          {msg}
        </div>
      )}

      {/* Class Selector / Tabs */}
      <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
            🏫 Classes You Teach ({classHierarchy.length})
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
            Select a class to filter records
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => { setSelectedClass('all'); setSelectedSubject('all'); }}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: selectedClass === 'all' ? '2px solid var(--color-primary-600, #1e3a5f)' : '1px solid var(--border-light)',
              background: selectedClass === 'all' ? 'var(--color-primary-50, #eff6ff)' : 'var(--bg-secondary)',
              color: selectedClass === 'all' ? 'var(--color-primary-700, #1d4ed8)' : 'var(--text-secondary)',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease'
            }}
          >
            <span>📚 All Classes</span>
            {results.length > 0 && (
              <span style={{
                background: selectedClass === 'all' ? 'var(--color-primary-600, #1e3a5f)' : 'var(--border-light)',
                color: selectedClass === 'all' ? '#fff' : 'var(--text-secondary)',
                padding: '2px 8px',
                borderRadius: 999,
                fontSize: 11
              }}>
                {results.length}
              </span>
            )}
          </button>

          {classHierarchy.map(c => {
            const isSelected = selectedClass === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => { setSelectedClass(c.id); setSelectedSubject('all'); }}
                style={{
                  padding: '10px 18px',
                  borderRadius: 10,
                  border: isSelected ? '2px solid var(--color-primary-600, #1e3a5f)' : '1px solid var(--border-light)',
                  background: isSelected ? 'var(--color-primary-50, #eff6ff)' : 'var(--bg-secondary)',
                  color: isSelected ? 'var(--color-primary-700, #1d4ed8)' : 'var(--text-secondary)',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.15s ease'
                }}
              >
                <span>🏫 {c.name}</span>
                {c.count > 0 && (
                  <span style={{
                    background: isSelected ? 'var(--color-primary-600, #1e3a5f)' : 'var(--border-light)',
                    color: isSelected ? '#fff' : 'var(--text-secondary)',
                    padding: '2px 8px',
                    borderRadius: 999,
                    fontSize: 11
                  }}>
                    {c.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Subjects taught pills under class */}
        {availableSubjects.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
            paddingTop: 10,
            borderTop: '1px solid var(--border-light)'
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginRight: 4 }}>
              📖 Subjects:
            </span>
            <button
              type="button"
              onClick={() => setSelectedSubject('all')}
              style={{
                padding: '5px 12px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                border: selectedSubject === 'all' ? '1px solid #3b82f6' : '1px solid var(--border-light)',
                background: selectedSubject === 'all' ? '#eff6ff' : 'var(--bg-card)',
                color: selectedSubject === 'all' ? '#1d4ed8' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              All Subjects
            </button>
            {availableSubjects.map(subj => {
              const isSelected = selectedSubject === subj;
              return (
                <button
                  key={subj}
                  type="button"
                  onClick={() => setSelectedSubject(subj)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    border: isSelected ? '1px solid #3b82f6' : '1px solid var(--border-light)',
                    background: isSelected ? '#eff6ff' : 'var(--bg-card)',
                    color: isSelected ? '#1d4ed8' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  📘 {subj}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Attempts', value: totalCount, icon: '📝', color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Graded Results', value: gradedCount, icon: '✅', color: '#10b981', bg: '#ecfdf5' },
          { label: 'Pending Grading', value: pendingCount, icon: '⏳', color: '#f59e0b', bg: '#fffbeb' },
          { label: 'Average Score', value: `${avgPercentage}%`, icon: '📈', color: '#7c3aed', bg: '#f5f3ff' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            </div>
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
          <input
            type="text"
            placeholder="🔍 Search student name, exam title or subject..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 13.5 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { id: 'all', label: 'All Status' },
            { id: 'graded', label: '✅ Graded' },
            { id: 'pending', label: '⏳ Pending' },
          ].map(st => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStatusFilter(st.id)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 700,
                border: statusFilter === st.id ? '2px solid var(--color-primary-600, #1e3a5f)' : '1px solid var(--border-light)',
                background: statusFilter === st.id ? 'var(--color-primary-50, #eff6ff)' : 'var(--bg-secondary)',
                color: statusFilter === st.id ? 'var(--color-primary-700, #1d4ed8)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results List */}
      {filteredResults.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <span style={{ fontSize: 44, display: 'block', marginBottom: 12 }}>📭</span>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>No exam attempts found</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            {searchQuery || selectedClass !== 'all' || selectedSubject !== 'all'
              ? 'Try adjusting your filters or search query.'
              : 'Students enrolled in your classes have not attempted any exams yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {filteredResults.map(r => {
            const cls = r.exam?.course?.class;
            const subj = r.exam?.course?.subject;
            const ungradedAnswers = r.answers?.filter(a => a.marks_obtained == null) || [];

            return (
              <div key={r.id} className="card" style={{ padding: 20, transition: 'all 0.15s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                      <div style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: 'var(--color-primary-100, #dbeafe)',
                        color: 'var(--color-primary-700, #1d4ed8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 14
                      }}>
                        {r.student?.full_name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <h3 style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                          {r.student?.full_name || 'Student'}
                        </h3>
                        <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>{r.student?.email || '-'}</span>
                      </div>
                      <span className={`badge ${r.status === 'graded' ? 'badge-success' : 'badge-warning'}`} style={{ marginLeft: 6 }}>
                        {r.status === 'graded' ? '✅ Graded' : '⏳ Pending'}
                      </span>
                    </div>

                    {/* Class and Subject Tags */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                      {cls && (
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: 6,
                          fontSize: 11.5,
                          fontWeight: 700,
                          background: 'var(--bg-surface-2)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-light)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          🏫 {cls.display_name || `Class ${cls.grade_level}`}
                        </span>
                      )}
                      {subj && (
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: 6,
                          fontSize: 11.5,
                          fontWeight: 700,
                          background: 'rgba(59, 130, 246, 0.12)',
                          color: '#3b82f6',
                          border: '1px solid rgba(59, 130, 246, 0.25)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          📘 {subj.name}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 16, fontSize: 12.5, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                      <span>📝 <strong>Exam:</strong> {r.exam?.title || 'Exam'}</span>
                      <span>📅 <strong>Submitted:</strong> {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                    </div>
                  </div>

                  {/* Score & Grade Display */}
                  <div style={{
                    textAlign: 'center',
                    minWidth: 100,
                    padding: '8px 16px',
                    borderRadius: 12,
                    background: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-light)'
                  }}>
                    <div style={{ fontSize: 26, fontWeight: 900, color: gradeColor(r.grade), lineHeight: 1.1 }}>
                      {r.grade || '-'}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                      {r.total_obtained || 0} / {r.exam?.total_marks || 0}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>
                      ({parseFloat(r.percentage || 0).toFixed(0)}%)
                    </div>
                  </div>
                </div>

                {/* Show subjective answers needing grading */}
                {ungradedAnswers.length > 0 && (
                  <div style={{ marginTop: 14, padding: 14, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 10 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', margin: '0 0 10px 0' }}>
                      ⏳ {ungradedAnswers.length} subjective answer(s) awaiting your grading:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {ungradedAnswers.map(a => (
                        <div
                          key={a.id}
                          style={{
                            padding: '10px 12px',
                            background: 'var(--bg-surface)',
                            borderRadius: 8,
                            border: '1px solid var(--border-light)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 8
                          }}
                        >
                          <div style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1, minWidth: 200 }}>
                            <strong>Answer:</strong> {a.answer_text?.slice(0, 120) || '(File submission attached)'}
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-accent"
                            onClick={() => {
                              setGrading(a.id);
                              setGradeForm({ marks_obtained: '', feedback: '' });
                            }}
                            style={{ padding: '6px 14px', fontSize: 12 }}
                          >
                            ✍️ Grade This
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Grading Modal */}
      {grading && (
        <div className="modal-overlay" onClick={() => setGrading(null)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <h2>✍️ Grade Subjective Answer</h2>
              <button className="btn btn-icon btn-ghost" onClick={() => setGrading(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="form-label">Marks Obtained *</label>
                <input
                  type="number"
                  className="form-input"
                  value={gradeForm.marks_obtained}
                  onChange={e => setGradeForm(f => ({ ...f, marks_obtained: e.target.value }))}
                  min={0}
                  placeholder="Enter marks"
                  autoFocus
                />
              </div>
              <div>
                <label className="form-label">Teacher Feedback / Remarks</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={gradeForm.feedback}
                  onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))}
                  placeholder="Well done, keep it up..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setGrading(null)}>Cancel</button>
              <button className="btn btn-accent" onClick={() => handleGradeAnswer(grading)}>
                ✅ Save Grade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

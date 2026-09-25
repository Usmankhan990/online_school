import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';

export default function AdminExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all', 'published', 'draft'
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Exam for viewing questions modal
  const [viewingExam, setViewingExam] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/admin/exams');
      setExams(data.exams || []);
    } catch (err) {
      console.error('Failed to load exams:', err);
      setError('Failed to load exams list.');
    } finally {
      setLoading(false);
    }
  };

  // Extract unique classes
  const classesList = useMemo(() => {
    const map = {};
    exams.forEach(ex => {
      const cls = ex.course?.class;
      if (cls) {
        const cId = String(cls.id || cls.grade_level);
        if (!map[cId]) {
          map[cId] = {
            id: cId,
            grade: cls.grade_level,
            name: cls.display_name || cls.name || `Class ${cls.grade_level}`,
            count: 0
          };
        }
        map[cId].count += 1;
      }
    });
    return Object.values(map).sort((a, b) => (parseInt(a.grade, 10) || 0) - (parseInt(b.grade, 10) || 0));
  }, [exams]);

  // Extract unique subjects
  const subjectsList = useMemo(() => {
    const set = new Set();
    exams.forEach(ex => {
      const subj = ex.course?.subject?.name;
      if (subj) set.add(subj);
    });
    return Array.from(set).sort();
  }, [exams]);

  // Filtered Exams
  const filteredExams = useMemo(() => {
    return exams.filter(ex => {
      const clsId = String(ex.course?.class?.id || ex.course?.class?.grade_level || '');
      const subjName = ex.course?.subject?.name || '';
      const teacherName = (ex.teacher?.full_name || '').toLowerCase();
      const examTitle = (ex.title || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      if (selectedClass !== 'all' && clsId !== selectedClass) return false;
      if (selectedSubject !== 'all' && subjName !== selectedSubject) return false;
      if (selectedStatus === 'published' && !ex.is_published) return false;
      if (selectedStatus === 'draft' && ex.is_published) return false;

      if (q && !examTitle.includes(q) && !teacherName.includes(q) && !subjName.toLowerCase().includes(q)) {
        return false;
      }

      return true;
    });
  }, [exams, selectedClass, selectedSubject, selectedStatus, searchQuery]);

  // Parse Options helper
  const parseOptions = (optionsRaw) => {
    if (!optionsRaw) return [];
    if (Array.isArray(optionsRaw)) return optionsRaw;
    try {
      const parsed = JSON.parse(optionsRaw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const totalQuestionsCount = useMemo(() => {
    return exams.reduce((acc, ex) => acc + (ex.questions?.length || 0), 0);
  }, [exams]);

  const publishedCount = useMemo(() => {
    return exams.filter(ex => ex.is_published).length;
  }, [exams]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 26 }}>📝</span>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Exams Overview & Review
            </h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Monitor and review all teacher-created exams, examine question papers, answer keys, and publication status.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchExams}
          className="btn btn-secondary btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer'
          }}
        >
          🔄 {loading ? 'Refreshing...' : 'Refresh Exams'}
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            fontWeight: 600,
            fontSize: 13
          }}
        >
          {error}
        </div>
      )}

      {/* ── Metric Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div
          className="card"
          style={{
            padding: '16px 20px',
            borderRadius: 14,
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-light, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}
        >
          <div style={{ width: 42, height: 42, borderRadius: 10, background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            📚
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{exams.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Total Exams Added</div>
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '16px 20px',
            borderRadius: 14,
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-light, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}
        >
          <div style={{ width: 42, height: 42, borderRadius: 10, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            ✅
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#059669' }}>{publishedCount}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Published & Live</div>
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '16px 20px',
            borderRadius: 14,
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-light, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}
        >
          <div style={{ width: 42, height: 42, borderRadius: 10, background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            📝
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#d97706' }}>{totalQuestionsCount}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Total Questions Built</div>
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '16px 20px',
            borderRadius: 14,
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-light, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            gap: 16
          }}
        >
          <div style={{ width: 42, height: 42, borderRadius: 10, background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            🏫
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{classesList.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Active Classes</div>
          </div>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          borderRadius: 14,
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border-light, #e2e8f0)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'end' }}>
          {/* Class Filter */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              🏫 Filter by Class:
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="form-input"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}
            >
              <option value="all">All Classes ({exams.length})</option>
              {classesList.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.count})
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              📖 Filter by Subject:
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="form-input"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}
            >
              <option value="all">All Subjects ({subjectsList.length})</option>
              {subjectsList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              📌 Status:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-input"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}
            >
              <option value="all">All Statuses</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
              🔍 Search Exam or Teacher:
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, teacher..."
              className="form-input"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13 }}
            />
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div
        className="card"
        style={{
          borderRadius: 14,
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border-light, #e2e8f0)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-light, #e2e8f0)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            All Teacher Exams ({filteredExams.length})
          </h2>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Click &quot;View Exam&quot; to inspect questions, options, and grading key
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
            <p style={{ fontWeight: 600 }}>Loading exams list...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📝</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              No exams found
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              No exams match your selected class, subject, or search filters.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-2, #f8fafc)', borderBottom: '1px solid var(--border-light, #e2e8f0)' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Exam Title</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Type</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Course & Class</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Created By (Teacher)</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Marks & Questions</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam) => {
                  const qCount = exam.questions?.length || 0;
                  const className = exam.course?.class?.display_name || exam.course?.class?.name || `Class ${exam.course?.class?.grade_level || '-'}`;
                  const subjectName = exam.course?.subject?.name || '-';
                  const teacherName = exam.teacher?.full_name || 'Teacher';

                  return (
                    <tr
                      key={exam.id}
                      style={{
                        borderBottom: '1px solid var(--border-light, #f1f5f9)',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Title */}
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {exam.title}
                        </div>
                        {exam.duration_minutes && (
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                            ⏱️ {exam.duration_minutes} Minutes
                          </div>
                        )}
                      </td>

                      {/* Type */}
                      <td style={{ padding: '12px 18px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: '#f1f5f9',
                            color: '#475569',
                            fontWeight: 700,
                            fontSize: 11,
                            textTransform: 'uppercase'
                          }}
                        >
                          {exam.type || 'Quiz'}
                        </span>
                      </td>

                      {/* Course & Class */}
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 12 }}>
                            🏫 {className}
                          </span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
                            📖 {subjectName}
                          </span>
                        </div>
                      </td>

                      {/* Teacher */}
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              background: '#e0e7ff',
                              color: '#3730a3',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: 12
                            }}
                          >
                            {teacherName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {teacherName}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                              Teacher
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Marks & Questions */}
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {exam.total_marks} Marks
                        </div>
                        <div style={{ fontSize: 11, color: qCount > 0 ? '#4f46e5' : 'var(--text-tertiary)', fontWeight: 600 }}>
                          📋 {qCount} Questions
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 18px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 14,
                            fontWeight: 800,
                            fontSize: 11,
                            background: exam.is_published ? '#ecfdf5' : '#fffbeb',
                            color: exam.is_published ? '#059669' : '#d97706',
                            border: `1px solid ${exam.is_published ? '#a7f3d0' : '#fde68a'}`
                          }}
                        >
                          {exam.is_published ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setViewingExam(exam)}
                          className="btn btn-secondary btn-sm"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 12px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: '#eef2ff',
                            color: '#4f46e5',
                            border: '1px solid #c7d2fe'
                          }}
                        >
                          👁️ View Exam & Questions
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Exam Questions & Paper Modal ── */}
      {viewingExam && (
        <div
          className="modal-overlay"
          onClick={() => setViewingExam(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16
          }}
        >
          <div
            className="modal-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-card, #1e293b)',
              borderRadius: 16,
              width: '100%',
              maxWidth: 850,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              border: '1px solid var(--border-light, #334155)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-light, #334155)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 16,
                background: 'var(--bg-surface-2, #0f172a)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    📄 {viewingExam.title}
                  </h2>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: viewingExam.is_published ? '#ecfdf5' : '#fffbeb',
                      color: viewingExam.is_published ? '#059669' : '#d97706',
                      fontWeight: 800,
                      fontSize: 11,
                      border: `1px solid ${viewingExam.is_published ? '#a7f3d0' : '#fde68a'}`
                    }}
                  >
                    {viewingExam.is_published ? 'PUBLISHED' : 'DRAFT'}
                  </span>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: 'var(--bg-card, #1e293b)',
                      color: 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: 11,
                      textTransform: 'uppercase',
                      border: '1px solid var(--border-light, #334155)'
                    }}
                  >
                    {viewingExam.type || 'Quiz'}
                  </span>
                </div>

                {/* Exam Meta Specs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span>🏫 <strong>Class:</strong> {viewingExam.course?.class?.display_name || viewingExam.course?.class?.name || `Class ${viewingExam.course?.class?.grade_level || '-'}`}</span>
                  <span>•</span>
                  <span>📖 <strong>Subject:</strong> {viewingExam.course?.subject?.name || '-'}</span>
                  <span>•</span>
                  <span>👨‍🏫 <strong>Teacher:</strong> {viewingExam.teacher?.full_name || '-'}</span>
                  <span>•</span>
                  <span>🎯 <strong>Total Marks:</strong> {viewingExam.total_marks}</span>
                  {viewingExam.duration_minutes && (
                    <>
                      <span>•</span>
                      <span>⏱️ <strong>Duration:</strong> {viewingExam.duration_minutes} Mins</span>
                    </>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingExam(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 20,
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: 4,
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Description & Questions List */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Description / Instructions */}
              {viewingExam.description && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    background: 'var(--bg-surface-2, #0f172a)',
                    border: '1px solid var(--border-light, #334155)',
                    fontSize: 13,
                    color: 'var(--text-secondary)'
                  }}
                >
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>
                    📌 Exam Instructions / Description:
                  </strong>
                  {viewingExam.description}
                </div>
              )}

              {/* Questions Section */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    Questions & Answer Keys ({viewingExam.questions?.length || 0})
                  </h3>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Total marks: {viewingExam.total_marks}
                  </span>
                </div>

                {!viewingExam.questions || viewingExam.questions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 16px', background: 'var(--bg-surface-2, #0f172a)', borderRadius: 12, border: '1px dashed var(--border-light, #334155)' }}>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 13, fontWeight: 600 }}>
                      ⚠️ No individual questions have been added to this exam yet.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {viewingExam.questions.map((q, idx) => {
                      const options = parseOptions(q.options);
                      const isMcq = q.question_type === 'mcq' || q.question_type === 'true_false';

                      return (
                        <div
                          key={q.id || idx}
                          style={{
                            padding: '16px',
                            borderRadius: 12,
                            background: 'var(--bg-surface-2, #0f172a)',
                            border: '1px solid var(--border-light, #334155)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10
                          }}
                        >
                          {/* Question Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: 6,
                                  background: '#e0e7ff',
                                  color: '#3730a3',
                                  fontWeight: 800,
                                  fontSize: 11
                                }}
                              >
                                Q{idx + 1}
                              </span>
                              <span
                                style={{
                                  fontSize: 11,
                                  textTransform: 'uppercase',
                                  fontWeight: 700,
                                  color: 'var(--text-tertiary)'
                                }}
                              >
                                {q.question_type || 'Question'}
                              </span>
                            </div>

                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: 6,
                                background: '#fef3c7',
                                color: '#b45309',
                                fontWeight: 800,
                                fontSize: 11
                              }}
                            >
                              {q.marks || 1} Marks
                            </span>
                          </div>

                          {/* Question Text */}
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                            {q.question_text}
                          </div>

                          {/* MCQ / True-False Options */}
                          {isMcq && options.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, marginTop: 4 }}>
                              {options.map((opt, optIdx) => {
                                const isCorrect = String(opt).trim() === String(q.correct_answer || '').trim();
                                return (
                                  <div
                                    key={optIdx}
                                    style={{
                                      padding: '8px 12px',
                                      borderRadius: 8,
                                      background: isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card, #1e293b)',
                                      border: `1px solid ${isCorrect ? '#10b981' : 'var(--border-light, #334155)'}`,
                                      fontSize: 13,
                                      fontWeight: isCorrect ? 700 : 500,
                                      color: isCorrect ? '#10b981' : 'var(--text-primary)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 8
                                    }}
                                  >
                                    <span
                                      style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: '50%',
                                        background: isCorrect ? '#10b981' : 'var(--border-light, #334155)',
                                        color: isCorrect ? '#ffffff' : 'var(--text-secondary)',
                                        fontSize: 11,
                                        fontWeight: 800,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                      }}
                                    >
                                      {String.fromCharCode(65 + optIdx)}
                                    </span>
                                    <span style={{ flex: 1 }}>{opt}</span>
                                    {isCorrect && (
                                      <span style={{ fontSize: 11, color: '#10b981', fontWeight: 800 }}>
                                        ✓ Correct
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Correct Answer for non-options or text key */}
                          {(!isMcq || options.length === 0) && q.correct_answer && (
                            <div
                              style={{
                                padding: '8px 12px',
                                borderRadius: 8,
                                background: 'rgba(16, 185, 129, 0.15)',
                                border: '1px solid #10b981',
                                fontSize: 12,
                                color: '#10b981',
                                marginTop: 4
                              }}
                            >
                              <strong>✅ Correct / Expected Answer Key:</strong> {q.correct_answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid var(--border-light, #334155)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                background: 'var(--bg-surface-2, #0f172a)'
              }}
            >
              <button
                type="button"
                onClick={() => setViewingExam(null)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '8px 18px', borderRadius: 8, fontWeight: 700 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

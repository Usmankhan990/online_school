import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function CurriculumRoadmap() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('all');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/student/courses-detail');
        setCourses(res.data.courses || []);
      } catch (err) {
        console.error('Failed to load curriculum roadmap:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = selectedCourse === 'all'
    ? courses
    : courses.filter(c => String(c.id) === String(selectedCourse));

  const roadmapMilestones = [
    { phase: 'Term 1', title: 'Foundational Concepts', desc: 'Core PCTB chapters, definitions, and baseline competencies.', color: '#3b82f6', bg: '#eff6ff', icon: '🌱' },
    { phase: 'Term 2', title: 'Deepening & Application', desc: 'Practical exercises, module problem-solving, and mid-term assessments.', color: '#10b981', bg: '#ecfdf5', icon: '📈' },
    { phase: 'Term 3', title: 'Mastery & Board Exam Prep', desc: 'Comprehensive revision, past paper reviews, and annual board exam preparation.', color: '#f59e0b', bg: '#fffbeb', icon: '🏆' },
  ];

  if (loading) {
    return (
      <div className="animate-fade-in flex flex-col gap-5 min-w-0">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 140, borderRadius: 16 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col gap-8 min-w-0">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>📖</span> Curriculum Roadmap — PTB 2026
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6, maxWidth: 650 }}>
            Official Punjab Curriculum & Textbook Board (PCTB 2026) academic syllabus roadmap, term progression, learning competencies, and module milestones.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/student/books" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>📚</span> Digital Textbooks
          </Link>
          <Link to="/student/courses" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🎯</span> My Courses
          </Link>
        </div>
      </div>

      {/* 3-Phase Academic Roadmap Progression */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {roadmapMilestones.map((m, idx) => (
          <div key={idx} className="card" style={{ padding: '20px 24px', borderLeft: `4px solid ${m.color}`, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: m.color, background: m.bg, padding: '3px 10px', borderRadius: 99 }}>
                {m.phase}
              </span>
              <span style={{ fontSize: 24 }}>{m.icon}</span>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{m.title}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Filter by Subject */}
      {courses.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>Filter Subject:</span>
          <button
            onClick={() => setSelectedCourse('all')}
            className={`btn btn-sm ${selectedCourse === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All Subjects ({courses.length})
          </button>
          {courses.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCourse(c.id)}
              className={`btn btn-sm ${String(selectedCourse) === String(c.id) ? 'btn-primary' : 'btn-secondary'}`}
            >
              {c.subject?.name || c.title}
            </button>
          ))}
        </div>
      )}

      {/* Roadmap Content */}
      {filteredCourses.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🗺️</span>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Curriculum Roadmap Finalizing</h3>
          <p style={{ fontSize: 14 }}>The academic syllabus roadmap for your class will appear here once published by the administration.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {filteredCourses.map(course => (
            <div key={course.id} className="card" style={{ padding: 24, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <span className="badge badge-accent" style={{ fontSize: 11 }}>{course.class?.display_name || 'Class'}</span>
                    <span className="badge badge-neutral" style={{ fontSize: 11 }}>{course.subject?.name || 'Subject'}</span>
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{course.title}</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Instructor: <strong>{course.teacher?.full_name || 'Assigned Faculty'}</strong>
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-primary-600)' }}>
                    {course.modules?.length || 0}
                  </span>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Modules Scheduled</div>
                </div>
              </div>

              {/* Modules Roadmap */}
              {(!course.modules || course.modules.length === 0) ? (
                <div style={{ padding: 24, background: 'var(--bg-surface-2)', borderRadius: 10, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
                  Module roadmap breakdown will be updated shortly for this subject.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {course.modules.map((mod, mIdx) => (
                    <div
                      key={mod.id || mIdx}
                      style={{
                        padding: '16px 20px',
                        borderRadius: 10,
                        border: '1px solid var(--border-light)',
                        background: 'var(--bg-surface-2)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: 'var(--color-primary-100, #dcfce7)',
                            color: 'var(--color-primary-700, #15803d)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 14,
                          }}
                        >
                          {mIdx + 1}
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {mod.title}
                          </div>
                          {mod.description && (
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                              {mod.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)' }}>
                          {mod.lessons?.length || 0} Lessons
                        </span>
                        <Link to="/student/courses" className="btn btn-outline btn-sm">
                          Study Module →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

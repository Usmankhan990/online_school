import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try { const r = await api.get('/student/courses-detail'); setCourses(r.data.courses || []); }
      catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchCourses();
  }, []);

  const typeIcons = { video: '🎥', reading: '📄', interactive: '🎮', quiz: '📝', pdf: '📄', notes: '📝' };
  const FILE_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  if (loading) return <div className="animate-fade-in" className="flex flex-col gap-5 min-w-0">{[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 18 }} />)}</div>;

  return (
    <div className="animate-fade-in" className="flex flex-col gap-8 min-w-0">
      <div>
        <h1 className="text-gradient" style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em' }}>📚 Interactive Tuition Learning</h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 6, maxWidth: 600 }}>
          Your courses are structured into modules following the Punjab Textbook Board (PCTB) 2026 syllabus guidelines.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="card-glass" style={{ padding: 64, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <span style={{ fontSize: 64, display: 'block', marginBottom: 20 }}>📚</span>
          <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>No Courses Enrolled</p>
          <p style={{ fontSize: 14, marginTop: 8 }}>Your academic curriculum will appear here once finalized by the administration.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8 min-w-0">
          {courses.map(c => (
            <div key={c.id} className="card-glass shadow-glow overflow-hidden" style={{ border: '1px solid var(--border-light)' }}>
              {/* Course Header */}
              <div className="premium-gradient" style={{ padding: '32px 40px', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                      <span className="badge badge-accent shadow-sm" style={{ padding: '6px 14px', fontSize: 11, fontWeight: 800 }}>{c.class?.display_name?.toUpperCase()}</span>
                      <span className="badge badge-neutral bg-glass" style={{ padding: '6px 14px', fontSize: 11, fontWeight: 800 }}>{c.subject?.name?.toUpperCase()}</span>
                    </div>
                    <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, letterSpacing: '-0.02em' }}>{c.title}</h2>
                    <p style={{ opacity: 0.8, fontSize: 14, fontWeight: 500 }}>Lead Instructor: <span style={{ fontWeight: 800 }}>{c.teacher?.full_name}</span></p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 900 }}>{c.modules?.length || 0}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase' }}>Modules</div>
                  </div>
                </div>
              </div>

              {/* Course Content - Modules */}
              <div style={{ padding: '24px 40px' }}>
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    📖 Curriculum Roadmap
                    {c.is_locked && <span className="badge badge-error" style={{ fontSize: 11 }}>PAYMENT REQUIRED</span>}
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {c.modules?.length === 0 ? (
                    <div className="card" style={{ padding: 32, textAlign: 'center', background: 'var(--bg-surface-2)', border: '1px dashed var(--border-medium)' }}>
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Module breakdown pending. Check back soon!</p>
                    </div>
                  ) : (
                    c.modules.map((m, idx) => (
                      <div key={m.id} className="card hover-lift" style={{ border: '1px solid var(--border-light)', overflow: 'hidden' }}>
                        <div 
                          onClick={() => setExpandedModule(expandedModule === m.id ? null : m.id)}
                          style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: expandedModule === m.id ? 'var(--bg-surface-2)' : 'white' }}
                        >
                          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                              {idx + 1}
                            </div>
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{m.title}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{m.lessons?.length || 0} Targeted Lessons</div>
                            </div>
                          </div>
                          <span style={{ transition: 'transform 0.3s', transform: expandedModule === m.id ? 'rotate(180deg)' : 'none' }}>▼</span>
                        </div>

                        {expandedModule === m.id && (
                          <div style={{ padding: '8px 24px 24px 72px', borderTop: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                              {m.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontStyle: 'italic' }}>{m.description}</p>}
                              {m.lessons?.map((lesson) => (
                                <div key={lesson.id} className="card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-light)', background: 'white' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span style={{ fontSize: 18 }}>{typeIcons[lesson.lesson_type] || '📖'}</span>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{lesson.title}</span>
                                  </div>
                                  <Link to={`/student/lectures?id=${lesson.id}`} className="btn btn-primary btn-sm hover-lift">Start Learning</Link>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Course Footer - Static Materials */}
              {c.materials?.length > 0 && (
                <div style={{ padding: '20px 40px', background: 'var(--bg-surface-2)', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reference Materials:</span>
                  <div style={{ display: 'flex', gap: 16 }}>
                    {c.materials.map(mat => (
                      <a key={mat.id} href={mat.file_path ? `${FILE_BASE}/uploads/${mat.file_path}` : mat.external_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--color-primary-600)' }}>
                        📄 {mat.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

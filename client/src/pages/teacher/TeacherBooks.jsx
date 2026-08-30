import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const subjectColors = {
  ENG: { bg: '#2563eb', icon: '🇬🇧' },
  URD: { bg: '#059669', icon: '📖' },
  MATH:{ bg: '#d97706', icon: '📐' },
  SCI: { bg: '#7c3aed', icon: '🔬' },
  SST: { bg: '#e11d48', icon: '🌍' },
  ISL: { bg: '#0d9488', icon: '☪️' },
  CS:  { bg: '#0891b2', icon: '💻' },
  GK:  { bg: '#db2777', icon: '📔' },
  TQ:  { bg: '#4f46e5', icon: '📓' },
  AKH: { bg: '#65a30d', icon: '📒' },
  NQ:  { bg: '#ea580c', icon: '📕' },
  HIST:{ bg: '#ca8a04', icon: '📜' },
  GEO: { bg: '#0284c7', icon: '🗺️' },
  ARB: { bg: '#c026d3', icon: '🕌' },
};

function getSubjectStyle(code) {
  return subjectColors[code] || { bg: '#64748b', icon: '📚' };
}

export default function StudentBooks() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    Promise.all([
      api.get('/books'),
      api.get('/books/classes'),
      api.get('/books/subjects'),
    ]).then(([booksRes, classesRes, subjectsRes]) => {
      setBooks(booksRes.data.books || booksRes.data);
      setClasses(classesRes.data.classes || classesRes.data || []);
      setSubjects(subjectsRes.data.subjects || subjectsRes.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = books.filter(b => {
    const matchClass = selectedClass === 'all' || b.class_id === parseInt(selectedClass);
    const matchSubject = selectedSubject === 'all' || b.subject_id === parseInt(selectedSubject);
    const matchSearch = !searchTerm || b.title?.toLowerCase().includes(searchTerm.toLowerCase())
      || b.title_urdu?.includes(searchTerm)
      || b.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchClass && matchSubject && matchSearch;
  });

  // Group by class
  const groupedByClass = {};
  filtered.forEach(book => {
    const className = book.class?.display_name || `Class ${book.class_id}`;
    if (!groupedByClass[className]) groupedByClass[className] = [];
    groupedByClass[className].push(book);
  });

  // Navigate to internal viewer instead of external redirect
  const openBook = (bookId) => {
    navigate(`/teacher/books/${bookId}`);
  };

  // Recently added (last 5)
  const recentBooks = [...books]
    .sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0))
    .slice(0, 5);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid var(--border-light)', borderTopColor: '#1e3a5f', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>Loading PCTB 2026 Books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" className="flex flex-col gap-5 min-w-0">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>📚 PCTB Digital Library</h1>
          <p>Punjab Curriculum & Textbook Board — Edition 2026 • {books.length} Books Available</p>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setViewMode('grid')} className={`btn btn-icon ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: 8 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </button>
          <button onClick={() => setViewMode('list')} className={`btn btn-icon ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: 8 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search books by name, subject..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="form-input" style={{ paddingLeft: 40 }} />
          </div>
          {/* Class Filter */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button onClick={() => setSelectedClass('all')}
              className={`btn btn-sm ${selectedClass === 'all' ? 'btn-primary' : 'btn-secondary'}`}>
              All Classes
            </button>
            {classes.map(c => (
              <button key={c.id} onClick={() => setSelectedClass(String(c.id))}
                className={`btn btn-sm ${selectedClass === String(c.id) ? 'btn-primary' : 'btn-secondary'}`}>
                {c.display_name}
              </button>
            ))}
          </div>
          {/* Subject Filter */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button onClick={() => setSelectedSubject('all')}
              className={`btn btn-sm ${selectedSubject === 'all' ? 'btn-accent' : 'btn-secondary'}`}>
              All Subjects
            </button>
            {subjects.map(s => (
              <button key={s.id} onClick={() => setSelectedSubject(String(s.id))}
                className={`btn btn-sm ${selectedSubject === String(s.id) ? 'btn-accent' : 'btn-secondary'}`}>
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
        <div className="card" style={{ padding: 14, textAlign: 'center' }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: '#1e3a5f' }}>{books.length}</p>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Total Books</p>
        </div>
        <div className="card" style={{ padding: 14, textAlign: 'center' }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{classes.length}</p>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Classes</p>
        </div>
        <div className="card" style={{ padding: 14, textAlign: 'center' }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>{new Set(books.map(b => b.subject_id)).size}</p>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Subjects</p>
        </div>
        <div className="card" style={{ padding: 14, textAlign: 'center' }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{books.filter(b => b.local_file && b.local_file.trim()).length}</p>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Local PDFs</p>
        </div>
      </div>

      {/* Recently Added */}
      {selectedClass === 'all' && selectedSubject === 'all' && !searchTerm && recentBooks.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>🆕</span>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Recently Added</h3>
          </div>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
            {recentBooks.map(book => {
              const style = getSubjectStyle(book.subject?.code);
              return (
                <div key={book.id} onClick={() => openBook(book.id)}
                  className="card" style={{ minWidth: 200, maxWidth: 220, cursor: 'pointer', flexShrink: 0 }}>
                  <div style={{ height: 80, background: style.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px 14px 0 0' }}>
                    <span style={{ fontSize: 32 }}>{style.icon}</span>
                  </div>
                  <div style={{ padding: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{book.class?.display_name} • {book.subject?.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Books Display */}
      {Object.keys(groupedByClass).length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>📭</p>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No Books Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Try adjusting your search or class filter.</p>
        </div>
      ) : (
        Object.entries(groupedByClass).map(([className, classBooks]) => (
          <div key={className} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Class Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ height: 1, flex: 1, background: 'linear-gradient(to right, #1e3a5f33, transparent)' }} />
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', padding: '6px 16px', borderRadius: 999, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}>
                📖 {className}
              </h2>
              <div style={{ height: 1, flex: 1, background: 'linear-gradient(to left, #1e3a5f33, transparent)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{classBooks.length} books</span>
            </div>

            {viewMode === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 16 }}>
                {classBooks.map(book => {
                  const style = getSubjectStyle(book.subject?.code);
                  const hasLocal = book.local_file && book.local_file.trim() !== '';
                  return (
                    <div key={book.id}
                      onClick={() => openBook(book.id)}
                      className="card"
                      style={{ cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s ease' }}
                      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                      onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
                      {/* Cover */}
                      <div style={{
                        height: 140, background: style.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative'
                      }}>
                        <span style={{ fontSize: 52 }}>{style.icon}</span>
                        <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', borderRadius: 999, padding: '2px 8px', fontSize: 10, color: 'white' }}>
                          PCTB 2026
                        </div>
                        {/* Source badge */}
                        <div style={{ position: 'absolute', top: 8, left: 8 }}>
                          {hasLocal ? (
                            <span style={{ background: 'rgba(16,185,129,0.9)', color: 'white', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999 }}>📁 Local PDF</span>
                          ) : (
                            <span style={{ background: 'rgba(245,158,11,0.9)', color: 'white', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999 }}>🌐 External</span>
                          )}
                        </div>
                      </div>
                      {/* Info */}
                      <div style={{ padding: 14 }}>
                        <div style={{ marginBottom: 6 }}>
                          <span className="badge badge-info" style={{ fontSize: 10 }}>
                            {book.subject?.name || 'Subject'}
                          </span>
                        </div>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {book.title}
                        </h3>
                        {book.title_urdu && (
                          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }} dir="rtl">{book.title_urdu}</p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-light)' }}>
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{book.publisher}</span>
                          <span style={{ fontSize: 12, color: '#1e3a5f', fontWeight: 600 }}>View Book →</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {classBooks.map(book => {
                  const style = getSubjectStyle(book.subject?.code);
                  const hasLocal = book.local_file && book.local_file.trim() !== '';
                  return (
                    <div key={book.id}
                      onClick={() => openBook(book.id)}
                      className="card"
                      style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 10,
                        background: style.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, flexShrink: 0
                      }}>
                        {style.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {book.title}
                        </h3>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{book.subject?.name}</span>
                          <span style={{ color: 'var(--border-medium)' }}>•</span>
                          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{book.publisher}</span>
                        </div>
                      </div>
                      {hasLocal ? (
                        <span className="badge badge-success" style={{ fontSize: 10, flexShrink: 0 }}>📁 Local</span>
                      ) : (
                        <span className="badge badge-warning" style={{ fontSize: 10, flexShrink: 0 }}>🌐 External</span>
                      )}
                      <span className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>View Book →</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))
      )}

      {/* Source Credit */}
      <div className="card" style={{ padding: 14, textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          📖 Textbooks courtesy of <a href="https://pctb.punjab.gov.pk" target="_blank" rel="noopener" style={{ color: '#1e3a5f', fontWeight: 500 }}>PCTB Punjab</a>
          {' '}&amp; <a href="https://www.ustad360.com" target="_blank" rel="noopener" style={{ color: '#1e3a5f', fontWeight: 500 }}>Ustad360.com</a>
          {' '}• Free for educational use • Edition 2026
        </p>
      </div>
    </div>
  );
}

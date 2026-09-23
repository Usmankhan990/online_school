import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [studentClass, setStudentClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    api.get('/student/books')
      .then(res => {
        const bookList = res.data.books || [];
        setBooks(bookList);
        setStudentClass(res.data.studentClass || user?.studentProfile?.class || null);
      })
      .catch(err => {
        console.error('Failed to load student books:', err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Derive unique subjects present in the student's own books
  const availableSubjects = useMemo(() => {
    const map = new Map();
    books.forEach(b => {
      if (b.subject && !map.has(b.subject.id)) {
        map.set(b.subject.id, b.subject);
      }
    });
    return Array.from(map.values());
  }, [books]);

  // Filter books strictly by subject & search query within their own class
  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      const matchSubject = selectedSubject === 'all' || b.subject_id === parseInt(selectedSubject);
      const matchSearch = !searchTerm ||
        b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.title_urdu?.includes(searchTerm) ||
        b.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSubject && matchSearch;
    });
  }, [books, selectedSubject, searchTerm]);

  const openBook = (bookId) => {
    navigate(`/student/books/${bookId}`);
  };

  const classNameDisplay = studentClass?.display_name || user?.studentProfile?.class?.display_name || 'My Class';

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48,
            height: 48,
            border: '3px solid var(--border-light)',
            borderTopColor: '#FFCC4D',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>Loading Your Textbooks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col gap-5 min-w-0">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              📚 My Textbooks
            </h1>
            <span style={{
              background: '#1C1917',
              color: '#ffffff',
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.03em'
            }}>
              {classNameDisplay}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            Official Punjab Curriculum &amp; Textbook Board (PCTB 2026) • {books.length} Books for your class
          </p>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setViewMode('grid')}
            className={`btn btn-icon ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: 8 }}
            title="Grid View"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`btn btn-icon ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: 8 }}
            title="List View"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
        <div className="card" style={{ padding: 14, textAlign: 'center' }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: '#1e3a5f' }}>{books.length}</p>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Books for {classNameDisplay}</p>
        </div>
        <div className="card" style={{ padding: 14, textAlign: 'center' }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{availableSubjects.length}</p>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Subjects</p>
        </div>
        <div className="card" style={{ padding: 14, textAlign: 'center' }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b' }}>
            {books.filter(b => b.local_file && b.local_file.trim()).length}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Local PDFs</p>
        </div>
        <div className="card" style={{ padding: 14, textAlign: 'center' }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: '#6366f1' }}>2026</p>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>PCTB Edition</p>
        </div>
      </div>

      {/* Search & Subject Filters */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <svg
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
              width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={`Search ${classNameDisplay} books by name or subject...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 40 }}
            />
          </div>

          {/* Subject Filter Pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedSubject('all')}
              className={`btn btn-sm ${selectedSubject === 'all' ? 'btn-accent' : 'btn-secondary'}`}
            >
              All Subjects ({books.length})
            </button>
            {availableSubjects.map(s => {
              const count = books.filter(b => b.subject_id === s.id).length;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubject(String(s.id))}
                  className={`btn btn-sm ${selectedSubject === String(s.id) ? 'btn-accent' : 'btn-secondary'}`}
                >
                  {s.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Books List / Grid */}
      {filteredBooks.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>📭</p>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            No Books Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {searchTerm ? 'Try adjusting your search terms.' : 'No textbooks are currently available for this selection.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {filteredBooks.map(book => {
            const style = getSubjectStyle(book.subject?.code);
            const hasLocal = book.local_file && book.local_file.trim() !== '';

            return (
              <div
                key={book.id}
                onClick={() => openBook(book.id)}
                className="card"
                style={{ cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column' }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                {/* Cover Header */}
                <div style={{
                  height: 140,
                  background: style.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <span style={{ fontSize: 52 }}>{style.icon}</span>
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'rgba(0,0,0,0.35)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: 999,
                    padding: '2px 8px',
                    fontSize: 10,
                    color: 'white',
                    fontWeight: 600
                  }}>
                    PCTB 2026
                  </div>
                  <div style={{ position: 'absolute', top: 8, left: 8 }}>
                    {hasLocal ? (
                      <span style={{ background: 'rgba(16,185,129,0.9)', color: 'white', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999 }}>
                        📁 Local PDF
                      </span>
                    ) : (
                      <span style={{ background: 'rgba(245,158,11,0.9)', color: 'white', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999 }}>
                        🌐 Online
                      </span>
                    )}
                  </div>
                </div>

                {/* Book Details */}
                <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ marginBottom: 6 }}>
                      <span className="badge badge-info" style={{ fontSize: 10 }}>
                        {book.subject?.name || 'Subject'}
                      </span>
                    </div>
                    <h3 style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: 4,
                      lineHeight: 1.35,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {book.title}
                    </h3>
                    {book.title_urdu && (
                      <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6 }} dir="rtl">
                        {book.title_urdu}
                      </p>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: '1px solid var(--border-light)'
                  }}>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{book.publisher || 'PCTB Punjab'}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 700 }}>Read Book →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredBooks.map(book => {
            const style = getSubjectStyle(book.subject?.code);
            const hasLocal = book.local_file && book.local_file.trim() !== '';

            return (
              <div
                key={book.id}
                onClick={() => openBook(book.id)}
                className="card"
                style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                onMouseOver={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseOut={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
              >
                <div style={{
                  width: 46,
                  height: 46,
                  borderRadius: 10,
                  background: style.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0
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
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{book.publisher || 'PCTB Punjab'}</span>
                  </div>
                </div>
                {hasLocal ? (
                  <span className="badge badge-success" style={{ fontSize: 10, flexShrink: 0 }}>📁 Local</span>
                ) : (
                  <span className="badge badge-warning" style={{ fontSize: 10, flexShrink: 0 }}>🌐 Online</span>
                )}
                <span className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>Read Book →</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Source Attribution */}
      <div className="card" style={{ padding: 14, textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          📖 Textbooks courtesy of{' '}
          <a href="https://pctb.punjab.gov.pk" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            PCTB Punjab
          </a>
          {' '}&amp;{' '}
          <a href="https://www.ustad360.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            Ustad360.com
          </a>
          {' '}• Free for educational use • Edition 2026
        </p>
      </div>
    </div>
  );
}

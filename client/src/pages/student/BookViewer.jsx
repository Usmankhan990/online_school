import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatSize = (bytes) => {
  if (!bytes) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function BookViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPdf, setShowPdf] = useState(false);

  useEffect(() => {
    api.get(`/books/${id}`)
      .then(r => setBook(r.data.book))
      .catch(err => {
        console.error(err);
        setError('Book not found or failed to load.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const hasLocalFile = book?.local_file && book.local_file.trim() !== '';
  const hasExternalUrl = book?.pdf_url && book.pdf_url.trim() !== '';
  const viewUrl = hasLocalFile ? book.local_file : null;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid var(--border-light)', borderTopColor: '#1e3a5f', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>Loading book...</p>
      </div>
    </div>
  );

  if (error || !book) return (
    <div className="animate-fade-in" style={{ textAlign: 'center', padding: 64 }}>
      <span style={{ fontSize: 56, display: 'block', marginBottom: 16 }}>Books</span>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Book Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{error || 'The requested book could not be found.'}</p>
      <button onClick={() => navigate(-1)} className="btn btn-primary">Back</button>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-tertiary)' }}>
        <Link to="/student/books" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>Library</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{book.title}</span>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
          <div style={{
            width: 240,
            minHeight: 280,
            background: `linear-gradient(135deg, ${book.subject?.color || '#1e3a5f'}, #0f172a)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: 24,
            flexShrink: 0,
            color: 'white',
          }}>
            <span style={{ fontSize: 54 }}>{book.subject?.icon || 'Book'}</span>
            <span style={{ background: 'rgba(16,185,129,0.18)', color: '#bbf7d0', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999 }}>
              PCTB 2026
            </span>
            {hasLocalFile && (
              <span style={{ background: 'rgba(59,130,246,0.18)', color: '#bfdbfe', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>
                Local PDF
              </span>
            )}
          </div>

          <div style={{ flex: 1, padding: 28, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 300 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{book.title}</h1>
              {book.title_urdu && <p style={{ color: 'var(--text-secondary)', fontSize: 16 }} dir="rtl">{book.title_urdu}</p>}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="badge badge-info">{book.class?.display_name || 'Class'}</span>
              <span className="badge badge-purple">{book.subject?.name || 'Subject'}</span>
              <span className="badge badge-neutral">{book.publisher || 'PCTB Punjab'}</span>
              <span className="badge badge-success">{book.year || 2026}</span>
              {book.medium && <span className="badge badge-warning">{book.medium}</span>}
            </div>

            {book.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{book.description}</p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
              {book.updatedAt && (
                <InfoBox label="Last Updated" value={formatDate(book.updatedAt)} />
              )}
              {book.file_size > 0 && (
                <InfoBox label="File Size" value={formatSize(book.file_size)} />
              )}
              {book.original_filename && (
                <InfoBox label="File Name" value={book.original_filename} />
              )}
            </div>

            <div style={{ background: 'var(--bg-surface-2)', borderRadius: 10, padding: 14, border: '1px solid var(--border-light)', fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Source:</span>
                {hasLocalFile ? (
                  <span style={{ color: '#10b981', fontWeight: 700 }}>Local PDF inside school app</span>
                ) : hasExternalUrl ? (
                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>Online source saved, local PDF pending</span>
                ) : (
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>No file available</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
              {viewUrl ? (
                <>
                  <button onClick={() => setShowPdf(true)} className="btn btn-primary btn-lg">
                    Read Book
                  </button>
                  <a href={viewUrl} download className="btn btn-accent" style={{ textDecoration: 'none' }}>
                    Download PDF
                  </a>
                </>
              ) : (
                <div className="alert alert-warning" style={{ width: '100%' }}>
                  <span>This book is listed, but its PDF is not uploaded locally yet. Please contact admin.</span>
                </div>
              )}

              <button onClick={() => navigate(-1)} className="btn btn-secondary">
                Back to Library
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPdf && viewUrl && (
        <div className="card animate-slide-up" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-surface-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Internal PDF Viewer</span>
              <span className="badge badge-success" style={{ fontSize: 10 }}>Local File</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <a href={viewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ fontSize: 12, textDecoration: 'none' }}>
                Open in New Tab
              </a>
              <button onClick={() => setShowPdf(false)} className="btn btn-ghost btn-sm" style={{ fontSize: 16, padding: '4px 8px' }}>x</button>
            </div>
          </div>
          <iframe
            src={viewUrl}
            style={{ width: '100%', height: '80vh', border: 'none', display: 'block' }}
            title={book.title}
          />
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--bg-surface-2)', border: '1px solid var(--border-light)' }}>
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import api, { FILE_BASE } from '../../services/api';

export default function StudentMaterials() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingUrl, setPlayingUrl] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try { const r = await api.get('/student/courses-detail'); setCourses(r.data.courses || []); }
      catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const allMaterials = courses.flatMap(c =>
    (c.materials || []).map(m => ({ ...m, courseName: c.title, subjectName: c.subject?.name, className: c.class?.display_name }))
  );

  const filtered = allMaterials.filter(m => filter === 'all' || m.type === filter);
  const typeIcons = { notes: '📝', pdf: '📄', video: '🎥', link: '🔗', assignment: '📋' };

  if (loading) return <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div><h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>📚 Study Materials</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Access notes, PDFs, recorded lectures, and more assigned by your teachers</p></div>
      
      {playingUrl && (
        <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
          <button onClick={() => setPlayingUrl(null)} style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: 99, width: 32, height: 32, cursor: 'pointer', fontWeight: 700 }}>✕</button>
          <video controls autoPlay style={{ width: '100%', maxHeight: 500 }} src={playingUrl}>
            Your browser does not support video playback.
          </video>
        </div>
      )}

      <div className="tabs" style={{ flexWrap: 'wrap' }}>
        {['all', 'notes', 'pdf', 'video', 'link', 'assignment'].map(f => (
          <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : typeIcons[f] + ' ' + f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📚</span>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No materials found</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Your teachers have not assigned anything here yet.</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(m => (
            <div key={m.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: m.type === 'video' ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'var(--bg-surface-2)', padding: m.type === 'video' ? 40 : 20, textAlign: 'center', cursor: m.type === 'video' ? 'pointer' : 'default', borderBottom: '1px solid var(--border-light)' }}
                onClick={() => {
                  if (m.type === 'video') {
                    if (m.file_path) setPlayingUrl(`${FILE_BASE}/uploads/${m.file_path}`);
                    else if (m.external_url) window.open(m.external_url, '_blank');
                  }
                }}>
                <span style={{ fontSize: m.type === 'video' ? 48 : 36, color: m.type === 'video' ? 'white' : 'var(--text-primary)' }}>
                  {m.type === 'video' ? '▶' : (typeIcons[m.type] || '📄')}
                </span>
              </div>
              <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{m.title}</h3>
                <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: 12, color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                  <span className="badge badge-purple">{m.subjectName}</span>
                  <span className="badge badge-neutral">{m.className}</span>
                  <span className="badge badge-info">{m.type}</span>
                </div>
                {m.content && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, flex: 1 }}>{m.content}</p>}
                
                {m.type !== 'video' && (
                  <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                    {m.file_path && <a href={`${FILE_BASE}/uploads/${m.file_path}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary flex-1 text-center" style={{ textDecoration: 'none' }}>📥 Download</a>}
                    {m.external_url && <a href={m.external_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary flex-1 text-center" style={{ textDecoration: 'none' }}>🔗 Open Link</a>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

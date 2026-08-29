import { useState, useEffect } from 'react';
import api from '../../services/api';
const FILE_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function StudentLectures() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingUrl, setPlayingUrl] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try { const r = await api.get('/student/courses-detail'); setCourses(r.data.courses || []); }
      catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetch();
  }, []);

  // Extract video-type materials
  const lectures = courses.flatMap(c =>
    (c.materials || []).filter(m => m.type === 'video').map(m => ({ ...m, courseName: c.title, subjectName: c.subject?.name, className: c.class?.display_name }))
  );

  if (loading) return <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div><h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>🎥 Recorded Lectures</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Watch recorded video lessons from your courses</p></div>
      
      {playingUrl && (
        <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
          <button onClick={() => setPlayingUrl(null)} style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: 99, width: 32, height: 32, cursor: 'pointer', fontWeight: 700 }}>✕</button>
          <video controls autoPlay style={{ width: '100%', maxHeight: 500 }} src={playingUrl}>
            Your browser does not support video playback.
          </video>
        </div>
      )}

      {lectures.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🎥</span>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No recorded lectures yet</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Your teachers will upload video lectures here.</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {lectures.map(l => (
            <div key={l.id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', padding: 40, textAlign: 'center', cursor: 'pointer' }}
                onClick={() => {
                  if (l.file_path) setPlayingUrl(`${FILE_BASE}/uploads/${l.file_path}`);
                  else if (l.external_url) window.open(l.external_url, '_blank');
                }}>
                <span style={{ fontSize: 48, color: 'white' }}>▶</span>
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{l.title}</h3>
                <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: 12, color: 'var(--text-tertiary)' }}>
                  <span className="badge badge-purple">{l.subjectName}</span>
                  <span className="badge badge-neutral">{l.className}</span>
                </div>
                {l.content && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>{l.content}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

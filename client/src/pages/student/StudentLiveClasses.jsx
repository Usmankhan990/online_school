import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function StudentLiveClasses() {
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [previewClass, setPreviewClass] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    api.get('/student/live-classes')
      .then(r => setLiveClasses(r.data.liveClasses || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const filtered = liveClasses.filter(lc => {
    if (filter === 'upcoming') return new Date(lc.scheduled_at) > now && lc.status === 'scheduled';
    if (filter === 'completed') return lc.status === 'completed';
    return true;
  });

  const getStatusStyle = (lc) => {
    const d = new Date(lc.scheduled_at);
    if (lc.status === 'live' || (d <= now && d.getTime() + lc.duration_minutes * 60000 > now.getTime())) {
      return { color: '#10b981', bg: '#ecfdf5', label: '🔴 LIVE NOW' };
    }
    if (lc.status === 'completed') return { color: '#6b7280', bg: '#f9fafb', label: '✅ Completed' };
    if (d > now) return { color: '#3b82f6', bg: '#eff6ff', label: '📅 Upcoming' };
    return { color: '#6b7280', bg: '#f9fafb', label: lc.status };
  };

  const handleCopyLink = (url, id) => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-5 min-w-0">
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>🎥 Live Classes</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          Join scheduled online classes and preview meeting links to attend from any device
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['all', 'upcoming', 'completed'].map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: `1px solid ${filter === f ? '#7c3aed' : 'var(--border-light)'}`,
              background: filter === f ? '#7c3aed15' : 'transparent',
              color: filter === f ? '#7c3aed' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🎥</span>
          <p style={{ fontSize: 16, fontWeight: 700 }}>No live classes found</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Check back later for scheduled classes</p>
        </div>
      ) : (
        filtered.map(lc => {
          const s = getStatusStyle(lc);
          const isCopied = copiedId === lc.id;
          return (
            <div key={lc.id} className="card" style={{ padding: 24, borderLeft: `4px solid ${s.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{lc.title}</h3>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 99, color: s.color, background: s.bg }}>
                      {s.label}
                    </span>
                  </div>
                  {lc.description && (
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
                      {lc.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                    <span>📚 <b>Subject:</b> {lc.course?.subject?.name || 'Subject'}</span>
                    <span>👨‍🏫 <b>Teacher:</b> {lc.course?.teacher?.full_name || 'Teacher'}</span>
                    <span>📅 <b>Date:</b> {new Date(lc.scheduled_at).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    <span>⏱ <b>Duration:</b> {lc.duration_minutes} min</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {/* Preview Details & Copy Link Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewClass(lc)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 10,
                      border: '1.5px solid var(--color-primary-600, #7c3aed)',
                      background: 'var(--color-primary-50, #f5f3ff)',
                      color: 'var(--color-primary-700, #6d28d9)',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                    title="Preview meeting details and link"
                  >
                    🔍 Preview Link
                  </button>

                  {lc.meeting_url && (
                    <button
                      type="button"
                      onClick={() => handleCopyLink(lc.meeting_url, lc.id)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1px solid var(--border-light)',
                        background: isCopied ? '#ecfdf5' : 'var(--bg-card)',
                        color: isCopied ? '#059669' : 'var(--text-secondary)',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                      title="Copy meeting link to clipboard"
                    >
                      {isCopied ? '✅ Copied!' : '📋 Copy Link'}
                    </button>
                  )}

                  {lc.meeting_url && (
                    <a
                      href={lc.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '10px 22px',
                        borderRadius: 10,
                        background: s.label.includes('LIVE') ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        color: 'white',
                        textDecoration: 'none',
                        fontSize: 14,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
                      }}
                    >
                      {s.label.includes('LIVE') ? '🔴 Join Now' : '🔗 Open Link'}
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Meeting Details & Link Preview Modal */}
      {previewClass && (
        <div
          onClick={() => setPreviewClass(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="card animate-fade-in"
            style={{
              maxWidth: 540,
              width: '100%',
              padding: 26,
              borderRadius: 18,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>🎥</span>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {previewClass.title}
                  </h3>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    Live Online Class Details
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewClass(null)}
                style={{
                  border: 'none',
                  background: 'var(--bg-secondary)',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  fontSize: 16,
                  cursor: 'pointer',
                  fontWeight: 700,
                  color: 'var(--text-primary)'
                }}
              >
                ✕
              </button>
            </div>

            {/* Class Info Box */}
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 16, marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>📚 <b>Subject:</b></span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {previewClass.course?.subject?.name || 'Subject'} ({previewClass.course?.class?.display_name || 'Class'})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>👨‍🏫 <b>Teacher:</b></span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {previewClass.course?.teacher?.full_name || 'Teacher'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>📅 <b>Scheduled Time:</b></span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {new Date(previewClass.scheduled_at).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>⏱ <b>Duration:</b></span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {previewClass.duration_minutes} minutes
                </span>
              </div>
            </div>

            {previewClass.description && (
              <div style={{ marginBottom: 18 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  📝 Topics / Description:
                </span>
                <p style={{ fontSize: 13, color: 'var(--text-primary)', background: 'var(--bg-card)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-light)', margin: 0, lineHeight: 1.5 }}>
                  {previewClass.description}
                </p>
              </div>
            )}

            {/* Meeting Link Section */}
            {previewClass.meeting_url ? (
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  🔗 Direct Meeting Link (Zoom / Google Meet):
                </label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  <input
                    type="text"
                    readOnly
                    value={previewClass.meeting_url}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: 13,
                      fontFamily: 'monospace'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyLink(previewClass.meeting_url, 'modal')}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 8,
                      border: 'none',
                      background: copiedId === 'modal' ? '#10b981' : 'var(--color-primary-600, #7c3aed)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {copiedId === 'modal' ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <a
                    href={previewClass.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      padding: '12px 20px',
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: 14,
                      fontWeight: 700,
                      textAlign: 'center',
                      display: 'block'
                    }}
                  >
                    🚀 Open Meeting in New Tab
                  </a>
                  <button
                    type="button"
                    onClick={() => setPreviewClass(null)}
                    style={{
                      padding: '12px 20px',
                      borderRadius: 10,
                      border: '1px solid var(--border-light)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>

                <p style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 12, textAlign: 'center' }}>
                  💡 Tip: You can copy this link and open it in Google Meet or Zoom app on mobile, tablet, or laptop.
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 16, color: 'var(--text-tertiary)' }}>
                <p style={{ margin: 0, fontSize: 13 }}>Meeting link will be provided by your teacher before class starts.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

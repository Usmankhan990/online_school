import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ParentHomework() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hwLoading, setHwLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const r = await api.get('/parent/dashboard');
        setChildren(r.data.children || []);
        if (r.data.children?.length > 0) {
          setSelectedChild(r.data.children[0].profile.user_id);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!selectedChild) return;
    const fetch = async () => {
      setHwLoading(true);
      try {
        const r = await api.get(`/parent/child-homework?student_id=${selectedChild}`);
        setHomework(r.data.homework || []);
      } catch (err) { console.error(err); } finally { setHwLoading(false); }
    };
    fetch();
  }, [selectedChild]);

  const getStatus = (hw) => {
    const sub = hw.submissions?.[0];
    if (sub?.status === 'graded') return { label: 'Graded', color: '#10b981', icon: '✅' };
    if (sub) return { label: 'Submitted', color: '#3b82f6', icon: '📤' };
    if (new Date(hw.due_date) < new Date()) return { label: 'Overdue', color: '#ef4444', icon: '⏰' };
    return { label: 'Pending', color: '#f59e0b', icon: '📋' };
  };

  if (loading) return <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />)}</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div><h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>📝 Child Homework</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Track your child's homework progress</p></div>
        {children.length > 1 && (
          <select className="form-select" style={{ width: 'auto' }} value={selectedChild} onChange={e => setSelectedChild(e.target.value)}>
            {children.map(c => <option key={c.profile.user_id} value={c.profile.user_id}>{c.profile.user?.full_name}</option>)}
          </select>
        )}
      </div>
      {hwLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />)}</div>
      ) : homework.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📝</span>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No homework assigned yet</p></div>
      ) : homework.map(hw => {
        const status = getStatus(hw);
        const sub = hw.submissions?.[0];
        return (
          <div key={hw.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{hw.title}</h3>
                  <span className="badge" style={{ background: `${status.color}15`, color: status.color }}>{status.icon} {status.label}</span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
                  <span>📚 {hw.course?.subject?.name}</span>
                  <span>📅 Due: {new Date(hw.due_date).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  <span>📊 {hw.total_marks} marks</span>
                </div>
              </div>
              {sub?.status === 'graded' && (
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{sub.marks_obtained}/{hw.total_marks}</span>
                  {sub.feedback && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>💬 {sub.feedback}</p>}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

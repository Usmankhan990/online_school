import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ParentResults() {
  const [dashboard, setDashboard] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/parent/dashboard');
        setDashboard(res.data);
        setResults(res.data.child?.results || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const gradeColor = (g) => ({ 'A+': '#10b981', 'A': '#059669', 'B': '#3b82f6', 'C': '#f59e0b', 'D': '#f97316', 'F': '#ef4444' }[g] || '#6b7280');

  if (loading) return <div className="flex flex-col gap-5 min-w-0">{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}</div>;

  const child = dashboard?.child;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>📊 Child's Results</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          Exam results for <strong>{child?.full_name || 'your child'}</strong>
        </p>
      </div>

      {results.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📊</span>
          <p style={{ fontSize: 16, fontWeight: 600 }}>No exam results available yet</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Results will appear here after exams are graded</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {results.map((r, i) => (
            <div key={i} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {r.exam?.course?.subject?.name || 'Exam'} — {r.exam?.title || ''}
                  </h3>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span>Total: {r.exam?.total_marks || '-'}</span>
                    <span>Obtained: {r.total_obtained || 0}</span>
                    <span>{new Date(r.submitted_at).toLocaleDateString('en-PK', { dateStyle: 'medium' })}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: gradeColor(r.grade) }}>{r.grade || '-'}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{parseFloat(r.percentage || 0).toFixed(1)}%</div>
                </div>
              </div>
              {/* Progress bar */}
              <div style={{ marginTop: 12, height: 8, borderRadius: 4, background: 'var(--border-light)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 4, background: gradeColor(r.grade), width: `${r.percentage || 0}%`, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

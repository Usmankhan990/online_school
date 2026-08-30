import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const { data } = await api.get('/admin/results');
      setResults(data.results);
    } catch (err) {
      setError('Failed to load results.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <h1>📊 Results Overview</h1>
        <p>Recent exam results across all classes and subjects.</p>
      </div>

      <div className="card table-responsive">
        <h2 style={{ padding: 20, borderBottom: '1px solid var(--border-color)', margin: 0, fontSize: 16 }}>Recent Graded Exams</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading...</div>
        ) : error ? (
          <div style={{ padding: 16, background: '#fee2e2', color: '#b91c1c', margin: 20, borderRadius: 8 }}>{error}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Student</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Exam Title</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Class / Subject</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Score</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>No results found.</td>
                  </tr>
                ) : (
                  results.map(attempt => {
                    const maxScore = attempt.exam?.total_marks || 1;
                    const percentage = Math.round((attempt.score / maxScore) * 100);
                    return (
                      <tr key={attempt.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 20px', fontWeight: 500 }}>{attempt.student?.full_name}</td>
                        <td style={{ padding: '12px 20px' }}>{attempt.exam?.title}</td>
                        <td style={{ padding: '12px 20px' }}>
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                            {attempt.exam?.course?.class?.grade_level || '-'} • {attempt.exam?.course?.subject?.name || '-'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 20px', fontWeight: 600 }}>
                          {attempt.score} / {maxScore}
                        </td>
                        <td style={{ padding: '12px 20px' }}>
                          <span style={{
                            padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                            background: percentage >= 50 ? '#d1fae5' : '#fee2e2',
                            color: percentage >= 50 ? '#065f46' : '#991b1b'
                          }}>
                            {percentage}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

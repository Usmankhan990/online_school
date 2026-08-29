import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const { data } = await api.get('/admin/exams');
      setExams(data.exams || []);
    } catch (err) {
      setError('Failed to load exams.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <h1>📝 Exams Overview</h1>
        <p>Monitor all exams across the school — upcoming, active, and completed.</p>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <h2 style={{ padding: 20, borderBottom: '1px solid var(--border-color)', margin: 0, fontSize: 16 }}>All Exams</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading...</div>
        ) : error ? (
          <div style={{ padding: 16, background: '#fee2e2', color: '#b91c1c', margin: 20, borderRadius: 8 }}>{error}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Title</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Course</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Teacher</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Marks</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {exams.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>No exams found.</td>
                  </tr>
                ) : (
                  exams.map(exam => (
                    <tr key={exam.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 20px', fontWeight: 500 }}>{exam.title}</td>
                      <td style={{ padding: '12px 20px', textTransform: 'capitalize' }}>{exam.type}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                          {exam.course?.class?.grade_level || '-'} • {exam.course?.subject?.name || '-'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px' }}>{exam.teacher?.full_name}</td>
                      <td style={{ padding: '12px 20px' }}>{exam.total_marks}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{
                          padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                          background: exam.is_published ? '#d1fae5' : '#f3f4f6',
                          color: exam.is_published ? '#065f46' : '#4b5563'
                        }}>
                          {exam.is_published ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

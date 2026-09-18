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

      <div className="glass-card table-responsive">
        <h2 className="px-6 py-4 border-b border-gray-100 font-semibold text-gray-900">Recent Graded Exams</h2>
        
        {loading ? (
          <div className="text-center p-8 text-dark-500">Loading...</div>
        ) : error ? (
          <div className="p-4 bg-rose-500/10 text-rose-500 rounded-lg m-4">{error}</div>
        ) : (
          <table className="table-dark">
            <thead>
              <tr>
                <th>Student</th>
                <th>Exam Title</th>
                <th>Class / Subject</th>
                <th>Score</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-dark-500 py-8">No results found.</td>
                </tr>
              ) : (
                results.map(attempt => {
                  const maxScore = attempt.exam?.total_marks || 1;
                  const percentage = Math.round((attempt.score / maxScore) * 100);
                  return (
                    <tr key={attempt.id}>
                      <td className="font-medium text-gray-900">{attempt.student?.full_name}</td>
                      <td className="text-dark-300 text-sm">{attempt.exam?.title}</td>
                      <td className="text-dark-300 text-sm">
                        {attempt.exam?.course?.class?.grade_level || '-'} • {attempt.exam?.course?.subject?.name || '-'}
                      </td>
                      <td className="font-semibold text-gray-900">
                        {attempt.score} / {maxScore}
                      </td>
                      <td>
                        <span className={`badge ${percentage >= 50 ? 'badge-success' : 'badge-danger'}`}>
                          {percentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

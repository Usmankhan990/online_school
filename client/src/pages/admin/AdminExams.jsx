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

      <div className="glass-card table-responsive">
        <h2 className="px-6 py-4 border-b border-gray-100 font-semibold text-gray-900">All Exams</h2>
        
        {loading ? (
          <div className="text-center p-8 text-dark-500">Loading...</div>
        ) : error ? (
          <div className="p-4 bg-rose-500/10 text-rose-500 rounded-lg m-4">{error}</div>
        ) : (
          <table className="table-dark">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Course</th>
                <th>Teacher</th>
                <th>Marks</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {exams.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-dark-500 py-8">No exams found.</td>
                </tr>
              ) : (
                exams.map(exam => (
                  <tr key={exam.id}>
                    <td className="font-medium text-gray-900">{exam.title}</td>
                    <td className="capitalize text-dark-300 text-sm">{exam.type}</td>
                    <td className="text-dark-300 text-sm">
                      {exam.course?.class?.grade_level || '-'} • {exam.course?.subject?.name || '-'}
                    </td>
                    <td className="text-dark-300 text-sm">{exam.teacher?.full_name}</td>
                    <td className="text-dark-300 text-sm">{exam.total_marks}</td>
                    <td>
                      <span className={`badge ${exam.is_published ? 'badge-success' : 'badge-warning'}`}>
                        {exam.is_published ? 'PUBLISHED' : 'DRAFT'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

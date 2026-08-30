import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/admin/courses');
      setCourses(data.courses || []);
    } catch (err) {
      setError('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <h1>📚 Courses Overview</h1>
        <p>View all courses created by teachers across all classes.</p>
      </div>

      <div className="card table-responsive">
        <h2 style={{ padding: 20, borderBottom: '1px solid var(--border-color)', margin: 0, fontSize: 16 }}>All Courses</h2>
        
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
                  <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Teacher</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Class</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Subject</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>No courses found.</td>
                  </tr>
                ) : (
                  courses.map(course => (
                    <tr key={course.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 20px', fontWeight: 500 }}>{course.title}</td>
                      <td style={{ padding: '12px 20px' }}>{course.teacher?.full_name}</td>
                      <td style={{ padding: '12px 20px' }}>{course.class?.grade_level} {course.class?.section && `(${course.class.section})`}</td>
                      <td style={{ padding: '12px 20px' }}>{course.subject?.name}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{
                          padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                          background: course.is_active ? '#d1fae5' : '#fee2e2',
                          color: course.is_active ? '#065f46' : '#991b1b'
                        }}>
                          {course.is_active ? 'ACTIVE' : 'INACTIVE'}
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

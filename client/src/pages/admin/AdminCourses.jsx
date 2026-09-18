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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📚 Courses Overview</h1>
          <p className="text-dark-400 text-sm mt-1">View all courses created by teachers across all classes.</p>
        </div>
      </div>

      <div className="glass-card table-responsive">
        {loading ? (
          <div className="text-center p-8 text-dark-500">Loading...</div>
        ) : error ? (
          <div className="p-4 bg-rose-500/10 text-rose-500 rounded-lg m-4">{error}</div>
        ) : (
          <table className="table-dark">
            <thead>
              <tr>
                <th>Title</th>
                <th>Teacher</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-dark-500 py-8">No courses found.</td>
                </tr>
              ) : (
                courses.map(course => (
                  <tr key={course.id}>
                    <td>
                      <p className="text-gray-900 text-sm font-medium">{course.title}</p>
                    </td>
                    <td className="text-dark-300 text-sm">{course.teacher?.full_name}</td>
                    <td className="text-dark-300 text-sm">{course.class?.grade_level} {course.class?.section && `(${course.class.section})`}</td>
                    <td className="text-dark-300 text-sm">{course.subject?.name}</td>
                    <td>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${course.is_active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                        {course.is_active ? 'ACTIVE' : 'INACTIVE'}
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

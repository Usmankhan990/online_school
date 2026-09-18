import { useState, useEffect } from 'react';
import api from '../../services/api';
import { HiOutlinePlus, HiOutlineBookOpen } from 'react-icons/hi';

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ class_id: '', subject_id: '', title: '', description: '' });
  const [loading, setLoading] = useState(true);

  const fetchCourses = () => {
    api.get('/teacher/courses').then(res => setCourses(res.data.courses)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
    api.get('/classes').then(res => setClasses(res.data.classes)).catch(() => {});
  }, []);

  const handleClassChange = async (e) => {
    const class_id = e.target.value;
    setForm(f => ({ ...f, class_id, subject_id: '' }));
    if (class_id) {
      try {
        const res = await api.get(`/classes/${class_id}/subjects`);
        setSubjects(res.data.subjects || []);
      } catch (err) {
        setSubjects([]);
      }
    } else {
      setSubjects([]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/teacher/courses', form);
      setShowForm(false);
      setForm({ class_id: '', subject_id: '', title: '', description: '' });
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-dark-400 text-sm mt-1">Create and manage your courses</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm flex items-center gap-2">
          <HiOutlinePlus className="w-4 h-4" /> Add Course
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6 animate-slide-up">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Course</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select className="form-input" value={form.class_id} onChange={handleClassChange} required>
              <option value="">Select Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
            </select>
            <select className="form-input" value={form.subject_id} onChange={e => setForm({...form, subject_id: e.target.value})} required disabled={!form.class_id || subjects.length === 0}>
              <option value="">{subjects.length > 0 ? 'Select Subject' : (form.class_id ? 'No subjects in class' : 'Select Class First')}</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input className="form-input md:col-span-2" placeholder="Course Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            <textarea className="form-input md:col-span-2 h-20 resize-none" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            <div className="md:col-span-2 flex gap-3 mt-2">
              <button type="submit" className="btn btn-primary btn-sm">Create Course</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card table-responsive">
        <table className="table-dark">
          <thead>
            <tr>
              <th>Course Title</th>
              <th>Class</th>
              <th>Subject</th>
              <th>Students</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 && !loading ? (
              <tr>
                <td colSpan="5" className="text-center p-8 text-dark-400">
                  <HiOutlineBookOpen className="w-8 h-8 text-dark-600 mx-auto mb-2" />
                  No courses yet. Click "Add Course" to start!
                </td>
              </tr>
            ) : (
              courses.map(course => (
                <tr key={course.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-blue-400 shrink-0">
                        <HiOutlineBookOpen className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-gray-900">{course.title}</span>
                    </div>
                  </td>
                  <td className="text-dark-300 text-sm">{course.class?.display_name || '-'}</td>
                  <td className="text-dark-300 text-sm">{course.subject?.name || '-'}</td>
                  <td>
                    <span className="badge badge-info">{course.enrollments?.length || 0} students</span>
                  </td>
                  <td>
                    <span className={`badge ${course.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {course.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
    api.get('/admin/classes').then(res => setClasses(res.data.classes)).catch(() => {});
    api.get('/admin/subjects').then(res => setSubjects(res.data.subjects)).catch(() => {});
  }, []);

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
          <h1 className="text-2xl font-bold text-white">My Courses</h1>
          <p className="text-dark-400 text-sm mt-1">Create and manage your courses</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-glow flex items-center gap-2 text-sm">
          <HiOutlinePlus className="w-4 h-4" /> New Course
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6 animate-slide-up">
          <h3 className="text-lg font-semibold text-white mb-4">Create Course</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select className="input-dark" value={form.class_id} onChange={e => setForm({...form, class_id: e.target.value})} required>
              <option value="">Select Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
            </select>
            <select className="input-dark" value={form.subject_id} onChange={e => setForm({...form, subject_id: e.target.value})} required>
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input className="input-dark md:col-span-2" placeholder="Course Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            <textarea className="input-dark md:col-span-2 h-20 resize-none" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-glow text-sm">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-dark-800 text-dark-300 hover:bg-dark-700 text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(course => (
          <div key={course.id} className="glass-card p-5 hover:border-primary-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
              <HiOutlineBookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-white font-semibold mb-1">{course.title}</h3>
            <p className="text-dark-400 text-sm mb-3">{course.class?.display_name} • {course.subject?.name}</p>
            <div className="flex items-center justify-between">
              <span className="badge badge-info">{course.enrollments?.length || 0} students</span>
              <span className={`badge ${course.is_active ? 'badge-success' : 'badge-danger'}`}>{course.is_active ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        ))}
        {courses.length === 0 && !loading && (
          <div className="col-span-full glass-card p-12 text-center">
            <HiOutlineBookOpen className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">No courses yet. Click "New Course" to start!</p>
          </div>
        )}
      </div>
    </div>
  );
}

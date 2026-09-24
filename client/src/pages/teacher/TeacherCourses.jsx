import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useSearch } from '../../contexts/SearchContext';
import { HiOutlinePlus, HiOutlineBookOpen } from 'react-icons/hi';

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ class_id: '', subject_id: '', title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const msgRef = useRef(null);
  const { searchQuery } = useSearch();

  const fetchCourses = () => {
    api.get('/teacher/courses').then(res => setCourses(res.data.courses)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
    api.get('/classes').then(res => setClasses(res.data.classes)).catch(() => {});
  }, []);

  useEffect(() => {
    if (msg) {
      if (msgRef.current) {
        msgRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      const timer = setTimeout(() => {
        setMsg('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

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
    setMsg('');
    try {
      await api.post('/teacher/courses', form);
      setMsg('✅ Course created successfully!');
      setShowForm(false);
      setForm({ class_id: '', subject_id: '', title: '', description: '' });
      fetchCourses();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Failed to create course.'));
    }
  };

  const q = (searchQuery || '').trim().toLowerCase();
  const filteredCourses = courses.filter(course => {
    if (!q) return true;
    const title = (course.title || '').toLowerCase();
    const cls = (course.class?.display_name || '').toLowerCase();
    const subject = (course.subject?.name || '').toLowerCase();
    return title.includes(q) || cls.includes(q) || subject.includes(q);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-dark-400 text-sm mt-1">Create and manage your courses</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm flex items-center gap-2">
          <HiOutlinePlus className="w-4 h-4" /> {showForm ? '✕ Cancel' : 'Add Course'}
        </button>
      </div>

      {msg && (
        <div
          ref={msgRef}
          className="alert"
          style={{
            background: msg.startsWith('✅') ? '#ecfdf5' : '#fef2f2',
            color: msg.startsWith('✅') ? '#059669' : '#dc2626',
            border: `1px solid ${msg.startsWith('✅') ? '#a7f3d0' : '#fecaca'}`,
            scrollMarginTop: '90px'
          }}
        >
          {msg}
        </div>
      )}

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
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
            <input className="form-input md:col-span-2" placeholder="Course Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            <textarea className="form-input md:col-span-2" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} />
            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary btn-sm">Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm">Create Course</button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
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
              {filteredCourses.length === 0 && !loading ? (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-dark-400">
                    <HiOutlineBookOpen className="w-8 h-8 text-dark-600 mx-auto mb-2" />
                    {q ? `No courses matching "${searchQuery}"` : 'No courses yet. Click "Add Course" to start!'}
                  </td>
                </tr>
              ) : (
                filteredCourses.map(course => (
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
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import api from '../../services/api';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', qualification: '', specialization: '', experience_years: 0 });

  const fetchTeachers = () => {
    api.get('/admin/teachers').then(res => setTeachers(res.data.teachers)).catch(console.error);
  };
  useEffect(() => { fetchTeachers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/teachers', form);
      setShowForm(false);
      setForm({ full_name: '', email: '', password: '', phone: '', qualification: '', specialization: '', experience_years: 0 });
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this teacher?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Teachers</h1>
          <p className="text-dark-400 text-sm mt-1">{teachers.length} teachers registered</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-glow flex items-center gap-2 text-sm">
          <HiOutlinePlus className="w-4 h-4" /> Add Teacher
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6 animate-slide-up">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Teacher</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="input-dark" placeholder="Full Name *" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required />
            <input className="input-dark" type="email" placeholder="Email *" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            <input className="input-dark" type="password" placeholder="Password *" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            <input className="input-dark" placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            <input className="input-dark" placeholder="Qualification" value={form.qualification} onChange={e => setForm({...form, qualification: e.target.value})} />
            <input className="input-dark" placeholder="Specialization" value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} />
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-glow text-sm">Create Teacher</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-dark-800 text-dark-300 hover:bg-dark-700 text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <table className="table-dark">
          <thead><tr><th>Teacher</th><th>Qualification</th><th>Specialization</th><th>Experience</th><th>Action</th></tr></thead>
          <tbody>
            {teachers.map(t => (
              <tr key={t.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
                      {t.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{t.full_name}</p>
                      <p className="text-dark-500 text-xs">{t.email}</p>
                    </div>
                  </div>
                </td>
                <td className="text-dark-300 text-sm">{t.teacherProfile?.qualification || '-'}</td>
                <td className="text-dark-300 text-sm">{t.teacherProfile?.specialization || '-'}</td>
                <td className="text-dark-300 text-sm">{t.teacherProfile?.experience_years || 0} years</td>
                <td>
                  <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors">
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {teachers.length === 0 && (
              <tr><td colSpan="5" className="text-center text-dark-500 py-8">No teachers found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

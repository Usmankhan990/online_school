import { useState, useEffect } from 'react';
import api from '../../services/api';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineEye, HiOutlineEyeOff, HiOutlinePencil } from 'react-icons/hi';

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', qualification: '', specialization: '', experience_years: 0 });
  const [showPassword, setShowPassword] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchTeachers = () => {
    api.get('/admin/teachers').then(res => setTeachers(res.data.teachers)).catch(console.error);
  };
  useEffect(() => { fetchTeachers(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['full_name', 'qualification', 'specialization'].includes(name)) {
      const capitalized = value.replace(/(^|\s)([a-z\u00E0-\u00FC])/g, (m, p, c) => p + c.toUpperCase());
      setForm(f => ({ ...f, [name]: capitalized }));
      return;
    }
    setForm(f => ({ ...f, [name]: value }));
  };

  const hasMinLength = form.password.length >= 8;
  const hasUpper = /[A-Z]/.test(form.password);
  const hasLower = /[a-z]/.test(form.password);
  const hasNumber = /\d/.test(form.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(form.password);
  const isPasswordValid = hasUpper && hasLower && hasNumber && hasSpecial && hasMinLength;

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ full_name: '', email: '', password: '', phone: '', qualification: '', specialization: '', experience_years: 0 });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!editingId && !isPasswordValid) {
      alert('Password does not meet all requirements.');
      return;
    }
    if (editingId && form.password && !isPasswordValid) {
      alert('Password does not meet all requirements.');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/admin/teachers/${editingId}`, form);
      } else {
        await api.post('/admin/teachers', form);
      }
      resetForm();
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  const handleEdit = (t) => {
    setEditingId(t.id);
    setForm({
      full_name: t.full_name || '',
      email: t.email || '',
      password: '',
      phone: t.phone || '',
      qualification: t.teacherProfile?.qualification || '',
      specialization: t.teacherProfile?.specialization || '',
      experience_years: t.teacherProfile?.experience_years || 0,
    });
    setShowForm(true);
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
          <h1 className="text-2xl font-bold text-gray-900">Manage Teachers</h1>
          <p className="text-dark-400 text-sm mt-1">{teachers.length} teachers registered</p>
        </div>
        <button onClick={() => { if(showForm) resetForm(); else setShowForm(true); }} className="btn btn-primary btn-sm flex items-center gap-2">
          <HiOutlinePlus className="w-4 h-4" /> Add Teacher
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6 animate-slide-up">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingId ? 'Edit Teacher' : 'Create New Teacher'}</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="form-input" name="full_name" placeholder="Full Name *" value={form.full_name} onChange={handleChange} required />
            <input className="form-input" name="email" type="email" placeholder="Email *" value={form.email} onChange={handleChange} required />
            
            <div>
              <div style={{ position: 'relative' }}>
                <input 
                  className="form-input" 
                  name="password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder={editingId ? "Password (leave blank to keep current)" : "Password *"} 
                  value={form.password} 
                  onChange={handleChange} 
                  required={!editingId}
                  style={{ width: '100%', paddingRight: '40px' }} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                </button>
              </div>
              {form.password.length > 0 && !isPasswordValid && (
                <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>
                  {!hasUpper ? 'Password must contain at least one uppercase letter.' :
                   !hasLower ? 'Password must contain at least one lowercase letter.' :
                   !hasNumber ? 'Password must contain at least one number.' :
                   !hasSpecial ? 'Password must contain at least one special character.' :
                   'Password must be at least 8 characters.'}
                </div>
              )}
            </div>

            <input className="form-input" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
            <input className="form-input" name="qualification" placeholder="Qualification" value={form.qualification} onChange={handleChange} />
            <input className="form-input" name="specialization" placeholder="Specialization" value={form.specialization} onChange={handleChange} />
            <input className="form-input" name="experience_years" type="number" min="0" placeholder="Experience (Years)" value={form.experience_years} onChange={handleChange} />
            <div className="md:col-span-2 flex gap-3 mt-2">
              <button type="submit" className="btn btn-primary btn-sm">{editingId ? 'Update Teacher' : 'Create Teacher'}</button>
              <button type="button" onClick={resetForm} className="btn btn-secondary btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card table-responsive">
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
                      <p className="text-gray-900 text-sm font-medium">{t.full_name}</p>
                      <p className="text-dark-500 text-xs">{t.email}</p>
                    </div>
                  </div>
                </td>
                <td className="text-dark-300 text-sm">{t.teacherProfile?.qualification || '-'}</td>
                <td className="text-dark-300 text-sm">{t.teacherProfile?.specialization || '-'}</td>
                <td className="text-dark-300 text-sm">{t.teacherProfile?.experience_years || 0} years</td>
                <td>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(t)} className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors" title="Edit Teacher">
                      <HiOutlinePencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors" title="Delete Teacher">
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
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


import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { HiOutlineTrash, HiOutlinePencil, HiOutlineEye, HiOutlineEyeOff, HiOutlinePlus } from 'react-icons/hi';

export default function AdminParents() {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', relation: '', cnic: '', occupation: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const { data } = await api.get('/admin/parents');
      setParents(data.parents || []);
    } catch (err) {
      setError('Failed to load parents.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ full_name: '', email: '', password: '', relation: '', cnic: '', occupation: '' });
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({
      full_name: p.full_name || '',
      email: p.email || '',
      password: '',
      relation: p.parentProfile?.relation || '',
      cnic: p.parentProfile?.cnic || '',
      occupation: p.parentProfile?.occupation || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this parent?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchParents();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['full_name', 'relation', 'occupation'].includes(name)) {
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

  const handleUpdate = async (e) => {
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
        await api.put(`/admin/parents/${editingId}`, form);
      } else {
        await api.post('/admin/parents', form);
      }
      resetForm();
      fetchParents();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">👨‍👩‍👧‍👦 Parents Management</h1>
          <p className="text-dark-400 text-sm mt-1">View and manage registered parents.</p>
        </div>
        <button onClick={() => { if(showForm) resetForm(); else setShowForm(true); }} className="btn btn-primary btn-sm flex items-center gap-2">
          <HiOutlinePlus className="w-4 h-4" /> Add Parent
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6 animate-slide-up" style={{ marginBottom: 14 }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingId ? 'Edit Parent' : 'Create New Parent'}</h3>
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <input className="form-input" name="relation" placeholder="Relation (e.g., Father)" value={form.relation} onChange={handleChange} />
            <input className="form-input" name="cnic" placeholder="CNIC" value={form.cnic} onChange={handleChange} />
            <input className="form-input" name="occupation" placeholder="Occupation" value={form.occupation} onChange={handleChange} />
            
            <div className="md:col-span-2 flex justify-end gap-3" style={{ marginTop: 10, marginBottom: 2 }}>
              <button type="submit" className="btn btn-primary btn-sm">{editingId ? 'Update Parent' : 'Create Parent'}</button>
              <button type="button" onClick={resetForm} className="btn btn-secondary btn-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card table-responsive">
        {loading ? (
          <div className="text-center p-8 text-dark-500">Loading...</div>
        ) : error ? (
          <div className="p-4 bg-rose-500/10 text-rose-500 rounded-lg m-4">{error}</div>
        ) : (
          <table className="table-dark">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Relation</th>
                <th>CNIC</th>
                <th>Occupation</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {parents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-dark-500 py-8">No parents found.</td>
                </tr>
              ) : (
                parents.map(parent => (
                  <tr key={parent.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
                          {parent.full_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-gray-900 text-sm font-medium">{parent.full_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-dark-300 text-sm">{parent.email}</td>
                    <td className="text-dark-300 text-sm">{parent.parentProfile?.relation || '-'}</td>
                    <td className="text-dark-300 text-sm">{parent.parentProfile?.cnic || '-'}</td>
                    <td className="text-dark-300 text-sm">{parent.parentProfile?.occupation || '-'}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(parent)} className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors" title="Edit Parent">
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(parent.id)} className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors" title="Delete Parent">
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
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

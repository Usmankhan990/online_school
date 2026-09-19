import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState('active');
  const [classes, setClasses] = useState([]);
  const [editModal, setEditModal] = useState(null);   // student obj being edited
  const [deleteModal, setDeleteModal] = useState(null); // student obj to delete
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const loadStudents = () => {
    api.get(`/admin/students?status=${filter}`)
      .then(res => setStudents(res.data.students))
      .catch(console.error);
  };

  useEffect(() => { loadStudents(); }, [filter]);
  useEffect(() => {
    api.get('/admin/classes').then(r => setClasses(r.data.classes || [])).catch(() => {});
  }, []);

  /* ── Edit handler ── */
  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await api.put(`/admin/students/${editModal.id}`, {
        full_name: editModal.full_name,
        phone: editModal.phone,
        status: editModal.status,
        father_name: editModal.studentProfile?.father_name,
        mother_name: editModal.studentProfile?.mother_name,
        contact_number_1: editModal.studentProfile?.contact_number_1,
        contact_number_2: editModal.studentProfile?.contact_number_2,
        class_id: editModal.studentProfile?.class_id,
        medium: editModal.studentProfile?.medium,
        address: editModal.studentProfile?.address,
        roll_number: editModal.studentProfile?.roll_number,
      });
      setMsg('✅ Student updated successfully!');
      loadStudents();
      setTimeout(() => { setEditModal(null); setMsg(''); }, 1200);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Update failed.'));
    }
    setSaving(false);
  };

  /* ── Delete handler ── */
  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/admin/users/${deleteModal.id}`);
      setDeleteModal(null);
      loadStudents();
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed.');
    }
    setSaving(false);
  };

  const field = (label, value, onChange, type = 'text', opts = null, maxLength = undefined) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>{label}</label>
      {opts ? (
        <select value={value || ''} onChange={e => onChange(e.target.value)}
          style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, background: '#fff', color: '#0f172a' }}>
          {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input type={type} maxLength={maxLength} value={value || ''} onChange={e => onChange(e.target.value)}
          style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, color: '#0f172a', background: '#fff' }} />
      )}
    </div>
  );

  const setProfile = (key, val) =>
    setEditModal(prev => ({ ...prev, studentProfile: { ...prev.studentProfile, [key]: val } }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: 16 }}>
        <h1 className="text-2xl font-bold text-gray-900">All Students</h1>
        <div className="flex gap-2">
          {['active', 'trial', 'pending', 'rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`btn btn-sm capitalize ${filter === s ? 'btn-primary' : 'btn-secondary'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card table-responsive">
        <table className="table-dark">
          <thead>
            <tr>
              <th>Student</th><th>Class</th><th>Roll No</th><th>Father</th><th>Contact</th><th>Status</th><th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-semibold">
                      {s.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-gray-900 text-sm font-medium">{s.full_name}</p>
                      <p className="text-dark-500 text-xs">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="text-dark-300 text-sm">{s.studentProfile?.class?.display_name || '-'}</td>
                <td className="text-dark-300 text-sm font-mono">{s.studentProfile?.roll_number || '-'}</td>
                <td className="text-dark-300 text-sm">{s.studentProfile?.father_name || '-'}</td>
                <td className="text-dark-300 text-sm">{s.studentProfile?.contact_number_1 || '-'}</td>
                <td><span className={`badge ${s.status === 'active' ? 'badge-success' : s.status === 'trial' ? 'badge-info' : s.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>{s.status}</span></td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    {/* Edit */}
                    <button
                      onClick={() => setEditModal({ ...s, studentProfile: { ...s.studentProfile } })}
                      title="Edit student"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '5px 12px', borderRadius: 7, border: '1px solid #d1fae5',
                        background: '#ecfdf5', color: '#059669', fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.15s'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#d1fae5'}
                      onMouseOut={e => e.currentTarget.style.background = '#ecfdf5'}
                    >
                      ✏️ Edit
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => setDeleteModal(s)}
                      title="Remove student"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '5px 12px', borderRadius: 7, border: '1px solid #fecaca',
                        background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.15s'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#fecaca'}
                      onMouseOut={e => e.currentTarget.style.background = '#fef2f2'}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan="7" className="text-center text-dark-500 py-8">No students found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── EDIT MODAL ── */}
      {editModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            {/* Modal header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Edit Student</h2>
                <p style={{ margin: 0, marginTop: 2, fontSize: 13, color: '#64748b' }}>{editModal.full_name}</p>
              </div>
              <button onClick={() => setEditModal(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>

            <form onSubmit={handleEdit} style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {field('Full Name', editModal.full_name, v => setEditModal(p => ({ ...p, full_name: v })))}
                {field('Phone', editModal.phone, v => setEditModal(p => ({ ...p, phone: v.replace(/[^0-9]/g, '').slice(0, 11) })), 'text', null, 11)}
                {field('Status', editModal.status, v => setEditModal(p => ({ ...p, status: v })), 'text', [
                  { value: 'active', label: 'Active' },
                  { value: 'trial', label: 'Trial' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'rejected', label: 'Rejected' },
                ])}
                {field('Roll Number', editModal.studentProfile?.roll_number, v => setProfile('roll_number', v))}
                {field('Father Name', editModal.studentProfile?.father_name, v => setProfile('father_name', v))}
                {field('Mother Name', editModal.studentProfile?.mother_name, v => setProfile('mother_name', v))}
                {field('Contact 1', editModal.studentProfile?.contact_number_1, v => setProfile('contact_number_1', v.replace(/[^0-9]/g, '').slice(0, 11)), 'text', null, 11)}
                {field('Contact 2', editModal.studentProfile?.contact_number_2, v => setProfile('contact_number_2', v.replace(/[^0-9]/g, '').slice(0, 11)), 'text', null, 11)}
                {field('Class', editModal.studentProfile?.class_id, v => setProfile('class_id', v), 'text',
                  [{ value: '', label: '— Select Class —' }, ...classes.map(c => ({ value: c.id, label: c.display_name }))]
                )}
                {field('Medium', editModal.studentProfile?.medium, v => setProfile('medium', v), 'text', [
                  { value: 'English', label: 'English' },
                  { value: 'Urdu', label: 'Urdu' },
                ])}
              </div>
              <div style={{ marginTop: 14 }}>
                {field('Address', editModal.studentProfile?.address, v => setProfile('address', v))}
              </div>

              {msg && <p style={{ marginTop: 12, fontSize: 13, color: msg.startsWith('✅') ? '#059669' : '#dc2626' }}>{msg}</p>}

              <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setEditModal(null)}
                  style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ padding: '9px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #1e3a5f, #10b981)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 420, padding: 32, boxShadow: '0 25px 50px rgba(0,0,0,0.25)', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Remove Student?</h2>
            <p style={{ margin: '10px 0 24px', fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
              You are about to permanently delete <strong>{deleteModal.full_name}</strong>. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setDeleteModal(null)}
                style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={saving}
                style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Removing…' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api, { FILE_BASE } from '../../services/api';
import { HiOutlineEye, HiOutlineExternalLink } from 'react-icons/hi';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState('active');
  const [classes, setClasses] = useState([]);
  const [viewModal, setViewModal] = useState(null);     // student obj being viewed
  const [editModal, setEditModal] = useState(null);     // student obj being edited
  const [deleteModal, setDeleteModal] = useState(null); // student obj to delete
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const loadStudents = () => {
    api.get(`/admin/students?status=${filter}`)
      .then(res => setStudents(res.data.students || []))
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
      const phoneVal = editModal.phone || editModal.studentProfile?.contact_number_1 || '';
      await api.put(`/admin/students/${editModal.id}`, {
        full_name: editModal.full_name,
        phone: phoneVal,
        gender: editModal.gender || editModal.studentProfile?.gender || 'Male',
        status: editModal.status,
        father_name: editModal.studentProfile?.father_name,
        mother_name: editModal.studentProfile?.mother_name,
        father_cnic: editModal.studentProfile?.father_cnic,
        contact_number_1: phoneVal,
        contact_number_2: editModal.studentProfile?.contact_number_2,
        parent_email: editModal.studentProfile?.parent_email,
        class_id: editModal.studentProfile?.class_id,
        medium: editModal.studentProfile?.medium,
        date_of_birth: editModal.studentProfile?.date_of_birth,
        guardian_relation: editModal.studentProfile?.guardian_relation,
        address: editModal.studentProfile?.address,
        roll_number: editModal.studentProfile?.roll_number,
      });
      setMsg('✅ Student updated successfully!');
      loadStudents();
      setTimeout(() => { setEditModal(null); setMsg(''); }, 800);
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
          {['active', 'pending', 'rejected'].map(s => (
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
              <th>Student</th><th>Class</th><th>Roll No</th><th>Father / CNIC</th><th>Contact</th><th>Status</th><th style={{ textAlign: 'center' }}>Actions</th>
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
                      <p className="text-dark-500 text-xs" style={{ wordBreak: 'break-all' }}>{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="text-dark-300 text-sm">
                  <div style={{ whiteSpace: 'nowrap' }}>{s.studentProfile?.class?.display_name || '-'}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>{s.studentProfile?.medium || 'English'} Medium</div>
                </td>
                <td className="text-dark-300 text-sm font-mono" style={{ whiteSpace: 'nowrap' }}>{s.studentProfile?.roll_number || '-'}</td>
                <td className="text-dark-300 text-sm">
                  <div>{s.studentProfile?.father_name || '-'}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{s.studentProfile?.father_cnic || '-'}</div>
                </td>
                <td className="text-dark-300 text-sm font-mono" style={{ wordBreak: 'break-all' }}>{s.phone || s.studentProfile?.contact_number_1 || '-'}</td>
                <td style={{ whiteSpace: 'nowrap' }}><span className={`badge ${s.status === 'active' ? 'badge-success' : s.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>{s.status}</span></td>
                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                    {/* View Details */}
                    <button
                      onClick={() => setViewModal(s)}
                      title="View full admission data & documents"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                        padding: '3px 7px', borderRadius: 6, border: '1px solid #e2e8f0',
                        background: '#f8fafc', color: '#475569', fontSize: 11, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.15s'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'}
                      onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}
                    >
                      <HiOutlineEye size={11} /> View
                    </button>
                    {/* Edit */}
                    <button
                      onClick={() => {
                        const currentPhone = s.phone || s.studentProfile?.contact_number_1 || '';
                        setEditModal({
                          ...s,
                          phone: currentPhone,
                          gender: s.gender || s.studentProfile?.gender || 'Male',
                          studentProfile: {
                            ...s.studentProfile,
                            contact_number_1: s.studentProfile?.contact_number_1 || currentPhone,
                          }
                        });
                      }}
                      title="Edit student"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                        padding: '3px 7px', borderRadius: 6, border: '1px solid #d1fae5',
                        background: '#ecfdf5', color: '#059669', fontSize: 11, fontWeight: 600,
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
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                        padding: '3px 7px', borderRadius: 6, border: '1px solid #fecaca',
                        background: '#fef2f2', color: '#dc2626', fontSize: 11, fontWeight: 600,
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

      {/* ── FULL STUDENT ADMISSION DOSSIER VIEW MODAL ── */}
      {viewModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 12px' }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            width: '100%',
            maxWidth: 680,
            maxHeight: 'min(90vh, 700px)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', flexShrink: 0 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>📋 Student Admission Profile</h2>
                <p style={{ margin: 0, marginTop: 2, fontSize: 12, color: '#64748b' }}>
                  Roll No: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{viewModal.studentProfile?.roll_number || 'N/A'}</span> • Status: <span style={{ textTransform: 'capitalize', fontWeight: 700 }}>{viewModal.status}</span>
                </p>
              </div>
              <button onClick={() => setViewModal(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#94a3b8', padding: 4, borderRadius: 6, lineHeight: 1 }}>✕</button>
            </div>

            {/* Modal Body */}
            <div style={{
              padding: '20px 22px',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}>
              <style>{`
                .hide-modal-scroll::-webkit-scrollbar { display: none; }
              `}</style>

              {/* Section 1: Student Information */}
              <div style={{ background: 'var(--bg-surface-2, #F4EFE6)', padding: 16, borderRadius: 16, border: '1px solid var(--border-light, #EBE4D5)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary, #1C1917)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>👤</span> Student Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, fontSize: 13 }}>
                  <div><span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Full Name</span><strong style={{ color: '#0f172a' }}>{viewModal.full_name}</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Login Email</span><strong style={{ color: '#0f172a' }}>{viewModal.email}</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Phone</span><strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{viewModal.phone || viewModal.studentProfile?.contact_number_1 || '-'}</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Gender</span><strong style={{ color: '#0f172a' }}>{viewModal.gender || viewModal.studentProfile?.gender || 'Male'}</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Date of Birth</span><strong style={{ color: '#0f172a' }}>{viewModal.studentProfile?.date_of_birth || '-'}</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Class</span><span style={{ fontWeight: 800, color: '#1d4ed8' }}>{viewModal.studentProfile?.class?.display_name || 'N/A'}</span></div>
                  <div><span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Medium</span><strong style={{ color: '#0f172a' }}>{viewModal.studentProfile?.medium || 'English'}</strong></div>
                </div>
              </div>

              {/* Section 2: Parent & Guardian Details */}
              <div style={{ background: 'var(--bg-surface-2, #F4EFE6)', padding: 16, borderRadius: 16, border: '1px solid var(--border-light, #EBE4D5)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary, #1C1917)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>👨‍👩‍👦</span> Parent / Guardian Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, fontSize: 13 }}>
                  <div><span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Guardian Relation</span><strong style={{ color: '#0f172a' }}>{viewModal.studentProfile?.guardian_relation || 'Father'}</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Father Name</span><strong style={{ color: '#0f172a' }}>{viewModal.studentProfile?.father_name || '-'}</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Mother Name</span><strong style={{ color: '#0f172a' }}>{viewModal.studentProfile?.mother_name || '-'}</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Father / Parent CNIC</span><strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{viewModal.studentProfile?.father_cnic || '-'}</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Parent Email</span><strong style={{ color: '#0f172a' }}>{viewModal.studentProfile?.parent_email || '-'}</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Contact Number 1</span><strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{viewModal.studentProfile?.contact_number_1 || viewModal.phone || '-'}</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Contact Number 2</span><strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{viewModal.studentProfile?.contact_number_2 || 'None'}</strong></div>
                </div>
              </div>

              {/* Section 3: Residential Address */}
              <div style={{ background: 'var(--bg-surface-2, #F4EFE6)', padding: 16, borderRadius: 16, border: '1px solid var(--border-light, #EBE4D5)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary, #1C1917)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📍</span> Residential Address
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: '#1e293b', lineHeight: 1.5, fontWeight: 500 }}>
                  {viewModal.studentProfile?.address || 'No detailed address provided.'}
                </p>
              </div>

              {/* Section 4: Attached Verification Documents */}
              <div style={{ background: 'var(--bg-surface-2, #F4EFE6)', padding: 16, borderRadius: 16, border: '1px solid var(--border-light, #EBE4D5)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary, #1C1917)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📎</span> Uploaded Verification Documents ({viewModal.documents?.length || 0})
                </h3>
                {(!viewModal.documents || viewModal.documents.length === 0) ? (
                  <p style={{ margin: 0, fontSize: 12.5, color: '#94a3b8', fontStyle: 'italic' }}>No documents attached.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                    {viewModal.documents.map((doc, idx) => {
                      const fileUrl = doc.file_path ? `${FILE_BASE}/uploads/${doc.file_path}` : null;
                      return (
                        <div key={doc.id || idx} style={{ padding: '10px 12px', background: '#fff', borderRadius: 8, border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.title || `Document ${idx + 1}`}</div>
                            <div style={{ fontSize: 10.5, color: '#64748b' }}>{doc.type || 'Attachment'}</div>
                          </div>
                          {fileUrl && (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '4px 8px', borderRadius: 6, background: '#eff6ff', color: '#2563eb', fontSize: 11, fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}
                            >
                              <HiOutlineExternalLink size={12} /> Open
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 22px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              gap: 10,
              justifyContent: 'flex-end',
              background: '#f8fafc',
              flexShrink: 0,
            }}>
              <button type="button" onClick={() => setViewModal(null)}
                style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── EDIT MODAL ── */}
      {editModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 12px' }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            width: '100%',
            maxWidth: 640,
            maxHeight: 'min(90vh, 660px)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out',
          }}>
            {/* Modal header - Fixed Top */}
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', flexShrink: 0 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Edit Student</h2>
                <p style={{ margin: 0, marginTop: 2, fontSize: 12, color: '#64748b' }}>{editModal.full_name}</p>
              </div>
              <button onClick={() => setEditModal(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#94a3b8', padding: 4, borderRadius: 6, lineHeight: 1 }}>✕</button>
            </div>

            {/* Modal Form - Scrollable without visible scrollbar */}
            <form onSubmit={handleEdit} style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}>
              <style>{`
                .hide-modal-scroll::-webkit-scrollbar { display: none; }
              `}</style>
              
              <div className="hide-modal-scroll" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                  {field('Full Name', editModal.full_name, v => setEditModal(p => ({ ...p, full_name: v })))}
                  {field('Phone', editModal.phone, v => {
                    const clean = v.replace(/[^0-9]/g, '').slice(0, 11);
                    setEditModal(p => ({
                      ...p,
                      phone: clean,
                      studentProfile: { ...p.studentProfile, contact_number_1: clean }
                    }));
                  }, 'text', null, 11)}
                  {field('Gender', editModal.gender || editModal.studentProfile?.gender, v => {
                    setEditModal(p => ({ ...p, gender: v, studentProfile: { ...p.studentProfile, gender: v } }));
                  }, 'text', [
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' },
                  ])}
                  {field('Date of Birth', editModal.studentProfile?.date_of_birth, v => setProfile('date_of_birth', v), 'date')}
                  {field('Guardian Relation', editModal.studentProfile?.guardian_relation, v => setProfile('guardian_relation', v), 'text', [
                    { value: 'Father', label: 'Father' },
                    { value: 'Mother', label: 'Mother' },
                  ])}
                  {field('Status', editModal.status, v => setEditModal(p => ({ ...p, status: v })), 'text', [
                    { value: 'active', label: 'Active' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'rejected', label: 'Rejected' },
                  ])}
                  {field('Roll Number', editModal.studentProfile?.roll_number, v => setProfile('roll_number', v))}
                  {field('Father Name', editModal.studentProfile?.father_name, v => setProfile('father_name', v))}
                  {field('Mother Name', editModal.studentProfile?.mother_name, v => setProfile('mother_name', v))}
                  {field('Father / Guardian CNIC', editModal.studentProfile?.father_cnic, v => {
                    let val = v.replace(/[^0-9]/g, '');
                    if (val.length > 5) val = val.slice(0, 5) + '-' + val.slice(5);
                    if (val.length > 13) val = val.slice(0, 13) + '-' + val.slice(13);
                    if (val.length > 15) val = val.slice(0, 15);
                    setProfile('father_cnic', val);
                  }, 'text', null, 15)}
                  {field('Parent Email', editModal.studentProfile?.parent_email, v => setProfile('parent_email', v))}
                  {field('Contact 1', editModal.studentProfile?.contact_number_1, v => {
                    const clean = v.replace(/[^0-9]/g, '').slice(0, 11);
                    setEditModal(p => ({
                      ...p,
                      phone: clean,
                      studentProfile: { ...p.studentProfile, contact_number_1: clean }
                    }));
                  }, 'text', null, 11)}
                  {field('Contact 2', editModal.studentProfile?.contact_number_2, v => setProfile('contact_number_2', v.replace(/[^0-9]/g, '').slice(0, 11)), 'text', null, 11)}
                  {field('Class', editModal.studentProfile?.class_id, v => setProfile('class_id', v), 'text',
                    [{ value: '', label: '— Select Class —' }, ...classes.map(c => ({ value: c.id, label: c.display_name }))]
                  )}
                  {field('Medium', editModal.studentProfile?.medium, v => setProfile('medium', v), 'text', [
                    { value: 'English', label: 'English' },
                    { value: 'Urdu', label: 'Urdu' },
                  ])}
                </div>
                
                <div>
                  {field('Address', editModal.studentProfile?.address, v => setProfile('address', v))}
                </div>

                {msg && <p style={{ margin: 0, fontSize: 13, color: msg.startsWith('✅') ? '#059669' : '#dc2626', fontWeight: 600 }}>{msg}</p>}
              </div>

              {/* Modal footer - Fixed Bottom */}
              <div style={{
                padding: '14px 22px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                gap: 10,
                justifyContent: 'flex-end',
                background: '#f8fafc',
                flexShrink: 0,
              }}>
                <button type="button" onClick={() => setEditModal(null)}
                  style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ padding: '8px 22px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #1e3a5f, #10b981)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 400, padding: 28, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>⚠️</div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Remove Student?</h2>
            <p style={{ margin: '8px 0 20px', fontSize: 13.5, color: '#64748b', lineHeight: 1.5 }}>
              You are about to permanently delete <strong>{deleteModal.full_name}</strong>. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setDeleteModal(null)}
                style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={saving}
                style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Removing…' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

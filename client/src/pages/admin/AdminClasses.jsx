import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showSubjectModal, setShowSubjectModal] = useState(null);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('info');
  const [form, setForm] = useState({ name: '', display_name: '', grade_level: '', section: 'A', description: '' });
  const [assignedSubjects, setAssignedSubjects] = useState([]);

  const fetchData = async () => {
    try {
      const [c, s] = await Promise.all([
        api.get('/classes'),
        api.get('/subjects'),
      ]);
      setClasses(c.data.classes || []);
      setSubjects(s.data.subjects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const showMessage = (text, type = 'info') => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(''), 4000);
  };

  const resetForm = () => setForm({ name: '', display_name: '', grade_level: '', section: 'A', description: '' });

  // ── Add Class ──
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/classes', form);
      showMessage('✅ Class created successfully!', 'success');
      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      showMessage('❌ ' + (err.response?.data?.error || 'Failed to create class'), 'danger');
    }
  };

  // ── Edit Class ──
  const openEdit = (cls) => {
    setForm({
      name: cls.name,
      display_name: cls.display_name,
      grade_level: cls.grade_level,
      section: cls.section || 'A',
      description: cls.description || '',
    });
    setShowEditModal(cls);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/classes/${showEditModal.id}`, form);
      showMessage('✅ Class updated!', 'success');
      setShowEditModal(null);
      resetForm();
      fetchData();
    } catch (err) {
      showMessage('❌ ' + (err.response?.data?.error || 'Failed to update'), 'danger');
    }
  };

  // ── Delete Class ──
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    try {
      await api.delete(`/classes/${id}`);
      showMessage('✅ Class deleted', 'success');
      fetchData();
    } catch (err) {
      showMessage('❌ ' + (err.response?.data?.error || 'Failed to delete'), 'danger');
    }
  };

  // ── Toggle Active ──
  const handleToggle = async (id) => {
    try {
      const r = await api.put(`/classes/${id}/toggle`);
      showMessage('✅ ' + r.data.message, 'success');
      fetchData();
    } catch (err) {
      showMessage('❌ Failed to toggle status', 'danger');
    }
  };

  // ── Subject Assignment ──
  const openSubjectAssign = (cls) => {
    setAssignedSubjects(cls.subjects?.map(s => s.id) || []);
    setShowSubjectModal(cls);
  };

  const toggleSubjectAssign = (subId) => {
    setAssignedSubjects(prev =>
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    );
  };

  const saveSubjectAssignment = async () => {
    try {
      await api.post(`/classes/${showSubjectModal.id}/subjects`, { subject_ids: assignedSubjects });
      showMessage('✅ Subjects assigned successfully!', 'success');
      setShowSubjectModal(null);
      fetchData();
    } catch (err) {
      showMessage('❌ ' + (err.response?.data?.error || 'Failed to assign subjects'), 'danger');
    }
  };

  // ── Stats ──
  const totalClasses = classes.length;
  const activeClasses = classes.filter(c => c.is_active).length;
  const totalBooks = classes.reduce((sum, c) => sum + (c.booksCount || 0), 0);
  const totalStudents = classes.reduce((sum, c) => sum + (c.studentsCount || 0), 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid var(--border-light)', borderTopColor: '#1e3a5f', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>🏫 Classes Management</h1>
          <p>Manage class levels KG to 8th • Assign subjects • Track enrollment</p>
        </div>
        <button onClick={() => { resetForm(); setShowAddModal(true); }} className="btn btn-primary">
          + Add New Class
        </button>
      </div>

      {msg && <div className={`alert alert-${msgType}`} style={{ justifyContent: 'center' }}>{msg}</div>}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Classes', value: totalClasses, color: '#1e3a5f', icon: '🏫' },
          { label: 'Active', value: activeClasses, color: '#10b981', icon: '✅' },
          { label: 'Total Books', value: totalBooks, color: '#f59e0b', icon: '📚' },
          { label: 'Total Students', value: totalStudents, color: '#8b5cf6', icon: '👨‍🎓' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
            <div className="stat-icon" style={{ background: `${s.color}12`, fontSize: 22 }}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Classes Table */}
      <div className="card" style={{ overflow: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Class</th>
              <th>Grade</th>
              <th>Subjects</th>
              <th>Books</th>
              <th>Students</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
                <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>📭</span>
                No classes found. Add your first class!
              </td></tr>
            ) : classes.map(cls => (
              <tr key={cls.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: cls.is_active ? 'linear-gradient(135deg, #1e3a5f, #3b82f6)' : 'var(--border-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0,
                    }}>
                      {cls.name === 'KG' ? 'KG' : cls.grade_level}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{cls.display_name}</div>
                      {cls.section && <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Section {cls.section}</div>}
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-info">{cls.grade_level === 0 ? 'Pre' : cls.grade_level}</span></td>
                <td>
                  <button onClick={() => openSubjectAssign(cls)}
                    className="btn btn-ghost btn-sm" style={{ fontSize: 12, padding: '4px 10px', color: '#8b5cf6' }}>
                    📖 {cls.subjectsCount || 0} subjects
                  </button>
                </td>
                <td><span style={{ fontWeight: 600 }}>{cls.booksCount || 0}</span></td>
                <td><span style={{ fontWeight: 600 }}>{cls.studentsCount || 0}</span></td>
                <td>
                  <button onClick={() => handleToggle(cls.id)}
                    className={`badge ${cls.is_active ? 'badge-success' : 'badge-danger'}`}
                    style={{ cursor: 'pointer', border: 'none', fontSize: 11 }}>
                    {cls.is_active ? '● Active' : '○ Inactive'}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => openSubjectAssign(cls)} className="btn btn-accent btn-sm" style={{ fontSize: 11, padding: '4px 10px' }}>
                      📖 Subjects
                    </button>
                    <button onClick={() => openEdit(cls)} className="btn btn-secondary btn-sm" style={{ fontSize: 11, padding: '4px 10px' }}>
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(cls.id)} className="btn btn-danger btn-sm" style={{ fontSize: 11, padding: '4px 10px' }}>
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ═══ ADD CLASS MODAL ═══ */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🏫 Add New Class</h2>
              <button onClick={() => setShowAddModal(false)} className="btn btn-ghost btn-sm">✕</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="form-label">Class Name *</label>
                    <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      required className="form-input" placeholder="e.g. KG, 1, 2..." />
                  </div>
                  <div>
                    <label className="form-label">Display Name *</label>
                    <input type="text" value={form.display_name} onChange={e => setForm({...form, display_name: e.target.value})}
                      required className="form-input" placeholder="e.g. Class 1, KG / Pre-1" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="form-label">Grade Level *</label>
                    <input type="number" min="0" max="12" value={form.grade_level}
                      onChange={e => setForm({...form, grade_level: e.target.value})}
                      required className="form-input" placeholder="0 for KG, 1-8" />
                  </div>
                  <div>
                    <label className="form-label">Section</label>
                    <input type="text" value={form.section} onChange={e => setForm({...form, section: e.target.value})}
                      className="form-input" placeholder="A, B, C..." />
                  </div>
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                    className="form-input" rows={2} placeholder="Optional class description" style={{ resize: 'vertical' }} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Class</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ EDIT CLASS MODAL ═══ */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(null)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Edit {showEditModal.display_name}</h2>
              <button onClick={() => setShowEditModal(null)} className="btn btn-ghost btn-sm">✕</button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="form-label">Class Name *</label>
                    <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      required className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Display Name *</label>
                    <input type="text" value={form.display_name} onChange={e => setForm({...form, display_name: e.target.value})}
                      required className="form-input" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="form-label">Grade Level *</label>
                    <input type="number" min="0" max="12" value={form.grade_level}
                      onChange={e => setForm({...form, grade_level: e.target.value})} required className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Section</label>
                    <input type="text" value={form.section} onChange={e => setForm({...form, section: e.target.value})}
                      className="form-input" />
                  </div>
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                    className="form-input" rows={2} style={{ resize: 'vertical' }} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowEditModal(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ SUBJECT ASSIGNMENT MODAL ═══ */}
      {showSubjectModal && (
        <div className="modal-overlay" onClick={() => setShowSubjectModal(null)}>
          <div className="modal-panel" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📖 Assign Subjects — {showSubjectModal.display_name}</h2>
              <button onClick={() => setShowSubjectModal(null)} className="btn btn-ghost btn-sm">✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                Select subjects to assign to this class. Students enrolled in this class will see these subjects.
              </p>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 8, maxHeight: 400, overflowY: 'auto', paddingRight: 4,
              }}>
                {subjects.map(sub => {
                  const isAssigned = assignedSubjects.includes(sub.id);
                  return (
                    <div key={sub.id}
                      onClick={() => toggleSubjectAssign(sub.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                        border: `1.5px solid ${isAssigned ? '#10b981' : 'var(--border-light)'}`,
                        background: isAssigned ? 'rgba(16,185,129,0.06)' : 'var(--bg-surface)',
                        transition: 'all 0.15s ease',
                      }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: 6,
                        border: `2px solid ${isAssigned ? '#10b981' : 'var(--border-medium)'}`,
                        background: isAssigned ? '#10b981' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, transition: 'all 0.15s ease',
                      }}>
                        {isAssigned && <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>✓</span>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{sub.name}</div>
                        {sub.name_urdu && <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }} dir="rtl">{sub.name_urdu}</div>}
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{sub.code}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, background: 'var(--bg-surface-2)', fontSize: 13 }}>
                <strong style={{ color: '#10b981' }}>{assignedSubjects.length}</strong> of {subjects.length} subjects selected
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowSubjectModal(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={saveSubjectAssignment} className="btn btn-accent">
                Save Assignment ({assignedSubjects.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

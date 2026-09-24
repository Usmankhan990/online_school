import { useState, useEffect } from 'react';
import api from '../../services/api';

const EMOJI_OPTIONS = ['📚','📖','📐','🔬','🌍','☪️','💻','📔','📓','📒','📕','📜','🗺️','🕌','🎨','🎵','🏃','🧪','📊','✏️'];
const COLOR_OPTIONS = ['#2563eb','#059669','#d97706','#7c3aed','#e11d48','#0d9488','#0891b2','#db2777','#4f46e5','#65a30d','#ea580c','#ca8a04','#0284c7','#c026d3','#64748b','#1e3a5f'];

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('info');
  const [form, setForm] = useState({ name: '', name_urdu: '', code: '', description: '', icon: '📚', color: '#64748b', class_ids: [] });

  const fetchData = async () => {
    try {
      const [r, c] = await Promise.all([
        api.get('/subjects'),
        api.get('/classes'),
      ]);
      setSubjects(r.data.subjects || []);
      setClasses(c.data.classes || []);
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

  const resetForm = () => setForm({ name: '', name_urdu: '', code: '', description: '', icon: '📚', color: '#64748b', class_ids: [] });

  // ── Add Subject ──
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/subjects', form);
      showMessage('✅ Subject created & assigned to classes!', 'success');
      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      setShowAddModal(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showMessage('❌ ' + (err.response?.data?.error || 'Failed'), 'danger');
    }
  };

  // ── Edit Subject ──
  const openEdit = (sub) => {
    setForm({
      name: sub.name,
      name_urdu: sub.name_urdu || '',
      code: sub.code || '',
      description: sub.description || '',
      icon: sub.icon || '📚',
      color: sub.color || '#64748b',
      class_ids: sub.classes ? sub.classes.map(c => c.id) : [],
    });
    setShowEditModal(sub);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/subjects/${showEditModal.id}`, form);
      showMessage('✅ Subject & class assignments updated!', 'success');
      setShowEditModal(null);
      resetForm();
      fetchData();
    } catch (err) {
      setShowEditModal(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showMessage('❌ ' + (err.response?.data?.error || 'Failed'), 'danger');
    }
  };

  // ── Delete ──
  const handleDelete = async (id) => {
    if (!confirm('Delete this subject?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      showMessage('✅ Subject deleted', 'success');
      fetchData();
    } catch (err) {
      showMessage('❌ ' + (err.response?.data?.error || 'Failed to delete'), 'danger');
    }
  };

  // ── Toggle ──
  const handleToggle = async (id) => {
    try {
      const r = await api.put(`/subjects/${id}/toggle`);
      showMessage('✅ ' + r.data.message, 'success');
      fetchData();
    } catch (err) {
      showMessage('❌ Failed to toggle', 'danger');
    }
  };

  const totalSubjects = subjects.length;
  const activeSubjects = subjects.filter(s => s.is_active).length;
  const totalClasses = subjects.reduce((sum, s) => sum + (s.classesCount || 0), 0);

  const filteredSubjects = subjects.filter(sub => {
    if (selectedClassFilter === 'all') return true;
    return sub.classes?.some(c => c.id === parseInt(selectedClassFilter));
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid var(--border-light)', borderTopColor: '#1e3a5f', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>Loading subjects...</p>
        </div>
      </div>
    );
  }

  // ── Form Modal (shared for Add/Edit) ──
  const renderFormModal = (isEdit = false) => {
    const onClose = () => { isEdit ? setShowEditModal(null) : setShowAddModal(false); resetForm(); };
    const onSubmit = isEdit ? handleEdit : handleAdd;
    const title = isEdit ? `✏️ Edit ${showEditModal?.name}` : '📖 Add New Subject';

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-panel" style={{ maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{title}</h2>
            <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
          </div>
          <form onSubmit={onSubmit}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Subject Name (English) *</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    required className="form-input" placeholder="e.g. Mathematics" />
                </div>
                <div>
                  <label className="form-label">Subject Name (Urdu)</label>
                  <input type="text" value={form.name_urdu} onChange={e => setForm({...form, name_urdu: e.target.value})}
                    className="form-input" dir="rtl" placeholder="اردو نام" />
                </div>
              </div>
              <div>
                <label className="form-label">Subject Code</label>
                <input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                  className="form-input" placeholder="e.g. MATH, ENG, SCI" style={{ textTransform: 'uppercase' }} />
                <p className="form-helper">Short unique code for identification</p>
              </div>

              {/* Class Selection Tabs / Multi-Select */}
              <div style={{
                padding: '12px 14px',
                borderRadius: 12,
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                  <div>
                    <label className="form-label" style={{ marginBottom: 0, fontWeight: 700, fontSize: 13 }}>
                      🏫 Applicable Classes / Grades
                    </label>
                    <p className="form-helper" style={{ margin: 0, fontSize: 11 }}>
                      Mention which class(es) have this subject/book ({form.class_ids?.length || 0} selected)
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, class_ids: classes.map(c => c.id) })}
                      className="btn btn-ghost btn-xs"
                      style={{ fontSize: 11, padding: '3px 8px', height: 'auto', border: '1px solid var(--border-light)' }}
                    >
                      All Classes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const primaryIds = classes.filter(c => c.grade_level !== undefined && c.grade_level <= 5).map(c => c.id);
                        setForm({ ...form, class_ids: primaryIds });
                      }}
                      className="btn btn-ghost btn-xs"
                      style={{ fontSize: 11, padding: '3px 8px', height: 'auto', border: '1px solid var(--border-light)' }}
                    >
                      KG-5th
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const middleIds = classes.filter(c => c.grade_level !== undefined && c.grade_level >= 6).map(c => c.id);
                        setForm({ ...form, class_ids: middleIds });
                      }}
                      className="btn btn-ghost btn-xs"
                      style={{ fontSize: 11, padding: '3px 8px', height: 'auto', border: '1px solid var(--border-light)' }}
                    >
                      6th-8th
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, class_ids: [] })}
                      className="btn btn-ghost btn-xs"
                      style={{ fontSize: 11, padding: '3px 8px', height: 'auto', color: 'var(--text-tertiary)', border: '1px solid var(--border-light)' }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 6 }}>
                  {classes.map(cls => {
                    const isSelected = form.class_ids?.includes(cls.id);
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => {
                          const current = form.class_ids || [];
                          const updated = isSelected ? current.filter(id => id !== cls.id) : [...current, cls.id];
                          setForm({ ...form, class_ids: updated });
                        }}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          transition: 'all 0.15s ease',
                          background: isSelected ? '#1e3a5f' : 'var(--bg-surface)',
                          color: isSelected ? '#ffffff' : 'var(--text-primary)',
                          border: isSelected ? '1.5px solid #1e3a5f' : '1px solid var(--border-light)',
                          boxShadow: isSelected ? '0 2px 6px rgba(30, 58, 95, 0.25)' : 'none',
                        }}
                      >
                        <span style={{ fontSize: 12 }}>{isSelected ? '✓' : '+'}</span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cls.display_name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="form-input" rows={2} placeholder="Optional description" style={{ resize: 'vertical' }} />
              </div>
              {/* Icon Picker */}
              <div>
                <label className="form-label">Icon</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {EMOJI_OPTIONS.map(emoji => (
                    <button key={emoji} type="button" onClick={() => setForm({...form, icon: emoji})}
                      style={{
                        width: 38, height: 38, borderRadius: 8, border: `2px solid ${form.icon === emoji ? '#1e3a5f' : 'var(--border-light)'}`,
                        background: form.icon === emoji ? 'rgba(30,58,95,0.08)' : 'var(--bg-surface)',
                        cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}>
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              {/* Color Picker */}
              <div>
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {COLOR_OPTIONS.map(c => (
                    <button key={c} type="button" onClick={() => setForm({...form, color: c})}
                      style={{
                        width: 32, height: 32, borderRadius: 8, background: c, border: `3px solid ${form.color === c ? 'var(--text-primary)' : 'transparent'}`,
                        cursor: 'pointer', transition: 'all 0.15s ease',
                        boxShadow: form.color === c ? '0 0 0 2px var(--bg-surface), 0 0 0 4px ' + c : 'none',
                      }} />
                  ))}
                </div>
              </div>
              {/* Preview */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 10,
                background: 'var(--bg-surface-2)', border: '1px solid var(--border-light)',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: form.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>{form.icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {form.name || 'Subject Name'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    {form.code || 'CODE'} • {form.class_ids?.length || 0} class(es) linked
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">{isEdit ? 'Save Changes' : 'Create Subject'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in" className="flex flex-col gap-5 min-w-0">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>📖 Subjects Management</h1>
          <p>Manage curriculum subjects • Assign to classes • Track usage</p>
        </div>
        <button onClick={() => { resetForm(); setShowAddModal(true); }} className="btn btn-primary">
          + Add New Subject
        </button>
      </div>

      {msg && <div className={`alert alert-${msgType}`} style={{ justifyContent: 'center' }}>{msg}</div>}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Subjects', value: totalSubjects, color: '#1e3a5f', icon: '📖' },
          { label: 'Active', value: activeSubjects, color: '#10b981', icon: '✅' },
          { label: 'Total Class Links', value: totalClasses, color: '#8b5cf6', icon: '🔗' },
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

      {/* Class Filter Tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        <button
          onClick={() => setSelectedClassFilter('all')}
          className={`btn btn-sm ${selectedClassFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 20, fontSize: 12 }}
        >
          All Classes ({subjects.length})
        </button>
        {classes.map(c => {
          const count = subjects.filter(s => s.classes?.some(sc => sc.id === c.id)).length;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedClassFilter(String(c.id))}
              className={`btn btn-sm ${selectedClassFilter === String(c.id) ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 20, fontSize: 12, whiteSpace: 'nowrap' }}
            >
              {c.display_name} ({count})
            </button>
          );
        })}
      </div>

      {/* Subjects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {filteredSubjects.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center', gridColumn: '1 / -1' }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📭</span>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No Subjects Found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {selectedClassFilter === 'all' ? 'Create your first subject to get started.' : 'No subjects assigned to this class yet.'}
            </p>
          </div>
        ) : filteredSubjects.map(sub => (
          <div key={sub.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Color Bar Top */}
            <div style={{ height: 4, background: sub.color || '#64748b' }} />
            <div style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: (sub.color || '#64748b') + '18',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0,
                }}>
                  {sub.icon || '📚'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{sub.name}</h3>
                  {sub.name_urdu && <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '2px 0 0' }} dir="rtl">{sub.name_urdu}</p>}
                </div>
                <button onClick={() => handleToggle(sub.id)}
                  className={`badge ${sub.is_active ? 'badge-success' : 'badge-danger'}`}
                  style={{ cursor: 'pointer', border: 'none', fontSize: 10, flexShrink: 0 }}>
                  {sub.is_active ? '● Active' : '○ Inactive'}
                </button>
              </div>

              {/* Info Row */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {sub.code && <span className="badge badge-info" style={{ fontSize: 11 }}>{sub.code}</span>}
                <span className="badge badge-purple" style={{ fontSize: 11 }}>🔗 {sub.classesCount || sub.classes?.length || 0} classes</span>
              </div>

              {/* Classes Using */}
              {sub.classes && sub.classes.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>Assigned to:</p>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {sub.classes.map(c => (
                      <span key={c.id} className="badge badge-neutral" style={{ fontSize: 10 }}>{c.display_name}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, borderTop: '1px solid var(--border-light)', paddingTop: 12 }}>
                <button onClick={() => openEdit(sub)} className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: 12 }}>
                  ✏️ Edit
                </button>
                <button onClick={() => handleDelete(sub.id)} className="btn btn-danger btn-sm" style={{ fontSize: 12, padding: '6px 12px' }}>
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {showAddModal && renderFormModal(false)}
      {showEditModal && renderFormModal(true)}
    </div>
  );
}

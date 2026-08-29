import { useState, useEffect } from 'react';
import api from '../../services/api';

const EMOJI_OPTIONS = ['📚','📖','📐','🔬','🌍','☪️','💻','📔','📓','📒','📕','📜','🗺️','🕌','🎨','🎵','🏃','🧪','📊','✏️'];
const COLOR_OPTIONS = ['#2563eb','#059669','#d97706','#7c3aed','#e11d48','#0d9488','#0891b2','#db2777','#4f46e5','#65a30d','#ea580c','#ca8a04','#0284c7','#c026d3','#64748b','#1e3a5f'];

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('info');
  const [form, setForm] = useState({ name: '', name_urdu: '', code: '', description: '', icon: '📚', color: '#64748b' });

  const fetchData = async () => {
    try {
      const r = await api.get('/subjects');
      setSubjects(r.data.subjects || []);
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

  const resetForm = () => setForm({ name: '', name_urdu: '', code: '', description: '', icon: '📚', color: '#64748b' });

  // ── Add Subject ──
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/subjects', form);
      showMessage('✅ Subject created!', 'success');
      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (err) {
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
    });
    setShowEditModal(sub);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/subjects/${showEditModal.id}`, form);
      showMessage('✅ Subject updated!', 'success');
      setShowEditModal(null);
      resetForm();
      fetchData();
    } catch (err) {
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
        <div className="modal-panel" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{title}</h2>
            <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
          </div>
          <form onSubmit={onSubmit}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
                    {form.code || 'CODE'} • Preview
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
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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

      {/* Subjects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {subjects.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center', gridColumn: '1 / -1' }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📭</span>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>No Subjects Found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Create your first subject to get started.</p>
          </div>
        ) : subjects.map(sub => (
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
                <span className="badge badge-purple" style={{ fontSize: 11 }}>🔗 {sub.classesCount || 0} classes</span>
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

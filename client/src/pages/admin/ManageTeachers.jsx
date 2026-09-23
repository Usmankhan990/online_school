import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api, { FILE_BASE } from '../../services/api';
import {
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineDocumentDownload,
  HiOutlineExternalLink,
  HiOutlineSearch,
  HiOutlineUser,
} from 'react-icons/hi';
import PageLoader from '../../components/PageLoader';

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'active' | 'rejected'
  const [genderFilter, setGenderFilter] = useState('all'); // 'all' | 'male' | 'female'
  const [searchQuery, setSearchQuery] = useState('');
  const [viewModal, setViewModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTeachers = () => {
    api.get('/admin/teachers')
      .then(res => setTeachers(res.data.teachers || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      await api.put(`/admin/approve-teacher/${id}`);
      if (viewModal?.id === id) {
        setViewModal(null);
      }
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve teacher.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      setActionLoading(true);
      await api.put(`/admin/reject-teacher/${rejectModal}`, { reason: rejectReason });
      if (viewModal?.id === rejectModal) {
        setViewModal(null);
      }
      setRejectModal(null);
      setRejectReason('');
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject teacher.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this teacher record?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      if (viewModal?.id === id) setViewModal(null);
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete teacher.');
    }
  };

  // Counts
  const pendingCount = teachers.filter(t => t.status === 'pending').length;
  const activeCount = teachers.filter(t => t.status === 'active').length;
  const rejectedCount = teachers.filter(t => t.status === 'rejected').length;

  // Filtered teachers
  const filteredTeachers = teachers.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (genderFilter !== 'all') {
      const g = (t.gender || t.teacherProfile?.gender || '').toLowerCase();
      if (g !== genderFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.full_name?.toLowerCase().includes(q);
      const matchEmail = t.email?.toLowerCase().includes(q);
      const matchPhone = t.phone?.includes(q);
      const matchSpec = t.teacherProfile?.specialization?.toLowerCase().includes(q);
      const matchCity = t.teacherProfile?.city?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchSpec && !matchCity) return false;
    }
    return true;
  });

  if (loading) {
    return <PageLoader text="Loading teacher profiles..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Teachers & Applications</h1>
          <p className="text-dark-400 text-sm mt-1">
            Review teacher recruitment applications, approve or reject staff, and manage teacher profiles.
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="badge badge-warning text-sm px-3.5 py-1.5 font-bold">
            ⏳ {pendingCount} Pending Review
          </span>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { key: 'all', label: 'All Teachers', count: teachers.length },
            { key: 'pending', label: 'Pending Applications', count: pendingCount, color: '#f59e0b' },
            { key: 'active', label: 'Active Staff', count: activeCount, color: '#10b981' },
            { key: 'rejected', label: 'Rejected', count: rejectedCount, color: '#ef4444' },
          ].map(tab => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: isActive ? '2px solid #1e3a5f' : '1px solid #e2e8f0',
                  background: isActive ? '#eff6ff' : '#ffffff',
                  color: isActive ? '#1e3a5f' : '#64748b',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    background: isActive ? (tab.color || '#1e3a5f') : '#f1f5f9',
                    color: isActive ? '#ffffff' : '#64748b',
                    padding: '2px 8px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 800
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Gender Dropdown */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={genderFilter}
            onChange={e => setGenderFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              fontSize: 13,
              fontWeight: 600,
              color: '#334155'
            }}
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <div style={{ position: 'relative', minWidth: 200 }}>
            <HiOutlineSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
            <input
              type="text"
              placeholder="Search teacher..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                fontSize: 13,
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Teachers Table Card */}
      {filteredTeachers.length === 0 ? (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
          <HiOutlineUser size={44} style={{ color: '#94a3b8', margin: '0 auto 12px', opacity: 0.6 }} />
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>No Teachers Found</h3>
          <p style={{ color: '#64748b', fontSize: 13.5 }}>
            {statusFilter === 'pending'
              ? 'No pending teacher applications waiting for approval.'
              : 'No teacher records match the current filter or search criteria.'}
          </p>
        </div>
      ) : (
        <div className="card" style={{ border: '1px solid #e2e8f0', borderRadius: 12, background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 800 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Teacher</th>
                  <th style={{ padding: '12px 10px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Qualification & Spec</th>
                  <th style={{ padding: '12px 10px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>City & Location</th>
                  <th style={{ padding: '12px 10px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Salary Account (Easypaisa)</th>
                  <th style={{ padding: '12px 8px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Documents</th>
                  <th style={{ padding: '12px 10px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px 14px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map(teacher => {
                  const photo = teacher.avatar || teacher.teacherProfile?.photo;
                  const profile = teacher.teacherProfile || {};
                  const isPending = teacher.status === 'pending';
                  const isActive = teacher.status === 'active';
                  const isRejected = teacher.status === 'rejected';

                  // Count documents
                  const hasCnic = !!profile.cnic_file;
                  const hasCv = !!profile.cv_file;
                  const hasDegrees = !!profile.degree_files;
                  const docCount = (hasCnic ? 1 : 0) + (hasCv ? 1 : 0) + (hasDegrees ? 1 : 0);

                  return (
                    <tr
                      key={teacher.id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                      onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseOut={e => e.currentTarget.style.background = '#ffffff'}
                    >
                      {/* Teacher overview */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {photo ? (
                            <img
                              src={`${FILE_BASE}/uploads/${photo}`}
                              alt={teacher.full_name}
                              style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover', border: '1px solid #e2e8f0', flexShrink: 0 }}
                            />
                          ) : (
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                              {teacher.full_name?.charAt(0)}
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{teacher.full_name}</span>
                              {teacher.gender && (
                                <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 999, fontWeight: 700, background: teacher.gender === 'female' ? '#fdf2f8' : '#eff6ff', color: teacher.gender === 'female' ? '#db2777' : '#2563eb', border: `1px solid ${teacher.gender === 'female' ? '#fbcfe8' : '#bfdbfe'}` }}>
                                  {teacher.gender === 'female' ? 'F' : 'M'}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{teacher.email}</div>
                            {teacher.phone && (
                              <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, marginTop: 1 }}>📞 {teacher.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Qualification */}
                      <td style={{ padding: '12px 10px', fontSize: 12.5 }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{profile.qualification || '-'}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{profile.specialization || 'General'}</div>
                        {profile.experience_years !== undefined && profile.experience_years !== null && (
                          <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 1 }}>Exp: {profile.experience_years} Year(s)</div>
                        )}
                      </td>

                      {/* Location */}
                      <td style={{ padding: '12px 10px', fontSize: 12.5 }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{profile.city || '-'}</div>
                        {profile.address && (
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 1, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={profile.address}>
                            {profile.address}
                          </div>
                        )}
                      </td>

                      {/* Salary Account */}
                      <td style={{ padding: '12px 10px', fontSize: 12.5 }}>
                        {profile.easypaisa_number ? (
                          <div>
                            <div style={{ fontWeight: 700, color: '#059669', fontSize: 12 }}>📱 {profile.easypaisa_number}</div>
                            {profile.account_holder_name && (
                              <div style={{ fontSize: 11, color: '#475569', marginTop: 1 }}>👤 {profile.account_holder_name}</div>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: 11.5, color: '#94a3b8', fontStyle: 'italic' }}>Not provided</span>
                        )}
                      </td>

                      {/* Documents */}
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        {docCount > 0 ? (
                          <span
                            onClick={() => setViewModal(teacher)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#0284c7',
                              background: '#f0f9ff',
                              border: '1px solid #bae6fd',
                              padding: '3px 8px',
                              borderRadius: 999,
                              cursor: 'pointer'
                            }}
                            title="Click to view documents"
                          >
                            📎 {docCount} Doc{docCount > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: '#cbd5e1' }}>-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                        {isPending && (
                          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
                            ⏳ Pending
                          </span>
                        )}
                        {isActive && (
                          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                            ✅ Active
                          </span>
                        )}
                        {isRejected && (
                          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }} title={teacher.rejection_reason || 'Rejected'}>
                            ❌ Rejected
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                          {/* Preview button */}
                          <button
                            onClick={() => setViewModal(teacher)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              padding: '5px 9px', borderRadius: 7,
                              background: '#f8fafc', color: '#475569',
                              border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 700,
                              cursor: 'pointer', transition: 'all 0.15s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'}
                            onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}
                            title="View Full Profile & Application"
                          >
                            <HiOutlineEye size={13} /> View
                          </button>

                          {/* Approve button */}
                          {!isActive && (
                            <button
                              onClick={() => handleApprove(teacher.id)}
                              disabled={actionLoading}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 3,
                                padding: '5px 9px', borderRadius: 7,
                                background: '#ecfdf5', color: '#059669',
                                border: '1px solid #a7f3d0', fontSize: 11, fontWeight: 700,
                                cursor: 'pointer', transition: 'all 0.15s'
                              }}
                              onMouseOver={e => e.currentTarget.style.background = '#d1fae5'}
                              onMouseOut={e => e.currentTarget.style.background = '#ecfdf5'}
                              title="Approve Teacher Application"
                            >
                              <HiOutlineCheck size={13} /> Approve
                            </button>
                          )}

                          {/* Reject button */}
                          {!isRejected && (
                            <button
                              onClick={() => setRejectModal(teacher.id)}
                              disabled={actionLoading}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 3,
                                padding: '5px 9px', borderRadius: 7,
                                background: '#fef2f2', color: '#dc2626',
                                border: '1px solid #fecaca', fontSize: 11, fontWeight: 700,
                                cursor: 'pointer', transition: 'all 0.15s'
                              }}
                              onMouseOver={e => e.currentTarget.style.background = '#fee2e2'}
                              onMouseOut={e => e.currentTarget.style.background = '#fef2f2'}
                              title="Reject Teacher Application"
                            >
                              <HiOutlineX size={13} /> Reject
                            </button>
                          )}

                          {/* Delete button */}
                          <button
                            onClick={() => handleDelete(teacher.id)}
                            style={{
                              display: 'inline-flex', alignItems: 'center',
                              padding: '5px 7px', borderRadius: 7,
                              background: '#fff', color: '#ef4444',
                              border: '1px solid #fee2e2', fontSize: 11,
                              cursor: 'pointer', transition: 'all 0.15s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = '#fee2e2'}
                            onMouseOut={e => e.currentTarget.style.background = '#fff'}
                            title="Delete Teacher Record"
                          >
                            <HiOutlineTrash size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── FULL TEACHER APPLICATION PREVIEW MODAL ── */}
      {viewModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 12px' }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            width: '100%',
            maxWidth: 680,
            maxHeight: 'min(90vh, 720px)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', flexShrink: 0 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>👨‍🏫 Teacher Application & Profile</h2>
                  {viewModal.status === 'pending' && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
                      ⏳ Pending Approval
                    </span>
                  )}
                  {viewModal.status === 'active' && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                      ✅ Active Teacher
                    </span>
                  )}
                  {viewModal.status === 'rejected' && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                      ❌ Rejected
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, marginTop: 2, fontSize: 12, color: '#64748b' }}>
                  Registered on: {new Date(viewModal.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => setViewModal(null)}
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#94a3b8', padding: 4, borderRadius: 6, lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{
              padding: '20px 22px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}>
              {/* Rejection Alert Banner */}
              {viewModal.status === 'rejected' && viewModal.rejection_reason && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px' }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#dc2626' }}>❌ Rejection Reason:</p>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#7f1d1d' }}>{viewModal.rejection_reason}</p>
                </div>
              )}

              {/* Section 1: Profile & Contact */}
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {viewModal.avatar || viewModal.teacherProfile?.photo ? (
                    <img
                      src={`${FILE_BASE}/uploads/${viewModal.avatar || viewModal.teacherProfile?.photo}`}
                      alt={viewModal.full_name}
                      style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', border: '2px solid #3b82f6', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{ width: 64, height: 64, borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 800, flexShrink: 0 }}>
                      {viewModal.full_name?.charAt(0)}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>{viewModal.full_name}</h3>
                      {viewModal.gender && (
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, fontWeight: 700, background: viewModal.gender === 'female' ? '#fdf2f8' : '#eff6ff', color: viewModal.gender === 'female' ? '#db2777' : '#2563eb', border: `1px solid ${viewModal.gender === 'female' ? '#fbcfe8' : '#bfdbfe'}` }}>
                          {viewModal.gender === 'female' ? 'Female Teacher' : 'Male Teacher'}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12.5, color: '#64748b', margin: '3px 0 0' }}>✉️ {viewModal.email}</p>
                    {viewModal.phone && (
                      <p style={{ fontSize: 12.5, color: '#0f172a', fontWeight: 600, margin: '2px 0 0' }}>📞 {viewModal.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Location Information */}
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📍</span> Location & Address
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, fontSize: 12.5 }}>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>City:</span>
                    <p style={{ margin: '2px 0 0', fontWeight: 700, color: '#0f172a' }}>{viewModal.teacherProfile?.city || '-'}</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Address (as per CNIC):</span>
                    <p style={{ margin: '2px 0 0', fontWeight: 700, color: '#0f172a' }}>{viewModal.teacherProfile?.address || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Section 3: Academic & Experience */}
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🎓</span> Qualification & Experience
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, fontSize: 12.5 }}>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Qualification:</span>
                    <p style={{ margin: '2px 0 0', fontWeight: 700, color: '#0f172a' }}>{viewModal.teacherProfile?.qualification || '-'}</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Subject Specialization:</span>
                    <p style={{ margin: '2px 0 0', fontWeight: 700, color: '#0f172a' }}>{viewModal.teacherProfile?.specialization || '-'}</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Experience:</span>
                    <p style={{ margin: '2px 0 0', fontWeight: 700, color: '#0f172a' }}>
                      {viewModal.teacherProfile?.experience_years ? `${viewModal.teacherProfile.experience_years} Year(s)` : 'Fresh'}
                    </p>
                  </div>
                </div>
                {viewModal.teacherProfile?.bio && (
                  <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed #cbd5e1' }}>
                    <span style={{ color: '#64748b', fontWeight: 600, fontSize: 12 }}>Short Bio / Introduction:</span>
                    <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#334155', fontStyle: 'italic' }}>"{viewModal.teacherProfile.bio}"</p>
                  </div>
                )}
              </div>

              {/* Section 4: Uploaded Official Documents */}
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🪪</span> Official Attached Documents
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {/* CNIC Documents */}
                  {viewModal.teacherProfile?.cnic_file ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {viewModal.teacherProfile.cnic_file.split(',').map((fname, idx, arr) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 20 }}>🪪</span>
                            <div>
                              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>
                                {arr.length > 1 ? (idx === 0 ? 'CNIC Front Side' : 'CNIC Back Side') : 'CNIC Document'}
                              </p>
                              <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{fname.trim()}</p>
                            </div>
                          </div>
                          <a
                            href={`${FILE_BASE}/uploads/${fname.trim()}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '6px 12px', borderRadius: 8, background: '#f0fdf4',
                              color: '#16a34a', border: '1px solid #bbf7d0', fontSize: 12, fontWeight: 700, textDecoration: 'none'
                            }}
                          >
                            <HiOutlineExternalLink size={14} /> Open
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>No CNIC document attached.</p>
                  )}

                  {/* CV Document */}
                  {viewModal.teacherProfile?.cv_file && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 20 }}>📄</span>
                        <div>
                          <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>Resume / CV</p>
                          <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{viewModal.teacherProfile.cv_file}</p>
                        </div>
                      </div>
                      <a
                        href={`${FILE_BASE}/uploads/${viewModal.teacherProfile.cv_file}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '6px 12px', borderRadius: 8, background: '#eff6ff',
                          color: '#2563eb', border: '1px solid #bfdbfe', fontSize: 12, fontWeight: 700, textDecoration: 'none'
                        }}
                      >
                        <HiOutlineDocumentDownload size={14} /> View CV
                      </a>
                    </div>
                  )}

                  {/* Degree Files */}
                  {viewModal.teacherProfile?.degree_files && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {viewModal.teacherProfile.degree_files.split(',').map((df, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 20 }}>📜</span>
                            <div>
                              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: '#0f172a' }}>Degree / Certificate {idx + 1}</p>
                              <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{df.trim()}</p>
                            </div>
                          </div>
                          <a
                            href={`${FILE_BASE}/uploads/${df.trim()}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '6px 12px', borderRadius: 8, background: '#f8fafc',
                              color: '#475569', border: '1px solid #cbd5e1', fontSize: 12, fontWeight: 700, textDecoration: 'none'
                            }}
                          >
                            <HiOutlineExternalLink size={14} /> Open
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 5: Salary & Easypaisa */}
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>💳</span> Salary Account Details (Easypaisa)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, fontSize: 12.5 }}>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Easypaisa Number:</span>
                    <p style={{ margin: '2px 0 0', fontWeight: 800, color: '#059669', fontSize: 13 }}>
                      {viewModal.teacherProfile?.easypaisa_number || '-'}
                    </p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Account Title:</span>
                    <p style={{ margin: '2px 0 0', fontWeight: 700, color: '#0f172a' }}>{viewModal.teacherProfile?.account_title || '-'}</p>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>Account Holder Name:</span>
                    <p style={{ margin: '2px 0 0', fontWeight: 700, color: '#0f172a' }}>{viewModal.teacherProfile?.account_holder_name || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div style={{ padding: '14px 22px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => setViewModal(null)}
                style={{ padding: '8px 16px', borderRadius: 8, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Close
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                {viewModal.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => {
                      const id = viewModal.id;
                      setRejectModal(id);
                    }}
                    disabled={actionLoading}
                    style={{ padding: '8px 16px', borderRadius: 8, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <HiOutlineX size={15} /> Reject Application
                  </button>
                )}
                {viewModal.status !== 'active' && (
                  <button
                    type="button"
                    onClick={() => handleApprove(viewModal.id)}
                    disabled={actionLoading}
                    style={{ padding: '8px 18px', borderRadius: 8, background: '#10b981', color: '#ffffff', border: 'none', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <HiOutlineCheck size={15} /> Approve Teacher
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── REJECT REASON MODAL ── */}
      {rejectModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 999999, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440, padding: '22px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 800, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>⚠️</span> Reject Teacher Application
            </h3>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: '#64748b' }}>
              Please provide the reason for rejecting this application (the applicant will see this notification).
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Incomplete qualifications, invalid CNIC document, or experience requirements not met..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button
                type="button"
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                style={{ padding: '8px 16px', borderRadius: 8, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading}
                style={{ padding: '8px 16px', borderRadius: 8, background: '#dc2626', color: '#fff', border: 'none', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

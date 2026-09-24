import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api, { FILE_BASE } from '../../services/api';
import { HiOutlineCheck, HiOutlineX, HiOutlineDocumentDownload, HiOutlineEye, HiOutlineExternalLink } from 'react-icons/hi';
import PageLoader from '../../components/PageLoader';

export default function PendingStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModal, setViewModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchPending = () => {
    api.get('/admin/pending-students')
      .then(res => setStudents(res.data.students || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/approve-student/${id}`);
      if (viewModal?.id === id) setViewModal(null);
      fetchPending();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve student.');
    }
  };

  const handleReject = async () => {
    try {
      await api.put(`/admin/reject-student/${rejectModal}`, { reason: rejectReason });
      if (viewModal?.id === rejectModal) setViewModal(null);
      setRejectModal(null);
      setRejectReason('');
      fetchPending();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject student.');
    }
  };

  if (loading) {
    return <PageLoader text="Loading pending registrations..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-dark-400 text-sm mt-1">{students.length} student application(s) waiting for review & admission approval</p>
        </div>
        <span className="badge badge-warning text-base px-4 py-1">{students.length} Pending</span>
      </div>

      {students.length === 0 ? (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 12 }}>
          <HiOutlineCheck size={48} style={{ color: '#10b981', margin: '0 auto 12px', opacity: 0.6 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>All Clear!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No pending student registrations waiting for approval.</p>
        </div>
      ) : (
        <div className="card" style={{ border: '1px solid var(--border-light)', borderRadius: 12, background: 'var(--bg-surface)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '100%' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-2)', borderBottom: '1.5px solid var(--border-light)' }}>
                  <th style={{ padding: '12px 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student</th>
                  <th style={{ padding: '12px 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Class & Medium</th>
                  <th style={{ padding: '12px 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Father / CNIC</th>
                  <th style={{ padding: '12px 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Numbers</th>
                  <th style={{ padding: '12px 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Parent Email</th>
                  <th style={{ padding: '12px 8px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Docs</th>
                  <th style={{ padding: '12px 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr
                    key={student.id}
                    style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg-surface-2)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                          {student.full_name?.charAt(0)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{student.full_name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{student.email}</div>
                          <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)', marginTop: 1 }}>
                            {student.gender || student.studentProfile?.gender || 'Male'} • DOB: {student.studentProfile?.date_of_birth || '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 5, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', fontSize: 11, fontWeight: 700 }}>
                        {student.studentProfile?.class?.display_name || 'N/A'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, fontWeight: 500 }}>
                        {student.studentProfile?.medium || 'English'} Medium
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {student.studentProfile?.father_name || '-'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'monospace', marginTop: 2 }}>
                        {student.studentProfile?.father_cnic || '-'}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                        Relation: {student.studentProfile?.guardian_relation || 'Father'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'monospace' }}>
                        {student.phone || student.studentProfile?.contact_number_1 || '-'}
                      </div>
                      {student.studentProfile?.contact_number_2 && student.studentProfile?.contact_number_2 !== student.studentProfile?.contact_number_1 && (
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'monospace', marginTop: 1 }}>
                          Alt: {student.studentProfile?.contact_number_2}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ fontSize: 12, color: student.studentProfile?.parent_email ? 'var(--text-primary)' : 'var(--text-tertiary)', wordBreak: 'break-all' }}>
                        {student.studentProfile?.parent_email || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {student.documents?.length > 0 ? (
                        <button
                          onClick={() => setViewModal(student)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 6, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                          title="View uploaded documents"
                        >
                          <HiOutlineDocumentDownload size={13} />
                          {student.documents.length} Docs
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>No Docs</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        <button
                          onClick={() => setViewModal(student)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            padding: '5px 9px', borderRadius: 7,
                            background: 'var(--bg-surface-2)', color: 'var(--text-primary)',
                            border: '1px solid var(--border-light)', fontSize: 11, fontWeight: 700,
                            cursor: 'pointer', transition: 'all 0.15s'
                          }}
                          onMouseOver={e => e.currentTarget.style.background = 'var(--border-light)'}
                          onMouseOut={e => e.currentTarget.style.background = 'var(--bg-surface-2)'}
                          title="View full admission application details"
                        >
                          <HiOutlineEye size={13} /> View
                        </button>
                        <button
                          onClick={() => handleApprove(student.id)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            padding: '5px 9px', borderRadius: 7,
                            background: 'rgba(16, 185, 129, 0.15)', color: '#10b981',
                            border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: 11, fontWeight: 700,
                            cursor: 'pointer', transition: 'all 0.15s'
                          }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.25)'}
                          onMouseOut={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'}
                          title="Approve student"
                        >
                          <HiOutlineCheck size={13} /> Approve
                        </button>
                        <button
                          onClick={() => setRejectModal(student.id)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            padding: '5px 9px', borderRadius: 7,
                            background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: 11, fontWeight: 700,
                            cursor: 'pointer', transition: 'all 0.15s'
                          }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'}
                          onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                          title="Reject student"
                        >
                          <HiOutlineX size={13} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── FULL ADMISSION DETAILS MODAL ── */}
      {viewModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'var(--bg-overlay, rgba(12, 10, 9, 0.85))', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 12px' }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 16,
            width: '100%',
            maxWidth: 680,
            maxHeight: 'min(90vh, 700px)',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface)', flexShrink: 0 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--text-primary)' }}>📋 Student Admission Application</h2>
                <p style={{ margin: 0, marginTop: 2, fontSize: 12, color: 'var(--text-secondary)' }}>
                  Roll No: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{viewModal.studentProfile?.roll_number || 'Pending Assignment'}</span>
                </p>
              </div>
              <button onClick={() => setViewModal(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4, borderRadius: 6, lineHeight: 1 }}>✕</button>
            </div>

            {/* Modal Body - Scrollable without visible scrollbar */}
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
              <div style={{ background: 'var(--bg-surface-2)', padding: 16, borderRadius: 12, border: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>👤</span> Student Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px 14px', fontSize: 13 }}>
                  <div style={{ minWidth: 0 }}><span style={{ color: 'var(--text-secondary)', fontSize: 11, display: 'block' }}>Full Name</span><strong style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}>{viewModal.full_name}</strong></div>
                  <div style={{ minWidth: 0 }}><span style={{ color: 'var(--text-secondary)', fontSize: 11, display: 'block' }}>Login Email</span><strong style={{ color: 'var(--text-primary)', wordBreak: 'break-all', overflowWrap: 'anywhere', display: 'block' }}>{viewModal.email}</strong></div>
                  <div style={{ minWidth: 0 }}><span style={{ color: 'var(--text-secondary)', fontSize: 11, display: 'block' }}>Phone</span><strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace', wordBreak: 'break-word' }}>{viewModal.phone || viewModal.studentProfile?.contact_number_1 || '-'}</strong></div>
                  <div style={{ minWidth: 0 }}><span style={{ color: 'var(--text-secondary)', fontSize: 11, display: 'block' }}>Gender</span><strong style={{ color: 'var(--text-primary)' }}>{viewModal.gender || viewModal.studentProfile?.gender || 'Male'}</strong></div>
                  <div style={{ minWidth: 0 }}><span style={{ color: 'var(--text-secondary)', fontSize: 11, display: 'block' }}>Date of Birth</span><strong style={{ color: 'var(--text-primary)' }}>{viewModal.studentProfile?.date_of_birth || '-'}</strong></div>
                  <div style={{ minWidth: 0 }}><span style={{ color: 'var(--text-secondary)', fontSize: 11, display: 'block' }}>Applied Class</span><span style={{ fontWeight: 800, color: '#3b82f6', display: 'block' }}>{viewModal.studentProfile?.class?.display_name || 'N/A'}</span></div>
                  <div style={{ minWidth: 0 }}><span style={{ color: 'var(--text-secondary)', fontSize: 11, display: 'block' }}>Medium</span><strong style={{ color: 'var(--text-primary)' }}>{viewModal.studentProfile?.medium || 'English'}</strong></div>
                </div>
              </div>

              {/* Section 2: Parent & Guardian Details */}
              <div style={{ background: 'var(--bg-surface-2)', padding: 16, borderRadius: 12, border: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>👨‍👩‍👦</span> Parent / Guardian Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px 14px', fontSize: 13 }}>
                  <div style={{ minWidth: 0 }}><span style={{ color: 'var(--text-secondary)', fontSize: 11, display: 'block' }}>Guardian Relation</span><strong style={{ color: 'var(--text-primary)' }}>{viewModal.studentProfile?.guardian_relation || 'Father'}</strong></div>
                  <div style={{ minWidth: 0 }}><span style={{ color: 'var(--text-secondary)', fontSize: 11, display: 'block' }}>Father Name</span><strong style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}>{viewModal.studentProfile?.father_name || '-'}</strong></div>
                  <div style={{ minWidth: 0 }}><span style={{ color: 'var(--text-secondary)', fontSize: 11, display: 'block' }}>Mother Name</span><strong style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}>{viewModal.studentProfile?.mother_name || '-'}</strong></div>
                  <div style={{ minWidth: 0 }}><span style={{ color: 'var(--text-secondary)', fontSize: 11, display: 'block' }}>Father / Parent CNIC</span><strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{viewModal.studentProfile?.father_cnic || '-'}</strong></div>
                  <div style={{ minWidth: 0 }}><span style={{ color: 'var(--text-secondary)', fontSize: 11, display: 'block' }}>Parent Email</span><strong style={{ color: 'var(--text-primary)', wordBreak: 'break-all', overflowWrap: 'anywhere', display: 'block' }}>{viewModal.studentProfile?.parent_email || '-'}</strong></div>
                  <div style={{ minWidth: 0 }}><span style={{ color: 'var(--text-secondary)', fontSize: 11, display: 'block' }}>Contact Number 1</span><strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{viewModal.studentProfile?.contact_number_1 || viewModal.phone || '-'}</strong></div>
                  <div style={{ minWidth: 0 }}><span style={{ color: 'var(--text-secondary)', fontSize: 11, display: 'block' }}>Contact Number 2</span><strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{viewModal.studentProfile?.contact_number_2 || 'None'}</strong></div>
                </div>
              </div>

              {/* Section 3: Residential Address */}
              <div style={{ background: 'var(--bg-surface-2)', padding: 16, borderRadius: 12, border: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📍</span> Residential Address
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5, fontWeight: 500 }}>
                  {viewModal.studentProfile?.address || 'No detailed address provided.'}
                </p>
              </div>

              {/* Section 4: Attached Verification Documents */}
              <div style={{ background: 'var(--bg-surface-2)', padding: 16, borderRadius: 12, border: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📎</span> Uploaded Verification Documents ({viewModal.documents?.length || 0})
                </h3>
                {(!viewModal.documents || viewModal.documents.length === 0) ? (
                  <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No documents uploaded during registration.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                    {viewModal.documents.map((doc, idx) => {
                      const fileUrl = doc.file_path ? `${FILE_BASE}/uploads/${doc.file_path}` : null;
                      return (
                        <div key={doc.id || idx} style={{ padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.title || `Document ${idx + 1}`}</div>
                            <div style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>{doc.type || 'Attachment'}</div>
                          </div>
                          {fileUrl && (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '4px 8px', borderRadius: 6, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', fontSize: 11, fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}
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

            {/* Modal Footer Actions */}
            <div style={{
              padding: '14px 22px',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              gap: 10,
              justifyContent: 'flex-end',
              background: 'var(--bg-surface-2)',
              flexShrink: 0,
            }}>
              <button type="button" onClick={() => setViewModal(null)}
                style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Close
              </button>
              <button type="button" onClick={() => setRejectModal(viewModal.id)}
                style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                ✕ Reject
              </button>
              <button type="button" onClick={() => handleApprove(viewModal.id)}
                style={{ padding: '8px 22px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                ✓ Approve & Admit
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Reject Modal */}
      {rejectModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'var(--bg-overlay, rgba(12, 10, 9, 0.85))', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 16, width: '100%', maxWidth: 440, padding: 24, boxShadow: 'var(--shadow-xl)' }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>Reject Registration</h3>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Reason for rejection</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ width: '100%', height: 90, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-input)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'none' }}
              placeholder="e.g. Incomplete documentation or incorrect CNIC"
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
              <button onClick={() => setRejectModal(null)} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleReject} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
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

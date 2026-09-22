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
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
          <HiOutlineCheck size={48} style={{ color: '#10b981', margin: '0 auto 12px', opacity: 0.6 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>All Clear!</h3>
          <p style={{ color: '#64748b', fontSize: 14 }}>No pending student registrations waiting for approval.</p>
        </div>
      ) : (
        <div className="card" style={{ border: '1px solid #e2e8f0', borderRadius: 12, background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '100%' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 10px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student</th>
                  <th style={{ padding: '12px 10px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Class & Medium</th>
                  <th style={{ padding: '12px 10px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Father / CNIC</th>
                  <th style={{ padding: '12px 10px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Numbers</th>
                  <th style={{ padding: '12px 10px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Parent Email</th>
                  <th style={{ padding: '12px 8px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Docs</th>
                  <th style={{ padding: '12px 10px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr
                    key={student.id}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseOut={e => e.currentTarget.style.background = '#ffffff'}
                  >
                    <td style={{ padding: '12px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                          {student.full_name?.charAt(0)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{student.full_name}</div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{student.email}</div>
                          <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 1 }}>
                            {student.gender || student.studentProfile?.gender || 'Male'} • DOB: {student.studentProfile?.date_of_birth || '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 5, background: '#eff6ff', color: '#1d4ed8', fontSize: 11, fontWeight: 700 }}>
                        {student.studentProfile?.class?.display_name || 'N/A'}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: 500 }}>
                        {student.studentProfile?.medium || 'English'} Medium
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
                        {student.studentProfile?.father_name || '-'}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace', marginTop: 2 }}>
                        {student.studentProfile?.father_cnic || '-'}
                      </div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>
                        Relation: {student.studentProfile?.guardian_relation || 'Father'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 12, color: '#0f172a', fontWeight: 600, fontFamily: 'monospace' }}>
                        {student.phone || student.studentProfile?.contact_number_1 || '-'}
                      </div>
                      {student.studentProfile?.contact_number_2 && student.studentProfile?.contact_number_2 !== student.studentProfile?.contact_number_1 && (
                        <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace', marginTop: 1 }}>
                          Alt: {student.studentProfile?.contact_number_2}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ fontSize: 12, color: student.studentProfile?.parent_email ? '#0f172a' : '#94a3b8', wordBreak: 'break-all' }}>
                        {student.studentProfile?.parent_email || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {student.documents?.length > 0 ? (
                        <button
                          onClick={() => setViewModal(student)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 6, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                          title="View uploaded documents"
                        >
                          <HiOutlineDocumentDownload size={13} />
                          {student.documents.length} Docs
                        </button>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: 12 }}>No Docs</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        <button
                          onClick={() => setViewModal(student)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            padding: '5px 9px', borderRadius: 7,
                            background: '#f8fafc', color: '#475569',
                            border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 700,
                            cursor: 'pointer', transition: 'all 0.15s'
                          }}
                          onMouseOver={e => e.currentTarget.style.background = '#e2e8f0'}
                          onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}
                          title="View full admission application details"
                        >
                          <HiOutlineEye size={13} /> View
                        </button>
                        <button
                          onClick={() => handleApprove(student.id)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            padding: '5px 9px', borderRadius: 7,
                            background: '#ecfdf5', color: '#059669',
                            border: '1px solid #a7f3d0', fontSize: 11, fontWeight: 700,
                            cursor: 'pointer', transition: 'all 0.15s'
                          }}
                          onMouseOver={e => e.currentTarget.style.background = '#d1fae5'}
                          onMouseOut={e => e.currentTarget.style.background = '#ecfdf5'}
                          title="Approve student"
                        >
                          <HiOutlineCheck size={13} /> Approve
                        </button>
                        <button
                          onClick={() => setRejectModal(student.id)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            padding: '5px 9px', borderRadius: 7,
                            background: '#fef2f2', color: '#dc2626',
                            border: '1px solid #fecaca', fontSize: 11, fontWeight: 700,
                            cursor: 'pointer', transition: 'all 0.15s'
                          }}
                          onMouseOver={e => e.currentTarget.style.background = '#fee2e2'}
                          onMouseOut={e => e.currentTarget.style.background = '#fef2f2'}
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
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a' }}>📋 Student Admission Application</h2>
                <p style={{ margin: 0, marginTop: 2, fontSize: 12, color: '#64748b' }}>
                  Roll No: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{viewModal.studentProfile?.roll_number || 'Pending Assignment'}</span>
                </p>
              </div>
              <button onClick={() => setViewModal(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#94a3b8', padding: 4, borderRadius: 6, lineHeight: 1 }}>✕</button>
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
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>👤</span> Student Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, fontSize: 13 }}>
                  <div><span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Full Name</span><strong style={{ color: '#0f172a' }}>{viewModal.full_name}</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Login Email</span><strong style={{ color: '#0f172a' }}>{viewModal.email}</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Phone</span><strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{viewModal.phone || viewModal.studentProfile?.contact_number_1 || '-'}</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Gender</span><strong style={{ color: '#0f172a' }}>{viewModal.gender || viewModal.studentProfile?.gender || 'Male'}</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Date of Birth</span><strong style={{ color: '#0f172a' }}>{viewModal.studentProfile?.date_of_birth || '-'}</strong></div>
                  <div><span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Applied Class</span><span style={{ fontWeight: 800, color: '#1d4ed8' }}>{viewModal.studentProfile?.class?.display_name || 'N/A'}</span></div>
                  <div><span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Medium</span><strong style={{ color: '#0f172a' }}>{viewModal.studentProfile?.medium || 'English'}</strong></div>
                </div>
              </div>

              {/* Section 2: Parent & Guardian Details */}
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
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
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📍</span> Residential Address
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: '#1e293b', lineHeight: 1.5, fontWeight: 500 }}>
                  {viewModal.studentProfile?.address || 'No detailed address provided.'}
                </p>
              </div>

              {/* Section 4: Attached Verification Documents */}
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📎</span> Uploaded Verification Documents ({viewModal.documents?.length || 0})
                </h3>
                {(!viewModal.documents || viewModal.documents.length === 0) ? (
                  <p style={{ margin: 0, fontSize: 12.5, color: '#94a3b8', fontStyle: 'italic' }}>No documents uploaded during registration.</p>
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

            {/* Modal Footer Actions */}
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
              <button type="button" onClick={() => setRejectModal(viewModal.id)}
                style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440, padding: 24, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Reject Registration</h3>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, display: 'block' }}>Reason for rejection</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ width: '100%', height: 90, padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', resize: 'none' }}
              placeholder="e.g. Incomplete documentation or incorrect CNIC"
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
              <button onClick={() => setRejectModal(null)} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
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

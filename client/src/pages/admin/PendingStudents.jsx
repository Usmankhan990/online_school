import { useState, useEffect } from 'react';
import api from '../../services/api';
import { HiOutlineCheck, HiOutlineX, HiOutlineDocumentDownload, HiOutlineEye } from 'react-icons/hi';

export default function PendingStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchPending = () => {
    api.get('/admin/pending-students')
      .then(res => setStudents(res.data.students))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/approve-student/${id}`);
      fetchPending();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  const handleReject = async () => {
    try {
      await api.put(`/admin/reject-student/${rejectModal}`, { reason: rejectReason });
      setRejectModal(null);
      setRejectReason('');
      fetchPending();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-dark-400 text-sm mt-1">{students.length} students waiting for approval</p>
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
                  <th style={{ padding: '12px 10px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</th>
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
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                          {student.full_name?.charAt(0)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.full_name}</div>
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-block', padding: '1px 7px', borderRadius: 5, background: '#eff6ff', color: '#1d4ed8', fontSize: 11, fontWeight: 600 }}>
                        {student.studentProfile?.class?.display_name || 'N/A'}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
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
                    </td>
                    <td style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 12, color: '#0f172a', fontWeight: 500, fontFamily: 'monospace' }}>
                        {student.studentProfile?.contact_number_1 || student.phone || '-'}
                      </div>
                      {student.studentProfile?.contact_number_2 && student.studentProfile?.contact_number_2 !== student.studentProfile?.contact_number_1 && (
                        <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace', marginTop: 2 }}>
                          {student.studentProfile?.contact_number_2}
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
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 5, background: '#f1f5f9', color: '#475569', fontSize: 11, fontWeight: 600 }}>
                          <HiOutlineDocumentDownload size={13} />
                          {student.documents.length}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: 12 }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <button
                          onClick={() => handleApprove(student.id)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '5px 10px', borderRadius: 7,
                            background: '#ecfdf5', color: '#059669',
                            border: '1px solid #a7f3d0', fontSize: 11, fontWeight: 700,
                            cursor: 'pointer', transition: 'all 0.15s'
                          }}
                          onMouseOver={e => e.currentTarget.style.background = '#d1fae5'}
                          onMouseOut={e => e.currentTarget.style.background = '#ecfdf5'}
                          title="Approve student"
                        >
                          <HiOutlineCheck size={14} /> Approve
                        </button>
                        <button
                          onClick={() => setRejectModal(student.id)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '5px 10px', borderRadius: 7,
                            background: '#fef2f2', color: '#dc2626',
                            border: '1px solid #fecaca', fontSize: 11, fontWeight: 700,
                            cursor: 'pointer', transition: 'all 0.15s'
                          }}
                          onMouseOver={e => e.currentTarget.style.background = '#fee2e2'}
                          onMouseOut={e => e.currentTarget.style.background = '#fef2f2'}
                          title="Reject student"
                        >
                          <HiOutlineX size={14} /> Reject
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

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 max-w-md w-full animate-slide-up">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Reject Registration</h3>
            <label className="text-sm text-dark-300 mb-2 block">Reason for rejection</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="form-input h-24 resize-none"
              placeholder="Enter reason..."
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setRejectModal(null)} className="flex-1 px-4 py-2 rounded-lg bg-dark-800 text-dark-300 hover:bg-dark-700 transition-colors text-sm">
                Cancel
              </button>
              <button onClick={handleReject} className="flex-1 px-4 py-2 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors text-sm font-medium">
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

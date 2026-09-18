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
        <div className="glass-card p-12 text-center">
          <HiOutlineCheck className="w-16 h-16 text-emerald-400/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">All Clear!</h3>
          <p className="text-dark-400 text-sm">No pending student registrations</p>
        </div>
      ) : (
        <div className="glass-card table-responsive">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class & Medium</th>
                <th>Father / CNIC</th>
                <th>Contact</th>
                <th>Parent Email</th>
                <th>Docs</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {student.full_name?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-900 text-sm font-medium leading-tight">{student.full_name}</p>
                        <p className="text-dark-500 text-xs">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm font-medium text-gray-900">
                      {student.studentProfile?.class?.display_name || 'N/A'}
                    </div>
                    <span className="text-xs text-dark-400">
                      {student.studentProfile?.medium || 'English'} Medium
                    </span>
                  </td>
                  <td>
                    <div className="text-sm font-medium text-gray-900">
                      {student.studentProfile?.father_name || '-'}
                    </div>
                    <span className="text-xs text-dark-400 font-mono">
                      {student.studentProfile?.father_cnic || '-'}
                    </span>
                  </td>
                  <td>
                    <div className="text-sm text-gray-900 font-mono">
                      {student.studentProfile?.contact_number_1 || student.phone || '-'}
                    </div>
                    {student.studentProfile?.contact_number_2 && (
                      <span className="text-xs text-dark-400 font-mono block">
                        {student.studentProfile?.contact_number_2}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="text-sm text-dark-400">
                      {student.studentProfile?.parent_email || '-'}
                    </span>
                  </td>
                  <td>
                    {student.documents?.length > 0 ? (
                      <span className="badge badge-info text-xs inline-flex items-center">
                        <HiOutlineDocumentDownload className="w-3 h-3 mr-1" />
                        {student.documents.length} docs
                      </span>
                    ) : (
                      <span className="text-xs text-dark-400">-</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleApprove(student.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Approve student"
                      >
                        <HiOutlineCheck className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => setRejectModal(student.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-600 hover:bg-rose-500/25 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Reject student"
                      >
                        <HiOutlineX className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

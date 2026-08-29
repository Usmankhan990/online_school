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
          <h1 className="text-2xl font-bold text-white">Pending Approvals</h1>
          <p className="text-dark-400 text-sm mt-1">{students.length} students waiting for approval</p>
        </div>
        <span className="badge badge-warning text-base px-4 py-1">{students.length} Pending</span>
      </div>

      {students.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <HiOutlineCheck className="w-16 h-16 text-emerald-400/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-1">All Clear!</h3>
          <p className="text-dark-400 text-sm">No pending student registrations</p>
        </div>
      ) : (
        <div className="space-y-4">
          {students.map(student => (
            <div key={student.id} className="glass-card p-5 animate-slide-up">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {student.full_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold">{student.full_name}</h3>
                    <p className="text-dark-400 text-sm">{student.email}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-dark-400">
                      <span>📚 {student.studentProfile?.class?.display_name || 'N/A'}</span>
                      <span>👨 {student.studentProfile?.father_name}</span>
                      <span>🪪 {student.studentProfile?.father_cnic}</span>
                      <span>📱 {student.studentProfile?.contact_number_1}</span>
                      <span>🌐 {student.studentProfile?.medium} Medium</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {student.documents?.length > 0 && (
                    <span className="badge badge-info">
                      <HiOutlineDocumentDownload className="w-3 h-3 mr-1" />
                      {student.documents.length} docs
                    </span>
                  )}
                  <button
                    onClick={() => handleApprove(student.id)}
                    className="px-4 py-2 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 text-sm font-medium transition-colors flex items-center gap-1.5"
                  >
                    <HiOutlineCheck className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => setRejectModal(student.id)}
                    className="px-4 py-2 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 text-sm font-medium transition-colors flex items-center gap-1.5"
                  >
                    <HiOutlineX className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 max-w-md w-full animate-slide-up">
            <h3 className="text-lg font-bold text-white mb-4">Reject Registration</h3>
            <label className="text-sm text-dark-300 mb-2 block">Reason for rejection</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="input-dark h-24 resize-none"
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

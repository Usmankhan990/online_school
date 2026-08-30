import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    api.get(`/admin/students?status=${filter}`)
      .then(res => setStudents(res.data.students))
      .catch(console.error);
  }, [filter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">All Students</h1>
        <div className="flex gap-2">
          {['active', 'pending', 'rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${filter === s ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30' : 'bg-dark-800 text-dark-400 hover:text-dark-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="glass-card table-responsive">
        <table className="table-dark">
          <thead><tr><th>Student</th><th>Class</th><th>Roll No</th><th>Father</th><th>Contact</th><th>Status</th></tr></thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-semibold">{s.full_name?.charAt(0)}</div>
                    <div><p className="text-white text-sm font-medium">{s.full_name}</p><p className="text-dark-500 text-xs">{s.email}</p></div>
                  </div>
                </td>
                <td className="text-dark-300 text-sm">{s.studentProfile?.class?.display_name || '-'}</td>
                <td className="text-dark-300 text-sm font-mono">{s.studentProfile?.roll_number || '-'}</td>
                <td className="text-dark-300 text-sm">{s.studentProfile?.father_name || '-'}</td>
                <td className="text-dark-300 text-sm">{s.studentProfile?.contact_number_1 || '-'}</td>
                <td><span className={`badge ${s.status === 'active' ? 'badge-success' : s.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>{s.status}</span></td>
              </tr>
            ))}
            {students.length === 0 && <tr><td colSpan="6" className="text-center text-dark-500 py-8">No students found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

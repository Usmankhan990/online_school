import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

export default function AdminFees() {
  const [fees, setFees] = useState([]);
  const [classes, setClasses] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', class_id: '', month: '' });
  const [showGenerate, setShowGenerate] = useState(false);
  const [genForm, setGenForm] = useState({ month: new Date().toISOString().slice(0, 7), amount: 500 });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.class_id) params.append('class_id', filters.class_id);
      if (filters.month) params.append('month', filters.month);
      
      const [feeRes, classRes] = await Promise.all([
        api.get(`/admin/fees?${params.toString()}`),
        api.get('/admin/classes'),
      ]);
      setFees(feeRes.data.fees || []);
      setTotalPaid(feeRes.data.totalPaid || 0);
      setTotalPending(feeRes.data.totalPending || 0);
      setClasses(classRes.data.classes || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');
    try {
      const res = await api.post('/admin/fees/generate-monthly', genForm);
      setMsg(`✅ ${res.data.message}`);
      setShowGenerate(false);
      fetchData();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Failed to generate fees.'));
    } finally { setSubmitting(false); }
  };

  const handleVerify = async (id, action) => {
    try {
      await api.put(`/admin/fees/${id}/verify`, { action });
      setMsg(`✅ Payment ${action === 'verify' ? 'verified' : 'rejected'}!`);
      fetchData();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Failed to process payment.'));
    }
  };

  const statusStyle = { pending: { color: '#f59e0b', bg: '#fffbeb' }, paid: { color: '#10b981', bg: '#ecfdf5' }, overdue: { color: '#ef4444', bg: '#fef2f2' }, waived: { color: '#6366f1', bg: '#f5f3ff' } };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>💰 Fee Management</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Generate monthly fees, verify payments, track collections</p>
        </div>
        <button onClick={() => setShowGenerate(!showGenerate)} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', fontWeight: 600, cursor: 'pointer', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' }}>
          {showGenerate ? '✕ Cancel' : '⚡ Generate Monthly Fees'}
        </button>
      </div>

      {msg && <div className="card" style={{ padding: 16, background: msg.startsWith('✅') ? '#ecfdf5' : '#fef2f2', color: msg.startsWith('✅') ? '#059669' : '#dc2626', fontWeight: 600, fontSize: 14 }}>{msg}</div>}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        <div className="stat-card"><div><div className="stat-label">Total Collected</div><div className="stat-value" style={{ color: '#10b981' }}>₨{totalPaid.toLocaleString()}</div></div><div className="stat-icon" style={{ background: '#ecfdf5' }}>✅</div></div>
        <div className="stat-card"><div><div className="stat-label">Total Pending</div><div className="stat-value" style={{ color: '#ef4444' }}>₨{totalPending.toLocaleString()}</div></div><div className="stat-icon" style={{ background: '#fef2f2' }}>⏳</div></div>
        <div className="stat-card"><div><div className="stat-label">Total Records</div><div className="stat-value" style={{ color: '#3b82f6' }}>{fees.length}</div></div><div className="stat-icon" style={{ background: '#eff6ff' }}>📋</div></div>
      </div>

      {/* Generate Form */}
      {showGenerate && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>⚡ Generate Monthly Fees for All Active Students</h3>
          <form onSubmit={handleGenerate} style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Month *</label>
              <input type="month" value={genForm.month} onChange={e => setGenForm(f => ({ ...f, month: e.target.value }))} required style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Amount (PKR)</label>
              <input type="number" value={genForm.amount} onChange={e => setGenForm(f => ({ ...f, amount: e.target.value }))} min={100} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14, width: 120 }} />
            </div>
            <button type="submit" disabled={submitting} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontSize: 14, opacity: submitting ? 0.6 : 1 }}>
              {submitting ? '⏳...' : '🚀 Generate & Notify'}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ padding: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13 }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
        <select value={filters.class_id} onChange={e => setFilters(f => ({ ...f, class_id: e.target.value }))} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13 }}>
          <option value="">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
        </select>
        <input type="month" value={filters.month} onChange={e => setFilters(f => ({ ...f, month: e.target.value }))} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13 }} />
        <button onClick={() => setFilters({ status: '', class_id: '', month: '' })} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>Clear</button>
      </div>

      {/* Fee Table */}
      <div className="card" style={{ padding: 20, overflow: 'auto' }}>
        {loading ? <div style={{ padding: 32, textAlign: 'center' }}>Loading...</div> : fees.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>💰</span>
            <p style={{ fontSize: 16, fontWeight: 600 }}>No fee records found</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                {['Student', 'Class', 'Month', 'Amount', 'Status', 'Method', 'Transaction ID', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fees.map(f => {
                const st = statusStyle[f.status] || statusStyle.pending;
                const needsVerification = f.status === 'paid' && !f.verified_by && f.payment_method;
                return (
                  <tr key={f.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '10px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{f.student?.full_name || '-'}</td>
                    <td style={{ padding: '10px', fontSize: 12, color: 'var(--text-secondary)' }}>{f.class?.display_name || '-'}</td>
                    <td style={{ padding: '10px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{f.month}</td>
                    <td style={{ padding: '10px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>₨{parseFloat(f.amount).toLocaleString()}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99, color: st.color, background: st.bg }}>{f.status}</span>
                      {needsVerification && <span style={{ fontSize: 10, color: '#f59e0b', marginLeft: 4 }}>⏳ Verify</span>}
                    </td>
                    <td style={{ padding: '10px', fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{f.payment_method?.replace('_', ' ') || '-'}</td>
                    <td style={{ padding: '10px', fontSize: 12, color: 'var(--text-tertiary)' }}>{f.transaction_id || '-'}</td>
                    <td style={{ padding: '10px' }}>
                      {needsVerification && (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => handleVerify(f.id, 'verify')} style={{ padding: '4px 8px', borderRadius: 4, border: 'none', background: '#10b981', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>✅ Verify</button>
                          <button onClick={() => handleVerify(f.id, 'reject')} style={{ padding: '4px 8px', borderRadius: 4, border: 'none', background: '#ef4444', color: 'white', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>❌ Reject</button>
                        </div>
                      )}
                      {f.verified_by && <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>✅ Verified</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

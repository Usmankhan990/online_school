import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ParentFees() {
  const [dashboard, setDashboard] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/parent/dashboard');
        setDashboard(res.data);
        setFees(res.data.child?.fees || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const statusStyle = { pending: { color: '#f59e0b', bg: '#fffbeb', label: 'Pending' }, paid: { color: '#10b981', bg: '#ecfdf5', label: 'Paid' }, overdue: { color: '#ef4444', bg: '#fef2f2', label: 'Overdue' }, waived: { color: '#6366f1', bg: '#f5f3ff', label: 'Waived' } };

  if (loading) return <div className="flex flex-col gap-5 min-w-0">{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}</div>;

  const child = dashboard?.child;
  const totalPaid = fees.filter(f => f.status === 'paid').reduce((s, f) => s + parseFloat(f.amount || 0), 0);
  const totalDue = fees.filter(f => f.status !== 'paid' && f.status !== 'waived').reduce((s, f) => s + parseFloat(f.amount || 0), 0);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>💰 Child's Fees</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          Fee status for <strong>{child?.full_name || 'your child'}</strong>
        </p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        <div className="stat-card"><div><div className="stat-label">Total Paid</div><div className="stat-value" style={{ color: '#10b981' }}>₨{totalPaid.toLocaleString()}</div></div><div className="stat-icon" style={{ background: '#ecfdf5' }}>✅</div></div>
        <div className="stat-card"><div><div className="stat-label">Total Due</div><div className="stat-value" style={{ color: totalDue > 0 ? '#ef4444' : '#10b981' }}>₨{totalDue.toLocaleString()}</div></div><div className="stat-icon" style={{ background: totalDue > 0 ? '#fef2f2' : '#ecfdf5' }}>{totalDue > 0 ? '⚠️' : '✅'}</div></div>
        <div className="stat-card"><div><div className="stat-label">Monthly Fee</div><div className="stat-value" style={{ color: '#3b82f6' }}>₨500</div></div><div className="stat-icon" style={{ background: '#eff6ff' }}>💰</div></div>
      </div>

      {/* Fee Records */}
      <div className="card" style={{ padding: 20, overflow: 'auto' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Fee History</h3>
        {fees.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>💰</span>
            <p>No fee records available yet</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                {['Month', 'Amount', 'Due Date', 'Status', 'Paid Date', 'Method'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fees.map((f, i) => {
                const st = statusStyle[f.status] || statusStyle.pending;
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{f.month}</td>
                    <td style={{ padding: '12px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>₨{parseFloat(f.amount).toLocaleString()}</td>
                    <td style={{ padding: '12px', fontSize: 13, color: 'var(--text-secondary)' }}>{f.due_date || '-'}</td>
                    <td style={{ padding: '12px' }}><span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 99, color: st.color, background: st.bg }}>{st.label}</span></td>
                    <td style={{ padding: '12px', fontSize: 13, color: 'var(--text-secondary)' }}>{f.paid_date || '-'}</td>
                    <td style={{ padding: '12px', fontSize: 13, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{f.payment_method?.replace('_', ' ') || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalDue > 0 && (
        <div className="card" style={{ padding: 20, background: '#fffbeb', border: '1px solid #f59e0b30' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#b45309', display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚠️ Outstanding fees: ₨{totalDue.toLocaleString()} — Please ensure timely payment to avoid service interruption.
          </p>
        </div>
      )}
    </div>
  );
}

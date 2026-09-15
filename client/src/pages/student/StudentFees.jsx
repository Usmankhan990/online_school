import { useState, useEffect } from 'react';
import api from '../../services/api';

/* Visual Payment Method Logos */
const JazzCashLogo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, borderRadius: 6, overflow: 'hidden' }}>
    <rect width="40" height="40" rx="8" fill="#E30613" />
    <circle cx="20" cy="20" r="13" fill="#FFC800" />
    <circle cx="20" cy="20" r="10" fill="#E30613" />
    <text x="20" y="24" textAnchor="middle" fill="#FFC800" fontSize="12" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif">JC</text>
  </svg>
);

const EasyPaisaLogo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, borderRadius: 6, overflow: 'hidden' }}>
    <rect width="40" height="40" rx="8" fill="#00A652" />
    <path d="M12 20C12 15.58 15.58 12 20 12C24.42 12 28 15.58 28 20" stroke="white" strokeWidth="3" strokeLinecap="round" />
    <path d="M20 20L25 25M25 20L20 25" stroke="#78D64B" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="20" cy="20" r="4" fill="white" />
  </svg>
);

const BankLogo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, borderRadius: 6, overflow: 'hidden' }}>
    <rect width="40" height="40" rx="8" fill="#1E3A5F" />
    <path d="M20 11L11 16V18H29V16L20 11Z" fill="#38BDF8" />
    <rect x="13" y="19" width="2.5" height="7" fill="white" />
    <rect x="18.75" y="19" width="2.5" height="7" fill="white" />
    <rect x="24.5" y="19" width="2.5" height="7" fill="white" />
    <rect x="11" y="27" width="18" height="2.5" rx="1" fill="#38BDF8" />
  </svg>
);

const PAYMENT_INFO = {
  jazzcash: { name: 'JazzCash', Logo: JazzCashLogo, color: '#e30613', account: '03XX-XXXXXXX', holder: 'Usman Online School' },
  easypaisa: { name: 'EasyPaisa', Logo: EasyPaisaLogo, color: '#00a652', account: '03XX-XXXXXXX', holder: 'Usman Online School' },
  bank_transfer: { name: 'Bank Transfer', Logo: BankLogo, color: '#1e3a5f', account: 'IBAN: PK00XXXX0000000000000', holder: 'Usman Online School', bank: 'HBL / Meezan Bank' },
};

export default function StudentFees() {
  const [fees, setFees] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalDue, setTotalDue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState(null);
  const [payForm, setPayForm] = useState({ payment_method: '', transaction_id: '' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchFees(); }, []);

  const fetchFees = async () => {
    try {
      const res = await api.get('/student/fees');
      setFees(res.data.fees || []);
      setTotalPaid(res.data.totalPaid || 0);
      setTotalDue(res.data.totalDue || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');
    try {
      await api.post('/student/fees/pay', { fee_id: payModal.id, ...payForm });
      setMsg('✅ Payment submitted! Awaiting admin verification.');
      setPayModal(null);
      setPayForm({ payment_method: '', transaction_id: '' });
      fetchFees();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Payment failed.'));
    } finally { setSubmitting(false); }
  };

  const statusStyle = { pending: { color: '#f59e0b', bg: '#fffbeb', label: 'Pending' }, paid: { color: '#10b981', bg: '#ecfdf5', label: 'Paid' }, overdue: { color: '#ef4444', bg: '#fef2f2', label: 'Overdue' }, waived: { color: '#6366f1', bg: '#f5f3ff', label: 'Waived' } };

  if (loading) return <div className="flex flex-col gap-5 min-w-0">{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 14 }} />)}</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>💰 My Fees</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>View fee status and submit payments</p>
      </div>

      {msg && <div className="card" style={{ padding: 16, background: msg.startsWith('✅') ? '#ecfdf5' : '#fef2f2', color: msg.startsWith('✅') ? '#059669' : '#dc2626', fontWeight: 600, fontSize: 14 }}>{msg}</div>}

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        <div className="stat-card"><div><div className="stat-label">Total Paid</div><div className="stat-value" style={{ color: '#10b981' }}>₨{totalPaid.toLocaleString()}</div></div><div className="stat-icon" style={{ background: '#ecfdf5' }}>✅</div></div>
        <div className="stat-card"><div><div className="stat-label">Total Due</div><div className="stat-value" style={{ color: totalDue > 0 ? '#ef4444' : '#10b981' }}>₨{totalDue.toLocaleString()}</div></div><div className="stat-icon" style={{ background: totalDue > 0 ? '#fef2f2' : '#ecfdf5' }}>{totalDue > 0 ? '⚠️' : '✅'}</div></div>
        <div className="stat-card"><div><div className="stat-label">Monthly Fee</div><div className="stat-value" style={{ color: '#3b82f6' }}>₨500</div></div><div className="stat-icon" style={{ background: '#eff6ff' }}>💰</div></div>
      </div>

      {/* Payment Methods Info */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>💳 Payment Methods</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {Object.entries(PAYMENT_INFO).map(([key, info]) => (
            <div key={key} style={{ padding: 16, borderRadius: 12, border: '1px solid var(--border-light)', background: 'var(--bg-body)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <info.Logo size={32} />
                <span style={{ fontSize: 15, fontWeight: 800, color: info.color }}>{info.name}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                <div><strong>Account:</strong> {info.account}</div>
                <div><strong>Name:</strong> {info.holder}</div>
                {info.bank && <div><strong>Bank:</strong> {info.bank}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fee Records */}
      <div className="card" style={{ padding: 20, overflow: 'auto' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Fee Records</h3>
        {fees.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>💰</span>
            <p>No fee records yet</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                {['Month', 'Amount', 'Due Date', 'Status', 'Method', 'Action'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fees.map(f => {
                const st = statusStyle[f.status] || statusStyle.pending;
                return (
                  <tr key={f.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{f.month}</td>
                    <td style={{ padding: '12px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>₨{parseFloat(f.amount).toLocaleString()}</td>
                    <td style={{ padding: '12px', fontSize: 13, color: 'var(--text-secondary)' }}>{f.due_date}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 99, color: st.color, background: st.bg }}>{st.label}</span>
                    </td>
                    <td style={{ padding: '12px', fontSize: 13, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{f.payment_method?.replace('_', ' ') || '-'}</td>
                    <td style={{ padding: '12px' }}>
                      {(f.status === 'pending' || f.status === 'overdue') && (
                        <button onClick={() => setPayModal(f)} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Pay Now</button>
                      )}
                      {f.status === 'paid' && <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>✅ Paid</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pay Modal */}
      {payModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ padding: 28, maxWidth: 480, width: '100%', position: 'relative' }}>
            <button onClick={() => setPayModal(null)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-tertiary)' }}>✕</button>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>💳 Submit Payment</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Fee: ₨{parseFloat(payModal.amount).toLocaleString()} for {payModal.month}</p>
            <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Payment Method *</label>
                <select value={payForm.payment_method} onChange={e => setPayForm(f => ({ ...f, payment_method: e.target.value }))} required style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }}>
                  <option value="">Select method</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="easypaisa">EasyPaisa</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Transaction ID / Reference *</label>
                <input value={payForm.transaction_id} onChange={e => setPayForm(f => ({ ...f, transaction_id: e.target.value }))} placeholder="e.g., TXN123456789" required style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14 }} />
              </div>
              {payForm.payment_method && PAYMENT_INFO[payForm.payment_method] && (
                <div style={{ padding: 12, borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: 12, color: '#1e40af' }}>
                  <strong>Send payment to:</strong> {PAYMENT_INFO[payForm.payment_method].account} — {PAYMENT_INFO[payForm.payment_method].holder}
                </div>
              )}
              <button type="submit" disabled={submitting} style={{ padding: '12px', borderRadius: 10, border: 'none', fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontSize: 14, width: '100%', opacity: submitting ? 0.6 : 1 }}>
                {submitting ? '⏳ Submitting...' : '✅ Submit Payment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

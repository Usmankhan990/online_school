import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const DEMO_CREDS = [
  { label: 'Admin', email: 'admin@usmanonlineschool.com', pass: 'Admin@123', icon: '🛡️', color: '#1e3a5f' },
  { label: 'Teacher', email: 'teacher@usmanonlineschool.com', pass: 'Teacher@123', icon: '👨‍🏫', color: '#7c3aed' },
  { label: 'Student', email: 'student@usmanonlineschool.com', pass: 'Student@123', icon: '👨‍🎓', color: '#10b981' },
  { label: 'Parent', email: 'parent@usmanonlineschool.com', pass: 'Parent@123', icon: '👨‍👩‍👧', color: '#f59e0b' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(email, password);
      if (userData && userData.role) {
        const routes = { super_admin: '/admin', teacher: '/teacher', student: '/student', parent: '/parent' };
        navigate(routes[userData.role] || '/');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (cred) => {
    setEmail(cred.email);
    setPassword(cred.pass);
    setError('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex" style={{
        width: '45%', background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 48, position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1.5\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 32, margin: '0 auto 24px', boxShadow: '0 8px 32px rgba(16,185,129,0.3)' }}>U</div>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Usman Online School</h1>
          <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 40 }}>KG to 8th • Punjab Board • PCTB 2026</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {['📚 66+ Books', '📝 Exams', '📊 Results', '👨‍👩‍👧 Parent Portal'].map(t => (
              <span key={t} style={{ background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', fontSize: 12, padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#f8fafc' }}>
        <div style={{ width: '100%', maxWidth: 440 }} className="animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 24, marginBottom: 12 }}>U</div>
            <h2 style={{ color: '#0f172a', fontSize: 20, fontWeight: 800 }}>Usman Online School</h2>
          </div>

          <div>
            <h2 style={{ color: '#0f172a', fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Welcome back 👋</h2>
            <p style={{ color: '#64748b', fontSize: 15, marginBottom: 28 }}>Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="alert-danger" style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 14, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
            </div>
            <div>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                Password
                <Link to="/forgot-password" style={{ color: '#1e3a5f', fontWeight: 500, textDecoration: 'none', fontSize: 12 }}>Forgot?</Link>
              </label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', margin: '24px 0', color: '#94a3b8', fontSize: 13 }}>
            Don't have an account? <Link to="/register" style={{ color: '#1e3a5f', fontWeight: 600, textDecoration: 'none' }}>Apply for Admission</Link>
          </div>

          {/* Demo credentials */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20, marginTop: 8 }}>
            <p style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, textAlign: 'center' }}>Quick Demo Access</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {DEMO_CREDS.map(c => (
                <button key={c.label} onClick={() => fillDemo(c)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                  borderRadius: 10, border: '1px solid #e2e8f0', background: 'white',
                  cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left'
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.background = '#f8fafc'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white'; }}>
                  <span style={{ fontSize: 20 }}>{c.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{c.label}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>Demo Login</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

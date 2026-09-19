import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import logoImg from '../../assets/logo.jpg';
import LanguageToggle from '../../components/LanguageToggle';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetData, setResetData] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setResetData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset link. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (resetData?.reset_url) {
      const fullUrl = `${window.location.origin}${resetData.reset_url}`;
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 50 }}>
        <LanguageToggle style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#1e3a5f', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
      </div>

      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center relative overflow-hidden" style={{
        width: '45%', background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
        padding: 48
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1.5\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <img src={logoImg} alt="Taleem Ghar" style={{ width: 88, height: 88, borderRadius: 22, objectFit: 'cover', background: '#ffffff', padding: 2, margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }} />
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Taleem Ghar</h1>
          <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 40 }}>KG to 8th • Punjab Board • PCTB 2026</p>
          <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: '20px 24px', border: '1px solid rgba(255,255,255,0.1)', maxWidth: 360, textAlign: 'left' }}>
            <div style={{ color: '#10b981', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>🔒 Account Recovery</div>
            <div style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.5 }}>
              Enter your registered email address to receive a secure password reset link.
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
        <div style={{ width: '100%', maxWidth: 440 }} className="animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: 32 }}>
            <img src={logoImg} alt="Taleem Ghar" style={{ width: 64, height: 64, borderRadius: 16, objectFit: 'cover', background: '#ffffff', padding: 2, display: 'inline-block', marginBottom: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
            <h2 style={{ color: '#0f172a', fontSize: 20, fontWeight: 800 }}>Taleem Ghar</h2>
          </div>

          <div>
            <h2 style={{ color: '#0f172a', fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Forgot Password? 🔑</h2>
            <p style={{ color: '#64748b', fontSize: 15, marginBottom: 28 }}>
              No worries! Enter your email to reset your account password.
            </p>
          </div>

          {error && (
            <div className="alert-danger" style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 14, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          {!resetData ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label className="form-label">Registered Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoFocus
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                    Generating Link...
                  </span>
                ) : 'Send Reset Link'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <Link to="/login" style={{ color: '#1e3a5f', fontWeight: 600, textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          ) : (
            <div style={{ background: '#ffffff', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 16px' }}>
                ✓
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', textAlign: 'center', margin: '0 0 8px 0' }}>
                Reset Link Generated!
              </h3>
              <p style={{ fontSize: 13.5, color: '#64748b', textAlign: 'center', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                A password reset link for <strong style={{ color: '#0f172a' }}>{resetData.email}</strong> is ready. You can reset your password immediately using the button below:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link
                  to={resetData.reset_url}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                >
                  Create New Password Now →
                </Link>

                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {copied ? '✓ Link Copied to Clipboard!' : '📋 Copy Reset Link'}
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                <Link to="/login" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

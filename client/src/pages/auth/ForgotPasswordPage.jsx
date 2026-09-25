import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import logoImg from '../../assets/logo.jpg';
import LanguageToggle from '../../components/LanguageToggle';
import AuthBackgroundSlider from '../../components/AuthBackgroundSlider';

import ThemeToggle from '../../components/ThemeToggle';

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
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative', background: 'var(--bg-body, #FAF6EE)', color: 'var(--text-primary, #1C1917)' }}>
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 50, display: 'flex', alignItems: 'center', gap: 10 }}>
        <ThemeToggle />
        <LanguageToggle style={{ background: 'var(--bg-surface, #ffffff)', border: '1px solid var(--border-light, #EBE4D5)', color: 'var(--text-primary, #1C1917)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} />
      </div>

      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center relative overflow-hidden" style={{
        width: '45%', background: 'linear-gradient(135deg, #1C1917 0%, #292524 100%)',
        padding: 48
      }}>
        <AuthBackgroundSlider overlayOpacity={0.76} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <img src={logoImg} alt="Taleem Ghar" style={{ width: 88, height: 88, borderRadius: 22, objectFit: 'cover', background: '#ffffff', padding: 2, margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} />
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 800, marginBottom: 8, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Taleem Ghar</h1>
          <p style={{ color: '#D8CEBD', fontSize: 15, marginBottom: 40, textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>Apka Ghar, Apka School</p>
          <div style={{ background: 'rgba(28,25,23,0.75)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: '20px 24px', border: '1px solid rgba(255,204,77,0.3)', maxWidth: 360, textAlign: 'left', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
            <div style={{ color: '#FFCC4D', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>🔒 Account Recovery</div>
            <div style={{ color: '#EBE4D5', fontSize: 13, lineHeight: 1.5 }}>
              Enter your registered email address to receive a secure password reset link.
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 pt-16 sm:pt-6" style={{ background: 'var(--bg-body, #FAF6EE)' }}>
        <div style={{ width: '100%', maxWidth: 440, background: 'var(--bg-surface, #FFFFFF)', padding: 'clamp(20px, 4vw, 36px) clamp(16px, 4vw, 32px)', borderRadius: 24, border: '1px solid var(--border-light, #EBE4D5)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} className="animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: 32 }}>
            <img src={logoImg} alt="Taleem Ghar" style={{ width: 64, height: 64, borderRadius: 16, objectFit: 'cover', background: '#ffffff', padding: 2, display: 'inline-block', marginBottom: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
            <h2 style={{ color: 'var(--text-primary, #1C1917)', fontSize: 20, fontWeight: 800 }}>Taleem Ghar</h2>
          </div>

          <div>
            <h2 style={{ color: 'var(--text-primary, #1C1917)', fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Forgot Password? 🔑</h2>
            <p style={{ color: 'var(--text-secondary, #57534E)', fontSize: 15, marginBottom: 28 }}>
              No worries! Enter your email to reset your account password.
            </p>
          </div>

          {error && (
            <div className="alert-danger" style={{ padding: '12px 16px', borderRadius: 12, marginBottom: 16, fontSize: 14 }}>
              {error}
            </div>
          )}

          {!resetData ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label className="form-label" style={{ color: 'var(--text-primary, #1C1917)', fontWeight: 600 }}>Registered Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoFocus
                  style={{ borderRadius: 9999, padding: '12px 18px' }}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 4, borderRadius: 9999 }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 18, height: 18, border: '2px solid rgba(28,25,23,0.3)', borderTopColor: '#1C1917', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                    Generating Link...
                  </span>
                ) : 'Send Reset Link'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <Link to="/login" style={{ color: 'var(--text-primary, #1C1917)', fontWeight: 600, textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          ) : (
            <div style={{ background: 'var(--bg-surface-2, #f8fafc)', borderRadius: 16, padding: '24px', border: '1px solid var(--border-light, #e2e8f0)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 16px' }}>
                ✓
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary, #0f172a)', textAlign: 'center', margin: '0 0 8px 0' }}>
                Reset Link Generated!
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary, #64748b)', textAlign: 'center', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                A password reset link for <strong style={{ color: 'var(--text-primary, #0f172a)' }}>{resetData.email}</strong> is ready. You can reset your password immediately using the button below:
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

import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import logoImg from '../../assets/logo.jpg';
import LanguageToggle from '../../components/LanguageToggle';
import AuthBackgroundSlider from '../../components/AuthBackgroundSlider';
import ThemeToggle from '../../components/ThemeToggle';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setTokenValid(false);
      setTokenError('No password reset token provided. Please request a new reset link.');
      return;
    }

    api.get(`/auth/verify-reset-token?token=${token}`)
      .then(res => {
        setTokenValid(true);
        setUserInfo(res.data);
      })
      .catch(err => {
        setTokenValid(false);
        setTokenError(err.response?.data?.error || 'This password reset link is invalid or has expired.');
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        new_password: password,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
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
          <p style={{ color: '#D8CEBD', fontSize: 15, marginBottom: 40, textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>KG to 8th • Punjab Board • PCTB 2026</p>
          <div style={{ background: 'rgba(28,25,23,0.75)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: '20px 24px', border: '1px solid rgba(255,204,77,0.3)', maxWidth: 360, textAlign: 'left', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
            <div style={{ color: '#FFCC4D', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>🔒 Secure Password Reset</div>
            <div style={{ color: '#EBE4D5', fontSize: 13, lineHeight: 1.5 }}>
              Choose a strong password with at least 6 characters to secure your account.
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6" style={{ background: 'var(--bg-body, #FAF6EE)' }}>
        <div style={{ width: '100%', maxWidth: 440, background: 'var(--bg-surface, #FFFFFF)', padding: '36px 32px', borderRadius: 28, border: '1px solid var(--border-light, #EBE4D5)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} className="animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: 32 }}>
            <img src={logoImg} alt="Taleem Ghar" style={{ width: 64, height: 64, borderRadius: 16, objectFit: 'cover', background: '#ffffff', padding: 2, display: 'inline-block', marginBottom: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
            <h2 style={{ color: 'var(--text-primary, #1C1917)', fontSize: 20, fontWeight: 800 }}>Taleem Ghar</h2>
          </div>

          {verifying ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ width: 36, height: 36, border: '3px solid var(--border-light, #EBE4D5)', borderTopColor: 'var(--color-primary-yellow, #FFCC4D)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-secondary, #57534E)', fontSize: 14, fontWeight: 500 }}>Verifying reset link...</p>
            </div>
          ) : !tokenValid ? (
            <div style={{ background: 'var(--bg-surface-2, #ffffff)', borderRadius: 16, padding: '32px 24px', border: '1px solid #fecaca', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 16px' }}>
                ✕
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary, #1C1917)', margin: '0 0 8px 0' }}>Invalid or Expired Link</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary, #57534E)', margin: '0 0 24px 0', lineHeight: 1.5 }}>
                {tokenError}
              </p>
              <Link to="/forgot-password" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', borderRadius: 9999 }}>
                Request New Reset Link →
              </Link>
            </div>
          ) : success ? (
            <div style={{ background: 'var(--bg-surface-2, #ffffff)', borderRadius: 16, padding: '32px 24px', border: '1px solid #a7f3d0', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 16px' }}>
                ✓
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary, #1C1917)', margin: '0 0 8px 0' }}>Password Reset Successful!</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary, #57534E)', margin: '0 0 24px 0', lineHeight: 1.5 }}>
                Your account password has been updated. You can now sign in using your new credentials.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center', borderRadius: 9999 }}
              >
                Sign In Now →
              </button>
            </div>
          ) : (
            <div>
              <div>
                <h2 style={{ color: 'var(--text-primary, #1C1917)', fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Set New Password 🔐</h2>
                <p style={{ color: 'var(--text-secondary, #57534E)', fontSize: 14, marginBottom: 24 }}>
                  Resetting password for <strong style={{ color: 'var(--text-primary, #1C1917)' }}>{userInfo?.email}</strong>
                </p>
              </div>

              {error && (
                <div className="alert-danger" style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 14 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="form-input"
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                      style={{ paddingRight: 44 }}
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>
                      {showPass ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="form-label">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="form-input"
                      type={showConfirmPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      style={{ paddingRight: 44 }}
                    />
                    <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>
                      {showConfirmPass ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                      Updating Password...
                    </span>
                  ) : 'Save New Password'}
                </button>

                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <Link to="/login" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>
                    Cancel & Return to Sign In
                  </Link>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

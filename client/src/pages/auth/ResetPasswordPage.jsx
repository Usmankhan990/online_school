import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import logoImg from '../../assets/logo.jpg';
import LanguageToggle from '../../components/LanguageToggle';

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
            <div style={{ color: '#10b981', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>🔒 Secure Password Reset</div>
            <div style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.5 }}>
              Choose a strong password with at least 6 characters to secure your account.
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

          {verifying ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#1e3a5f', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>Verifying reset link...</p>
            </div>
          ) : !tokenValid ? (
            <div style={{ background: '#ffffff', borderRadius: 16, padding: '32px 24px', border: '1px solid #fecaca', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 16px' }}>
                ✕
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>Invalid or Expired Link</h3>
              <p style={{ fontSize: 13.5, color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.5 }}>
                {tokenError}
              </p>
              <Link to="/forgot-password" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
                Request New Reset Link →
              </Link>
            </div>
          ) : success ? (
            <div style={{ background: '#ffffff', borderRadius: 16, padding: '32px 24px', border: '1px solid #a7f3d0', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 16px' }}>
                ✓
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>Password Reset Successful!</h3>
              <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.5 }}>
                Your account password has been updated. You can now sign in using your new credentials.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Sign In Now →
              </button>
            </div>
          ) : (
            <div>
              <div>
                <h2 style={{ color: '#0f172a', fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Set New Password 🔐</h2>
                <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
                  Resetting password for <strong style={{ color: '#0f172a' }}>{userInfo?.email}</strong>
                </p>
              </div>

              {error && (
                <div className="alert-danger" style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontSize: 14, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
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

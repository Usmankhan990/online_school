import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logoImg from '../../assets/logo.jpg';
import LanguageToggle from '../../components/LanguageToggle';
import ThemeToggle from '../../components/ThemeToggle';
import AuthBackgroundSlider from '../../components/AuthBackgroundSlider';
import { t, getCurrentLanguage } from '../../utils/translate';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [, setLang] = useState(() => getCurrentLanguage());

  useEffect(() => {
    const handleLangChange = (e) => {
      setLang(e.detail?.lang || getCurrentLanguage());
    };
    window.addEventListener('language-changed', handleLangChange);
    return () => window.removeEventListener('language-changed', handleLangChange);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(email.trim().toLowerCase(), password);
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative', background: 'var(--bg-body, #FAF6EE)' }}>
      {/* Top Left Home Button */}
      <Link
        to="/"
        style={{
          position: 'absolute',
          top: 'clamp(12px, 2vh, 20px)',
          left: 'clamp(12px, 3vw, 24px)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '6px 14px',
          borderRadius: 9999,
          fontSize: 12.5,
          fontWeight: 700,
          textDecoration: 'none',
          background: 'rgba(28, 25, 23, 0.72)',
          backdropFilter: 'blur(10px)',
          border: '1.5px solid rgba(255, 204, 77, 0.35)',
          color: '#FAF6EE',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
          transition: 'all 0.2s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = '#1C1917';
          e.currentTarget.style.borderColor = '#FFCC4D';
          e.currentTarget.style.color = '#FFCC4D';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(28, 25, 23, 0.72)';
          e.currentTarget.style.borderColor = 'rgba(255, 204, 77, 0.35)';
          e.currentTarget.style.color = '#FAF6EE';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <span style={{ color: '#FFCC4D', fontSize: 13, fontWeight: 800 }}>←</span>
        <span>{t('Home')}</span>
      </Link>

      {/* Top right controls */}
      <div style={{ position: 'absolute', top: 'clamp(12px, 2vh, 20px)', right: 'clamp(12px, 3vw, 24px)', zIndex: 50, display: 'flex', alignItems: 'center', gap: 8 }}>
        <ThemeToggle />
        <LanguageToggle style={{ background: 'var(--bg-surface, #FFFFFF)', border: '1.5px solid var(--border-light, #EBE4D5)', color: 'var(--text-primary, #1C1917)', boxShadow: '0 2px 8px rgba(44,39,32,0.06)' }} />
      </div>

      {/* Left Panel — Branding matching current theme with auto-scroll background pictures */}
      <div
        className="hidden lg:flex flex-col justify-center items-center relative overflow-hidden"
        style={{
          width: '45%',
          background: '#1C1917',
          padding: 48,
          minHeight: '100vh',
        }}
      >
        <AuthBackgroundSlider overlayOpacity={0.72} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <img
            src={logoImg}
            alt="Taleem Ghar"
            style={{
              width: 96,
              height: 96,
              borderRadius: 22,
              objectFit: 'cover',
              margin: '0 auto 20px',
              display: 'block',
              boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
            }}
          />
          <h1 style={{ color: '#FFFFFF', fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>Taleem Ghar</h1>
          <p style={{ color: '#A8A29E', fontSize: 14.5, marginBottom: 40 }}>Apka Ghar, Apka School</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', maxWidth: 380 }}>
            {['📚 66+ Books', '📝 Exams', '📊 Results', '👨‍👩‍👧 Parent Portal'].map(t => (
              <span key={t} style={{ background: 'rgba(255,255,255,0.08)', color: '#FAF6EE', fontSize: 12.5, padding: '7px 15px', borderRadius: 9999, border: '1px solid rgba(255,255,255,0.12)', fontWeight: 500 }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 pt-16 sm:pt-6" style={{ background: 'var(--bg-body, #FAF6EE)', minHeight: '100vh' }}>
        <div style={{ width: '100%', maxWidth: 460 }} className="animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: 28 }}>
            <img
              src={logoImg}
              alt="Taleem Ghar"
              style={{
                width: 72,
                height: 72,
                borderRadius: 18,
                objectFit: 'cover',
                margin: '0 auto 10px',
                display: 'block',
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
              }}
            />
            <h2 style={{ color: 'var(--text-primary, #1C1917)', fontSize: 20, fontWeight: 800 }}>Taleem Ghar</h2>
            <p style={{ color: 'var(--text-secondary, #78716C)', fontSize: 12 }}>Apka Ghar, Apka School</p>
          </div>

          <div style={{ marginBottom: 26 }}>
            <h2 style={{ color: 'var(--text-primary, #1C1917)', fontSize: 28, fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>{t('Welcome back')} <span>👋</span></h2>
            <p style={{ color: 'var(--text-secondary, #78716C)', fontSize: 14 }}>{t('Sign in to your account to continue')}</p>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 12, marginBottom: 16, fontSize: 13, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary, #1C1917)', marginBottom: 6 }}>{t('Email Address')}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  width: '100%',
                  background: 'var(--bg-input, #FFFFFF)',
                  border: '1.5px solid var(--border-input, #E8DFD1)',
                  color: 'var(--text-primary, #1C1917)',
                  padding: '13px 20px',
                  borderRadius: 12,
                  fontSize: 14,
                  outline: 'none',
                  boxShadow: '0 2px 6px rgba(44,39,32,0.03)',
                  transition: 'all 0.2s ease',
                }}
                onFocus={e => { e.target.style.borderColor = '#FFCC4D'; e.target.style.boxShadow = '0 0 0 3px rgba(255,204,77,0.25)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-input, #E8DFD1)'; e.target.style.boxShadow = '0 2px 6px rgba(44,39,32,0.03)'; }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary, #1C1917)' }}>{t('Password')}</label>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  style={{
                    width: '100%',
                    background: 'var(--bg-input, #FFFFFF)',
                    border: '1.5px solid var(--border-input, #E8DFD1)',
                    color: 'var(--text-primary, #1C1917)',
                    padding: '13px 56px 13px 20px',
                    borderRadius: 12,
                    fontSize: 14,
                    outline: 'none',
                    boxShadow: '0 2px 6px rgba(44,39,32,0.03)',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#FFCC4D'; e.target.style.boxShadow = '0 0 0 3px rgba(255,204,77,0.25)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border-input, #E8DFD1)'; e.target.style.boxShadow = '0 2px 6px rgba(44,39,32,0.03)'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-tertiary, #78716C)',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {showPass ? t('Hide') : t('Show')}
                </button>
              </div>
              <div style={{ textAlign: 'right', marginTop: 8 }}>
                <Link to="/forgot-password" style={{ color: 'var(--text-secondary, #78716C)', fontWeight: 500, textDecoration: 'none', fontSize: 12.5 }}>{t('Forgot?')}</Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                marginTop: 6,
                fontWeight: 800,
                fontSize: 15,
                padding: '14px 20px',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? t('Signing in...') : t('Sign In')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary, #78716C)', fontSize: 13.5 }}>
            {t("Don't have an account?")} <Link to="/register" style={{ color: 'var(--color-primary-yellow, #FFCC4D)', fontWeight: 700, textDecoration: 'none' }}>{t('Apply for Admission →')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

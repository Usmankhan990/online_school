import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaWhatsapp, FaInstagram, FaFacebookF, FaLinkedinIn, FaXTwitter, FaTiktok } from 'react-icons/fa6';
import logoImg from '../../assets/logo.jpg';
import LanguageToggle from '../../components/LanguageToggle';
import ThemeToggle from '../../components/ThemeToggle';
import { t, getCurrentLanguage } from '../../utils/translate';

export const scrollToSection = (id, e) => {
  const targetId = (id || '').replace(/^#/, '');
  if (!targetId) return;
  const el = document.getElementById(targetId);
  if (el) {
    if (e && e.preventDefault) e.preventDefault();
    if (targetId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const navHeight = 70;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    window.history.replaceState(null, '', `#${targetId}`);
  } else {
    window.location.href = `/#${targetId}`;
  }
};

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Features', href: '/features' },
  { label: 'Admissions', href: '/admissions' },
  { label: 'Careers', href: '/careers' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const STATS = [
  { value: '66+', label: 'PCTB Books' },
  { value: 'KG-8', label: 'All Classes' },
  { value: '4', label: 'Portals' },
  { value: '100%', label: 'Online' },
];

function PublicNav() {
  const [open, setOpen] = useState(false);
  const [, setLang] = useState(() => getCurrentLanguage());
  const location = useLocation();

  useEffect(() => {
    const handleLangChange = (e) => {
      setLang(e.detail?.lang || getCurrentLanguage());
    };
    window.addEventListener('language-changed', handleLangChange);
    return () => window.removeEventListener('language-changed', handleLangChange);
  }, []);

  const isLinkActive = (href) => {
    const path = (location.pathname || '/').toLowerCase();
    if (href === '/') {
      return path === '/' || path === '' || path === '/online_school' || path === '/online_school/';
    }
    if (href === '/admissions') {
      return path.includes('/admission');
    }
    if (href === '/careers') {
      return path.includes('/career');
    }
    return path.includes(href);
  };

  return (
    <nav className="public-navbar" style={{ background: 'rgba(28, 25, 23, 0.95)', backdropFilter: 'blur(20px)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="public-nav-container" style={{ maxWidth: 'min(94vw, 1560px)', width: '100%', margin: '0 auto', padding: '0 clamp(16px, 3vw, 36px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 'clamp(62px, 7.5vh, 74px)' }}>
        {/* Brand Logo */}
        <Link to="/" onClick={() => window.scrollTo(0, 0)} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', cursor: 'pointer', flexShrink: 0 }}>
          <img src={logoImg} alt="Taleem Ghar" style={{ width: 'clamp(36px, 3.5vw, 44px)', height: 'clamp(36px, 3.5vw, 44px)', borderRadius: 10, objectFit: 'cover', background: '#ffffff', padding: 1 }} />
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 'clamp(15px, 1.2vw, 18px)', lineHeight: 1.2 }}>Taleem Ghar</div>
            <div className="public-nav-subtext" style={{ color: 'rgba(203,213,225,0.75)', fontSize: 'clamp(10.5px, 0.9vw, 12px)' }}>Apka Ghar, Apka School</div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="public-nav-desktop-links" style={{ alignItems: 'center', gap: 'clamp(6px, 1.2vw, 18px)' }}>
          {NAV_LINKS.map(l => {
            const active = isLinkActive(l.href);
            return (
              <Link
                key={l.label}
                to={l.href}
                onClick={() => window.scrollTo(0, 0)}
                style={{
                  color: active ? '#FFCC4D' : 'rgba(203,213,225,0.88)',
                  textDecoration: 'none',
                  fontSize: 'clamp(13px, 1vw, 15px)',
                  fontWeight: active ? 700 : 500,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  padding: 'clamp(5px, 0.8vh, 7px) clamp(10px, 1vw, 15px)',
                  borderRadius: 999,
                  background: active ? 'rgba(255, 204, 77, 0.15)' : 'transparent',
                  border: active ? '1px solid rgba(255, 204, 77, 0.35)' : '1px solid transparent',
                  boxShadow: active ? '0 2px 8px rgba(255, 204, 77, 0.12)' : 'none',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={e => {
                  if (!active) {
                    e.currentTarget.style.color = '#FFCC4D';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  }
                }}
                onMouseOut={e => {
                  if (!active) {
                    e.currentTarget.style.color = 'rgba(203,213,225,0.88)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {t(l.label)}
              </Link>
            );
          })}
        </div>

        {/* Desktop Actions (Theme, Language, Sign In) */}
        <div className="public-nav-desktop-actions" style={{ alignItems: 'center', gap: 10 }}>
          <ThemeToggle />
          <LanguageToggle style={{ color: 'white', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)' }} />
          <Link
            to="/login"
            className="btn"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              fontWeight: 600,
              padding: 'clamp(6px, 0.9vh, 8px) clamp(14px, 1.4vw, 20px)',
              fontSize: 'clamp(13px, 0.95vw, 14.5px)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = '#FFCC4D';
              e.currentTarget.style.color = '#1C1917';
              e.currentTarget.style.borderColor = '#FFCC4D';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            }}
          >
            {t('Sign In')}
          </Link>
        </div>

        {/* Mobile Toggle & Actions */}
        <div className="public-nav-mobile-wrapper" style={{ alignItems: 'center', gap: 8 }}>
          <ThemeToggle />
          <LanguageToggle style={{ color: 'white', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)' }} />
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle Menu"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 8,
              color: 'white',
              cursor: 'pointer',
              padding: '6px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {open ? (
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {open && (
        <div className="public-nav-mobile-dropdown" style={{ padding: '12px clamp(16px, 4vw, 24px) 20px', background: 'rgba(28,25,23,0.98)', borderTop: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
          {NAV_LINKS.map(l => {
            const active = isLinkActive(l.href);
            return (
              <Link
                key={l.label}
                to={l.href}
                onClick={() => {
                  setOpen(false);
                  window.scrollTo(0, 0);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: active ? '#FFCC4D' : '#cbd5e1',
                  fontWeight: active ? 700 : 500,
                  textDecoration: 'none',
                  padding: '11px 14px',
                  fontSize: 15,
                  cursor: 'pointer',
                  background: active ? 'rgba(255, 204, 77, 0.15)' : 'transparent',
                  border: active ? '1px solid rgba(255, 204, 77, 0.35)' : '1px solid transparent',
                  borderRadius: 10,
                  marginBottom: 6,
                }}
              >
                <span>{t(l.label)}</span>
                {active && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FFCC4D' }} />}
              </Link>
            );
          })}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: 'center', padding: '10px 16px', fontSize: 14, fontWeight: 700 }}
            >
              {t('Sign In')}
            </Link>
            <Link
              to="/register"
              onClick={() => setOpen(false)}
              className="btn"
              style={{ flex: 1, justifyContent: 'center', background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 16px', fontSize: 14, fontWeight: 700 }}
            >
              {t('Apply Now')}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

const SOCIAL_LINKS = [
  { name: 'WhatsApp', icon: FaWhatsapp, href: '#' },
  { name: 'Instagram', icon: FaInstagram, href: '#' },
  { name: 'Facebook', icon: FaFacebookF, href: '#' },
  { name: 'LinkedIn', icon: FaLinkedinIn, href: '#' },
  { name: 'Twitter', icon: FaXTwitter, href: '#' },
  { name: 'TikTok', icon: FaTiktok, href: '#' },
];

function Footer() {
  const location = useLocation();
  const [, setLang] = useState(() => getCurrentLanguage());

  useEffect(() => {
    const handleLangChange = (e) => {
      setLang(e.detail?.lang || getCurrentLanguage());
    };
    window.addEventListener('language-changed', handleLangChange);
    return () => window.removeEventListener('language-changed', handleLangChange);
  }, []);

  const isLinkActive = (href) => {
    const path = (location.pathname || '/').toLowerCase();
    if (href === '/') {
      return path === '/' || path === '' || path === '/online_school' || path === '/online_school/';
    }
    if (href === '/admissions') {
      return path.includes('/admission');
    }
    if (href === '/careers') {
      return path.includes('/career');
    }
    return path.includes(href);
  };

  return (
    <footer style={{ background: '#1C1917', color: '#A8A29E', borderTop: '1px solid #292524' }}>
      <div style={{ maxWidth: 'min(94vw, 1560px)', width: '100%', margin: '0 auto', padding: '48px clamp(16px, 3vw, 36px) 24px' }}>
        <div className="footer-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <img src={logoImg} alt="Taleem Ghar" style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover', background: '#ffffff', padding: 1 }} />
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>Taleem Ghar</div>
                <div style={{ color: 'rgba(255, 204, 77, 0.9)', fontSize: 11.5, fontWeight: 600 }}>Apka Ghar, Apka School</div>
              </div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 18 }}>Complete online school platform for KG to 8th grade following Punjab Board (PCTB 2026) curriculum.</p>
            
            {/* Social Icons under description */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {SOCIAL_LINKS.map(s => {
                const IconComponent = s.icon;
                return (
                  <a
                    key={s.name}
                    href={s.href}
                    aria-label={s.name}
                    title={s.name}
                    onClick={(e) => { if (s.href === '#') e.preventDefault(); }}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#D6D3D1',
                      fontSize: 16,
                      transition: 'all 0.25s ease',
                      textDecoration: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = '#FFCC4D';
                      e.currentTarget.style.color = '#1C1917';
                      e.currentTarget.style.borderColor = '#FFCC4D';
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 204, 77, 0.25)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                      e.currentTarget.style.color = '#D6D3D1';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <IconComponent />
                  </a>
                );
              })}
            </div>
          </div>
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, fontSize: 14, marginBottom: 12 }}>{t('Quick Links')}</h4>
            {NAV_LINKS.map(l => {
              const active = isLinkActive(l.href);
              return (
                <Link
                  key={l.label}
                  to={l.href}
                  onClick={() => window.scrollTo(0, 0)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: active ? '#FFCC4D' : '#A8A29E',
                    fontWeight: active ? 700 : 500,
                    textDecoration: 'none',
                    fontSize: 13,
                    padding: '4px 0',
                    transition: 'color 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseOver={e => {
                    if (!active) e.currentTarget.style.color = '#FFCC4D';
                  }}
                  onMouseOut={e => {
                    if (!active) e.currentTarget.style.color = '#A8A29E';
                  }}
                >
                  {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFCC4D', display: 'inline-block' }} />}
                  <span>{t(l.label)}</span>
                </Link>
              );
            })}
          </div>
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, fontSize: 14, marginBottom: 12 }}>{t('Portals')}</h4>
            {['Admin Login', 'Teacher Login', 'Student Login', 'Parent Login'].map(l => (
              <Link key={l} to="/login" style={{ display: 'block', color: '#A8A29E', textDecoration: 'none', fontSize: 13, padding: '4px 0', transition: 'color 0.2s' }}
                onMouseOver={e => e.target.style.color='#FFCC4D'} onMouseOut={e => e.target.style.color='#A8A29E'}>{t(l)}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, fontSize: 14, marginBottom: 12 }}>{t('Legal')}</h4>
            {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']].map(([l, h]) => (
              <Link key={l} to={h} style={{ display: 'block', color: '#A8A29E', textDecoration: 'none', fontSize: 13, padding: '4px 0' }}>{t(l)}</Link>
            ))}
          </div>
        </div>
        <div className="footer-bottom-bar" style={{ borderTop: '1px solid #292524', paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontSize: 13 }}>
          <div>© {new Date().getFullYear()} Taleem Ghar. All rights reserved.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#78716C' }}>Official Channels:</span>
            {SOCIAL_LINKS.map(s => {
              const IconComponent = s.icon;
              return (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.name}
                  title={s.name}
                  onClick={(e) => { if (s.href === '#') e.preventDefault(); }}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#A8A29E',
                    fontSize: 13,
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = '#FFCC4D';
                    e.currentTarget.style.color = '#1C1917';
                    e.currentTarget.style.borderColor = '#FFCC4D';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = '#A8A29E';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <IconComponent />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

export { PublicNav, Footer };

export default function LandingPage() {
  return (
    <div className="landing-page-root" style={{ background: '#1C1917', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      {/* ── Auto-Fluid Scaling Media Queries for All Screen Displays ── */}
      <style>{`
        .public-nav-desktop-links {
          display: flex;
        }
        .public-nav-desktop-actions {
          display: flex;
        }
        .public-nav-mobile-wrapper {
          display: none;
        }
        
        .hero-main-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: clamp(20px, 4vw, 56px);
          align-items: center;
          width: 100%;
        }
        .hero-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: clamp(10px, 1.5vw, 18px);
          width: 100%;
        }
        .hero-cta-buttons {
          display: flex;
          gap: clamp(10px, 1.2vw, 16px);
          flex-wrap: wrap;
        }

        /* Large & Ultra-wide displays (1440px to 4K) */
        @media (min-width: 1600px) {
          .public-nav-container,
          .hero-content-wrapper,
          .hero-stats-wrapper {
            max-width: 1680px !important;
          }
        }
        @media (min-width: 2200px) {
          .public-nav-container,
          .hero-content-wrapper,
          .hero-stats-wrapper {
            max-width: 2100px !important;
          }
        }

        /* Tablet & Intermediate screens */
        @media (max-width: 980px) {
          .public-nav-desktop-links {
            display: none !important;
          }
          .public-nav-desktop-actions {
            display: none !important;
          }
          .public-nav-mobile-wrapper {
            display: flex !important;
          }
          .hero-main-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .hero-main-grid .animate-slide-up {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .hero-cta-buttons {
            justify-content: center;
          }
          .hero-portal-mockup-wrapper {
            display: none !important;
          }
        }

        /* Mobile screens */
        @media (max-width: 768px) {
          .hero-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          .footer-grid-container {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 24px !important;
          }
        }

        @media (max-width: 480px) {
          .public-nav-subtext {
            display: none !important;
          }
          .hero-cta-buttons {
            flex-direction: column;
            width: 100%;
          }
          .hero-cta-buttons a {
            width: 100%;
            justify-content: center;
          }
          .hero-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .footer-grid-container {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .footer-bottom-bar {
            flex-direction: column !important;
            text-align: center !important;
            justify-content: center !important;
          }
        }

        /* Height-based viewport adjustments to guarantee full-screen fit */
        @media (min-height: 850px) {
          #hero {
            padding-top: clamp(85px, 11vh, 120px) !important;
            padding-bottom: clamp(24px, 4vh, 48px) !important;
          }
        }
        @media (max-height: 740px) {
          #hero {
            padding-top: 72px !important;
            padding-bottom: 12px !important;
          }
          .hero-stats-grid > div {
            padding: 8px 10px !important;
          }
        }
      `}</style>

      <PublicNav />

      {/* ── 100VH FULL-VIEWPORT HERO SECTION ── */}
      <section
        id="hero"
        className="gradient-bg-hero"
        style={{
          minHeight: '100vh',
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          paddingTop: 'clamp(76px, 9.5vh, 110px)',
          paddingBottom: 'clamp(16px, 3vh, 36px)',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1.5\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        
        {/* Main Center Content (Auto-expanding across wide displays) */}
        <div className="hero-content-wrapper" style={{ maxWidth: 'min(94vw, 1560px)', width: '100%', margin: 'auto auto', padding: '0 clamp(16px, 3vw, 36px)', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
          <div className="hero-main-grid">
            <div className="animate-slide-up">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,204,77,0.18)', borderRadius: 999, padding: '5px 14px', marginBottom: 'clamp(10px, 1.5vh, 16px)', border: '1px solid rgba(255,204,77,0.4)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFCC4D', animation: 'pulse-soft 2s infinite' }}></span>
                <span style={{ color: '#FFCC4D', fontSize: 'clamp(11.5px, 1vw, 13.5px)', fontWeight: 700 }}>Admissions Open — Session 2026</span>
              </div>
              <h1 style={{ color: 'white', fontSize: 'clamp(28px, 3.8vw, 54px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 'clamp(10px, 1.6vh, 18px)' }}>
                Pakistan's Premier<br />
                <span style={{ background: 'linear-gradient(135deg, #FFCC4D, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Online School</span>
              </h1>
              <p style={{ color: '#D6D3D1', fontSize: 'clamp(14px, 1.15vw, 17.5px)', lineHeight: 1.6, marginBottom: 'clamp(16px, 2.5vh, 26px)', maxWidth: 'clamp(480px, 42vw, 680px)' }}>
                Complete KG to 8th grade education following Punjab Board (PCTB 2026). Digital books, live classes, exams, results — all in one place.
              </p>
              <div className="hero-cta-buttons">
                <Link to="/register" className="btn btn-primary" style={{ fontSize: 'clamp(14px, 1vw, 16px)', padding: 'clamp(10px, 1.2vh, 14px) clamp(20px, 1.8vw, 30px)', whiteSpace: 'nowrap' }}>
                  Apply for Admission →
                </Link>
                <Link
                  to="/features"
                  className="btn"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', fontSize: 'clamp(14px, 1vw, 16px)', padding: 'clamp(10px, 1.2vh, 14px) clamp(18px, 1.6vw, 26px)', cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap' }}
                >
                  Explore Features
                </Link>
              </div>
            </div>

            {/* Portal Card Mockup (Scales seamlessly on Big Screens) */}
            <div className="hero-portal-mockup-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: 'clamp(360px, 32vw, 500px)', height: 'clamp(260px, 27vh, 340px)', borderRadius: 22, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', flexDirection: 'column', padding: 'clamp(16px, 2vh, 24px)', gap: 12, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ef4444' }} />
                  <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#fbbf24' }} />
                  <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#10b981' }} />
                </div>
                <div style={{ flex: 1, borderRadius: 14, background: 'rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, border: '1px solid rgba(255,255,255,0.06)', padding: 14 }}>
                  <img
                    src={logoImg}
                    alt="Taleem Ghar"
                    style={{
                      width: 'clamp(64px, 5.5vw, 84px)',
                      height: 'clamp(64px, 5.5vw, 84px)',
                      borderRadius: 18,
                      objectFit: 'cover',
                      background: '#ffffff',
                      padding: 2,
                      boxShadow: '0 10px 28px rgba(0,0,0,0.35)',
                      border: '1px solid rgba(255,255,255,0.12)'
                    }}
                  />
                  <span style={{ color: '#ffffff', fontSize: 'clamp(14px, 1.1vw, 17px)', fontWeight: 700 }}>Taleem Ghar Portal</span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {['📚 Books', '📝 Exams', '📊 Results'].map(t => (
                      <span key={t} style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', fontSize: 'clamp(11px, 0.9vw, 13px)', padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)', fontWeight: 600 }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats bar (Scales proportionally and fills width on big displays) */}
        <div className="hero-stats-wrapper" style={{ maxWidth: 'min(94vw, 1560px)', width: '100%', margin: '0 auto', padding: '0 clamp(16px, 3vw, 36px)', position: 'relative', zIndex: 1 }}>
          <div className="hero-stats-grid">
            {STATS.map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 'clamp(10px, 1.6vh, 18px) 14px', textAlign: 'center', border: '1.5px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
                <div style={{ color: '#10b981', fontSize: 'clamp(20px, 2.2vw, 32px)', fontWeight: 800, lineHeight: 1.2 }}>{s.value}</div>
                <div style={{ color: '#94a3b8', fontSize: 'clamp(11.5px, 1vw, 14px)', marginTop: 3, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer appears when scrolling down */}
      <Footer />
    </div>
  );
}

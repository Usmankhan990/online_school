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

const FEATURES = [
  { icon: '📚', title: 'Digital Library', desc: 'Access PCTB 2026 textbooks anytime, anywhere. Complete KG to 8th class curriculum.' },
  { icon: '📝', title: 'Online Exams', desc: 'MCQ & subjective exams with auto-grading, timers, and instant results.' },
  { icon: '📊', title: 'Results & Report Cards', desc: 'Official report cards, grade tracking, and performance analytics.' },
  { icon: '🎥', title: 'Live & Recorded Classes', desc: 'Join live classes and revisit recorded lectures at your own pace.' },
  { icon: '📋', title: 'Homework & Classwork', desc: 'Assignments with file submissions, due dates, and teacher feedback.' },
  { icon: '✅', title: 'Attendance Tracking', desc: 'Daily attendance with monthly summaries for students and parents.' },
  { icon: '💰', title: 'Fee Management', desc: 'Transparent fee tracking with payment history and reminders.' },
  { icon: '👨‍👩‍👧', title: 'Parent Portal', desc: 'Parents monitor attendance, results, homework, and fees in real-time.' },
];

const STATS = [
  { value: '66+', label: 'PCTB Books' },
  { value: 'KG-8', label: 'All Classes' },
  { value: '4', label: 'Portals' },
  { value: '100%', label: 'Online' },
];

const FAQ = [
  { q: 'Which board does this school follow?', a: 'We follow the Punjab Curriculum & Textbook Board (PCTB) 2026 edition for classes KG to 8th.' },
  { q: 'How does admission work?', a: 'Students fill an online admission form. Once submitted, our admin reviews and approves the application. You\'ll receive a notification once approved.' },
  { q: 'Can parents monitor their child\'s progress?', a: 'Yes! Parents have a dedicated portal to view attendance, homework status, exam results, report cards, and fee status.' },
  { q: 'Are the textbooks free?', a: 'Yes, all PCTB textbooks are freely accessible through our digital library. Students can read them online anytime.' },
  { q: 'What devices are supported?', a: 'Our platform works on desktops, laptops, tablets, and mobile phones. All you need is a web browser.' },
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
    <nav style={{ background: 'rgba(28, 25, 23, 0.95)', backdropFilter: 'blur(20px)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ maxWidth: 1600, width: '100%', margin: '0 auto', padding: '0 clamp(16px, 3.5vw, 48px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
        <Link to="/" onClick={() => window.scrollTo(0, 0)} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', cursor: 'pointer' }}>
          <img src={logoImg} alt="Taleem Ghar" style={{ width: 42, height: 42, borderRadius: 10, objectFit: 'cover', background: '#ffffff', padding: 1 }} />
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>Taleem Ghar</div>
            <div style={{ color: 'rgba(203,213,225,0.75)', fontSize: 11 }}>Apka Ghar, Apka School</div>
          </div>
        </Link>
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 16 }}>
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
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  padding: '6px 14px',
                  borderRadius: 999,
                  background: active ? 'rgba(255, 204, 77, 0.15)' : 'transparent',
                  border: active ? '1px solid rgba(255, 204, 77, 0.35)' : '1px solid transparent',
                  boxShadow: active ? '0 2px 8px rgba(255, 204, 77, 0.12)' : 'none',
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
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 12 }}>
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
              transition: 'all 0.2s ease'
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
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle style={{ color: 'white', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)' }} />
          <button onClick={() => setOpen(!open)} aria-label="Toggle Menu" style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 8 }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden" style={{ padding: '12px clamp(16px, 4vw, 24px) 20px', background: 'rgba(28,25,23,0.98)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
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
                  padding: '10px 14px',
                  fontSize: 15,
                  cursor: 'pointer',
                  background: active ? 'rgba(255, 204, 77, 0.15)' : 'transparent',
                  border: active ? '1px solid rgba(255, 204, 77, 0.35)' : '1px solid transparent',
                  borderRadius: 10,
                  marginBottom: 4,
                }}
              >
                <span>{t(l.label)}</span>
                {active && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FFCC4D' }} />}
              </Link>
            );
          })}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Link to="/login" className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>{t('Sign In')}</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

const SOCIAL_LINKS = [
  { name: 'WhatsApp', icon: FaWhatsapp, href: 'https://whatsapp.com/channel/0029VbDjfv323n3nkQJLDR30' },
  { name: 'Instagram', icon: FaInstagram, href: 'https://www.instagram.com/taleemghar1/' },
  { name: 'Facebook', icon: FaFacebookF, href: 'https://www.facebook.com/TaleemGhar11' },
  { name: 'LinkedIn', icon: FaLinkedinIn, href: 'https://www.linkedin.com/company/taleem-ghar/' },
  { name: 'Twitter', icon: FaXTwitter, href: 'https://x.com/TaleemGhar1' },
  { name: 'TikTok', icon: FaTiktok, href: 'https://www.tiktok.com/@taleem.ghar1?is_from_webapp=1&sender_device=pc' },
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
      <div style={{ maxWidth: 1600, width: '100%', margin: '0 auto', padding: '48px clamp(16px, 3.5vw, 48px) 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 32 }}>
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
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    title={s.name}
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
        <div style={{ borderTop: '1px solid #292524', paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontSize: 13 }}>
          <div>© {new Date().getFullYear()} Taleem Ghar. All rights reserved.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#78716C' }}>Official Channels:</span>
            {SOCIAL_LINKS.map(s => {
              const IconComponent = s.icon;
              return (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  title={s.name}
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
    <div style={{ background: '#1C1917', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      <PublicNav />

      {/* ── 100VH FULL SCREEN HERO ── */}
      <section
        id="hero"
        className="gradient-bg-hero"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          paddingTop: 'clamp(80px, 10vh, 95px)',
          paddingBottom: 'clamp(20px, 3vh, 32px)',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1.5\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        
        {/* Main Center Content */}
        <div style={{ maxWidth: 1600, width: '100%', margin: 'auto auto', padding: '0 clamp(16px, 3.5vw, 48px)', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div className="animate-slide-up">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,204,77,0.18)', borderRadius: 999, padding: '5px 14px', marginBottom: 14, border: '1px solid rgba(255,204,77,0.4)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFCC4D', animation: 'pulse-soft 2s infinite' }}></span>
                <span style={{ color: '#FFCC4D', fontSize: 12.5, fontWeight: 700 }}>Admissions Open — Session 2026</span>
              </div>
              <h1 style={{ color: 'white', fontSize: 'clamp(28px, 4.5vw, 48px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 14 }}>
                Pakistan's Premier<br />
                <span style={{ background: 'linear-gradient(135deg, #FFCC4D, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Online School</span>
              </h1>
              <p style={{ color: '#D6D3D1', fontSize: 'clamp(14px, 1.5vw, 16.5px)', lineHeight: 1.6, marginBottom: 22, maxWidth: 520 }}>
                Complete KG to 8th grade education following Punjab Board (PCTB 2026). Digital books, live classes, exams, results — all in one place.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/register" className="btn btn-primary" style={{ fontSize: 15, padding: '10px 24px' }}>
                  Apply for Admission →
                </Link>
                <Link
                  to="/features"
                  className="btn"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', fontSize: 15, padding: '10px 22px', cursor: 'pointer', textDecoration: 'none' }}
                >
                  Explore Features
                </Link>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }} className="hidden lg:flex">
              <div style={{ width: '100%', maxWidth: 420, height: 280, borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', padding: 20, gap: 10 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ef4444' }} />
                  <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#fbbf24' }} />
                  <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#10b981' }} />
                </div>
                <div style={{ flex: 1, borderRadius: 12, background: 'rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, border: '1px solid rgba(255,255,255,0.05)', padding: 14 }}>
                  <img
                    src={logoImg}
                    alt="Taleem Ghar"
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: 16,
                      objectFit: 'cover',
                      background: '#ffffff',
                      padding: 2,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  />
                  <span style={{ color: '#ffffff', fontSize: 14.5, fontWeight: 700 }}>Taleem Ghar Portal</span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {['📚 Books', '📝 Exams', '📊 Results'].map(t => (
                      <span key={t} style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', fontSize: 11.5, padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(16,185,129,0.15)' }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats bar at bottom of 100vh viewport */}
        <div style={{ maxWidth: 1600, width: '100%', margin: '0 auto', padding: '0 clamp(16px, 3.5vw, 48px)', position: 'relative', zIndex: 1 }}>
          <div className="hero-stats-grid">
            {STATS.map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 12px', textAlign: 'center', border: '1.5px solid rgba(255,255,255,0.07)' }}>
                <div style={{ color: '#10b981', fontSize: 'clamp(20px, 2.8vw, 26px)', fontWeight: 800, lineHeight: 1.2 }}>{s.value}</div>
                <div style={{ color: '#94a3b8', fontSize: 'clamp(11px, 1.2vw, 13px)', marginTop: 2 }}>{s.label}</div>
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

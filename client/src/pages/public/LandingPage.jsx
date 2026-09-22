import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logoImg from '../../assets/logo.jpg';
import LanguageToggle from '../../components/LanguageToggle';

export const scrollToSection = (id, e) => {
  const targetId = (id || '').replace(/^#/, '');
  if (!targetId) return;
  const el = document.getElementById(targetId);
  if (el) {
    if (e && e.preventDefault) e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${targetId}`);
  } else {
    window.location.href = `/#${targetId}`;
  }
};

const NAV_LINKS = [
  { label: 'Home', id: 'hero', href: '/#hero' },
  { label: 'About', id: 'about', href: '/#about' },
  { label: 'Features', id: 'features', href: '/#features' },
  { label: 'Admissions', id: 'admissions', href: '/#admissions' },
  { label: 'Contact', id: 'contact', href: '/#contact' },
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
  return (
    <nav style={{ background: 'rgba(30, 58, 95, 0.96)', backdropFilter: 'blur(20px)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ maxWidth: 1320, width: '100%', margin: '0 auto', padding: '0 clamp(16px, 3vw, 32px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
        <a href="/#hero" onClick={(e) => scrollToSection('hero', e)} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', cursor: 'pointer' }}>
          <img src={logoImg} alt="Taleem Ghar" style={{ width: 42, height: 42, borderRadius: 10, objectFit: 'cover', background: '#ffffff', padding: 1 }} />
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>Taleem Ghar</div>
            <div style={{ color: 'rgba(203,213,225,0.75)', fontSize: 11 }}>KG to 8th Punjab Board</div>
          </div>
        </a>
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 28 }}>
          {NAV_LINKS.map(l => (
            <a
              key={l.id}
              href={l.href}
              onClick={(e) => scrollToSection(l.id, e)}
              style={{ color: 'rgba(203,213,225,0.9)', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s', cursor: 'pointer' }}
              onMouseOver={e => e.target.style.color = 'white'}
              onMouseOut={e => e.target.style.color = 'rgba(203,213,225,0.9)'}
            >
              {l.label}
            </a>
          ))}
        </div>
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 12 }}>
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
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.color = '#1e3a5f';
              e.currentTarget.style.borderColor = '#ffffff';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
            }}
          >
            Sign In
          </Link>
          <Link to="/register" className="btn btn-accent">Apply Now</Link>
        </div>
        <div className="md:hidden flex items-center gap-2">
          <LanguageToggle style={{ color: 'white', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)' }} />
          <button onClick={() => setOpen(!open)} aria-label="Toggle Menu" style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 8 }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden" style={{ padding: '12px clamp(16px, 4vw, 24px) 20px', background: 'rgba(15,23,42,0.98)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {NAV_LINKS.map(l => (
            <a
              key={l.id}
              href={l.href}
              onClick={(e) => {
                setOpen(false);
                scrollToSection(l.id, e);
              }}
              style={{ display: 'block', color: '#cbd5e1', textDecoration: 'none', padding: '10px 0', fontSize: 15, cursor: 'pointer' }}
            >
              {l.label}
            </a>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Link to="/login" className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Sign In</Link>
            <Link to="/register" className="btn btn-accent btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Apply Now</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', borderTop: '1px solid #1e293b' }}>
      <div style={{ maxWidth: 1320, width: '100%', margin: '0 auto', padding: '48px clamp(16px, 3vw, 32px) 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <img src={logoImg} alt="Taleem Ghar" style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover', background: '#ffffff', padding: 1 }} />
              <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Taleem Ghar</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6 }}>Complete online school platform for KG to 8th grade following Punjab Board (PCTB 2026) curriculum.</p>
          </div>
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Quick Links</h4>
            {[
              { label: 'About', id: 'about' },
              { label: 'Features', id: 'features' },
              { label: 'Admissions', id: 'admissions' },
              { label: 'Contact', id: 'contact' },
            ].map(l => (
              <a
                key={l.label}
                href={`/#${l.id}`}
                onClick={(e) => scrollToSection(l.id, e)}
                style={{
                  display: 'block',
                  color: '#94a3b8',
                  textDecoration: 'none',
                  fontSize: 13,
                  padding: '4px 0',
                  transition: 'color 0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={e => e.target.style.color='#10b981'}
                onMouseOut={e => e.target.style.color='#94a3b8'}
              >
                {l.label}
              </a>
            ))}
          </div>
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Portals</h4>
            {['Admin Login', 'Teacher Login', 'Student Login', 'Parent Login'].map(l => (
              <Link key={l} to="/login" style={{ display: 'block', color: '#94a3b8', textDecoration: 'none', fontSize: 13, padding: '4px 0', transition: 'color 0.2s' }}
                onMouseOver={e => e.target.style.color='#10b981'} onMouseOut={e => e.target.style.color='#94a3b8'}>{l}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ color: 'white', fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Legal</h4>
            {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']].map(([l, h]) => (
              <Link key={l} to={h} style={{ display: 'block', color: '#94a3b8', textDecoration: 'none', fontSize: 13, padding: '4px 0' }}>{l}</Link>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: 20, textAlign: 'center', fontSize: 13 }}>
          © {new Date().getFullYear()} Taleem Ghar. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export { PublicNav, Footer };

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    if (window.location.hash) {
      const targetId = window.location.hash.replace(/^#/, '');
      const el = document.getElementById(targetId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, []);

  return (
    <div style={{ background: '#f8fafc', width: '100%', overflowX: 'hidden' }}>
      <PublicNav />

      {/* ── HERO ── */}
      <section id="hero" className="gradient-bg-hero" style={{ paddingTop: 'clamp(96px, 12vh, 130px)', paddingBottom: 'clamp(48px, 8vh, 80px)', position: 'relative', overflow: 'hidden', width: '100%' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1.5\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div style={{ maxWidth: 1320, width: '100%', margin: '0 auto', padding: '0 clamp(16px, 3vw, 32px)', position: 'relative', zIndex: 1 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="animate-slide-up">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.15)', borderRadius: 999, padding: '6px 16px', marginBottom: 20, border: '1px solid rgba(16,185,129,0.2)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse-soft 2s infinite' }}></span>
                <span style={{ color: '#34d399', fontSize: 13, fontWeight: 600 }}>Admissions Open — Session 2026</span>
              </div>
              <h1 style={{ color: 'white', fontSize: 'clamp(30px, 5.5vw, 54px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 20 }}>
                Pakistan's Premier<br />
                <span style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Online School</span>
              </h1>
              <p style={{ color: '#94a3b8', fontSize: 'clamp(15px, 1.8vw, 18px)', lineHeight: 1.6, marginBottom: 32, maxWidth: 540 }}>
                Complete KG to 8th grade education following Punjab Board (PCTB 2026). Digital books, live classes, exams, results — all in one place.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/register" className="btn btn-accent btn-lg" style={{ fontSize: 16 }}>
                  Apply for Admission →
                </Link>
                <a
                  href="/#features"
                  onClick={(e) => scrollToSection('features', e)}
                  className="btn btn-lg"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', fontSize: 16, cursor: 'pointer', textDecoration: 'none' }}
                >
                  Explore Features
                </a>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }} className="hidden lg:flex">
              <div style={{ width: '100%', maxWidth: 440, height: 320, borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', padding: 24, gap: 12 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fbbf24' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }} />
                </div>
                <div style={{ flex: 1, borderRadius: 12, background: 'rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, border: '1px solid rgba(255,255,255,0.05)', padding: 16 }}>
                  <img
                    src={logoImg}
                    alt="Taleem Ghar"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 18,
                      objectFit: 'cover',
                      background: '#ffffff',
                      padding: 2,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  />
                  <span style={{ color: '#ffffff', fontSize: 15, fontWeight: 700 }}>Taleem Ghar Portal</span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {['📚 Books', '📝 Exams', '📊 Results'].map(t => (
                      <span key={t} style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', fontSize: 12, padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(16,185,129,0.15)' }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16, marginTop: 'clamp(36px, 6vw, 60px)' }}>
            {STATS.map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '20px 16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ color: '#10b981', fontSize: 28, fontWeight: 800 }}>{s.value}</div>
                <div style={{ color: '#94a3b8', fontSize: 13 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ maxWidth: 1320, width: '100%', margin: '0 auto', padding: 'clamp(48px, 8vw, 80px) clamp(16px, 3vw, 32px)', scrollMarginTop: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ color: '#10b981', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Platform Features</span>
          <h2 style={{ color: '#0f172a', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, marginTop: 8 }}>Everything a School Needs, Online</h2>
          <p style={{ color: '#64748b', fontSize: 16, marginTop: 8, maxWidth: 600, margin: '8px auto 0' }}>From admission to report cards — a complete digital school experience for students, teachers, and parents.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {FEATURES.map(f => (
            <div key={f.title} className="card" style={{ padding: 24, cursor: 'default' }}>
              <span style={{ fontSize: 36, display: 'block', marginBottom: 12 }}>{f.icon}</span>
              <h3 style={{ color: '#0f172a', fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS / ADMISSIONS ── */}
      <section id="admissions" style={{ background: '#f1f5f9', padding: 'clamp(48px, 8vw, 80px) clamp(16px, 3vw, 32px)', scrollMarginTop: '80px' }}>
        <div style={{ maxWidth: 1320, width: '100%', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ color: '#10b981', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Get Started</span>
            <h2 style={{ color: '#0f172a', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, marginTop: 8 }}>How It Works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
            {[
              { step: '1', title: 'Apply Online', desc: 'Fill the admission form with student details and required documents.', color: '#3b82f6' },
              { step: '2', title: 'Admin Approval', desc: 'Our admin reviews and approves your application within 24 hours.', color: '#f59e0b' },
              { step: '3', title: 'Start Learning', desc: 'Login to your portal, access books, attend classes, and track progress.', color: '#10b981' },
            ].map(s => (
              <div key={s.step} style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: s.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, margin: '0 auto 16px' }}>{s.step}</div>
                <h3 style={{ color: '#0f172a', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4 PORTALS / ABOUT ── */}
      <section id="about" style={{ maxWidth: 1320, width: '100%', margin: '0 auto', padding: 'clamp(48px, 8vw, 80px) clamp(16px, 3vw, 32px)', scrollMarginTop: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ color: '#10b981', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Role-Based Access</span>
          <h2 style={{ color: '#0f172a', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, marginTop: 8 }}>4 Dedicated Portals</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {[
            { icon: '🛡️', role: 'Super Admin', desc: 'Full system control. Manage students, teachers, classes, fees, and everything.', color: '#1e3a5f' },
            { icon: '👨‍🏫', role: 'Teacher', desc: 'Create courses, upload materials, manage homework, exams, and attendance.', color: '#7c3aed' },
            { icon: '👨‍🎓', role: 'Student', desc: 'Access books, attend classes, submit homework, take exams, view results.', color: '#10b981' },
            { icon: '👨‍👩‍👧', role: 'Parent', desc: 'Monitor your child\'s attendance, grades, homework, and fees in real-time.', color: '#f59e0b' },
          ].map(p => (
            <div key={p.role} className="card" style={{ padding: 28, borderTop: `3px solid ${p.color}` }}>
              <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>{p.icon}</span>
              <h3 style={{ color: '#0f172a', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{p.role}</h3>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ & CONTACT ── */}
      <section id="contact" style={{ background: '#f1f5f9', padding: 'clamp(48px, 8vw, 80px) clamp(16px, 3vw, 32px)', scrollMarginTop: '80px' }}>
        <div style={{ maxWidth: 760, width: '100%', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ color: '#10b981', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Help & Contact</span>
            <h2 style={{ color: '#0f172a', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, marginTop: 8 }}>Frequently Asked Questions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FAQ.map((f, i) => (
              <div key={i} className="card" style={{ overflow: 'hidden' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ color: '#0f172a', fontWeight: 600, fontSize: 15 }}>{f.q}</span>
                  <span style={{ color: '#94a3b8', fontSize: 20, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 20px 16px', color: '#64748b', fontSize: 14, lineHeight: 1.6 }} className="animate-slide-down">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="gradient-bg-hero" style={{ padding: 'clamp(48px, 8vw, 80px) clamp(16px, 3vw, 32px)', textAlign: 'center', width: '100%' }}>
        <div style={{ maxWidth: 640, width: '100%', margin: '0 auto' }}>
          <h2 style={{ color: 'white', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, marginBottom: 16 }}>Ready to Start Learning?</h2>
          <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>
            Join Taleem Ghar today. Admissions are open for session 2026.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-accent btn-lg" style={{ fontSize: 16 }}>Apply for Admission →</Link>
            <Link
              to="/login"
              className="btn btn-lg"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.25)',
                fontSize: 16,
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#1e3a5f';
                e.currentTarget.style.borderColor = '#ffffff';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

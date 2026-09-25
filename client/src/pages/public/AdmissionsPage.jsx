import { Link } from 'react-router-dom';
import { PublicNav, Footer } from './LandingPage';
import { t } from '../../utils/translate';

export default function AdmissionsPage() {
  const steps = [
    {
      step: '01',
      title: 'Online Registration',
      desc: 'Fill out the comprehensive online admission form with student details, parent/guardian info, and select the grade (KG to 8th).',
      badge: 'Step 1'
    },
    {
      step: '02',
      title: 'Document Upload',
      desc: 'Upload necessary documents including B-Form / Birth Certificate, previous school leaving certificate (if applicable), and passport-size photo.',
      badge: 'Step 2'
    },
    {
      step: '03',
      title: 'Admin Verification',
      desc: 'Our academic admissions team reviews the application and verifies documents within 24 to 48 business hours.',
      badge: 'Step 3'
    },
    {
      step: '04',
      title: 'Welcome & Portal Access',
      desc: 'Receive immediate login credentials to access the Student Portal, live classes, digital PCTB 2026 textbooks, and assignments.',
      badge: 'Step 4'
    }
  ];

  const grades = [
    {
      level: 'Early Years',
      classes: 'KG - Class 1',
      focus: 'Foundational literacy, numeracy, activity-based interactive learning, and moral development.',
      color: '#3B82F6'
    },
    {
      level: 'Primary School',
      classes: 'Class 2 - Class 5',
      focus: 'Core concepts in Mathematics, General Science, English, Urdu, Islamiat, and Social Studies (PCTB 2026).',
      color: '#10B981'
    },
    {
      level: 'Middle School',
      classes: 'Class 6 - Class 8',
      focus: 'Advanced curriculum, computer education, scientific reasoning, live classes, and preparation for board standards.',
      color: '#F59E0B'
    }
  ];

  const requirements = [
    { icon: '📄', title: 'Student B-Form / Birth Certificate', desc: 'NADRA B-Form copy or official government birth certificate.' },
    { icon: '🆔', title: 'Parent / Guardian CNIC', desc: 'Valid CNIC copy of father or legal guardian.' },
    { icon: '📸', title: 'Recent Photograph', desc: 'Passport-size digital photograph with blue or white background.' },
    { icon: '📜', title: 'Previous School Result (Class 1-8)', desc: 'Report card or school leaving certificate from previous institution.' }
  ];

  return (
    <div style={{ background: 'var(--bg-body, #FAF6EE)', minHeight: '100vh', color: 'var(--text-primary, #1C1917)' }}>
      <PublicNav />
      {/* Hero Section */}
      <section className="gradient-bg-hero" style={{
        minHeight: '100vh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 'clamp(80px, 10vh, 100px)',
        paddingBottom: 'clamp(40px, 6vh, 60px)',
        paddingLeft: 'clamp(16px, 3vw, 32px)',
        paddingRight: 'clamp(16px, 3vw, 32px)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1.5\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
          <div style={{ maxWidth: 880, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,204,77,0.18)', borderRadius: 999, padding: '6px 18px', marginBottom: 20, border: '1px solid rgba(255,204,77,0.4)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFCC4D', animation: 'pulse-soft 2s infinite' }}></span>
              <span style={{ color: '#FFCC4D', fontSize: 13, fontWeight: 700 }}>{t('Admissions Open')} — Session 2026</span>
            </div>
            <h1 style={{ color: 'white', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, lineHeight: 1.2, marginBottom: 18 }}>
              Begin Your Journey with <span style={{ background: 'linear-gradient(135deg, #FFCC4D, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Taleem Ghar</span>
            </h1>
            <p style={{ color: '#D8CEBD', fontSize: 'clamp(15px, 1.8vw, 18px)', lineHeight: 1.6, maxWidth: 680, margin: '0 auto 32px' }}>
              Simple, transparent, and 100% online admission procedure for classes KG through 8th. Empower your child with quality education from anywhere in Pakistan.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg" style={{ fontSize: 16, borderRadius: 9999 }}>
                {t('Apply for Admission')} →
              </Link>
              <Link
                to="/contact"
                className="btn btn-lg"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.25)',
                  fontSize: 16,
                  borderRadius: 9999,
                  textDecoration: 'none'
                }}
              >
                {t('Contact Admissions Office')}
              </Link>
            </div>
          </div>
        </section>

        {/* Admission Steps */}
        <section style={{ maxWidth: 1600, width: '100%', margin: '0 auto', padding: 'clamp(40px, 6vw, 64px) clamp(16px, 3.5vw, 48px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ background: 'rgba(217, 119, 6, 0.1)', color: '#D97706', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '5px 16px', borderRadius: 999, display: 'inline-block' }}>
              Step-by-Step Guide
            </span>
            <h2 style={{ color: 'var(--text-primary)', fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 800, marginTop: 12 }}>
              How Admission Works
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginTop: 8, maxWidth: 600, margin: '8px auto 0' }}>
              Get enrolled in 4 simple steps without visiting physical offices.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
            {steps.map(s => (
              <div
                key={s.step}
                style={{
                  padding: '32px 24px',
                  borderRadius: 22,
                  background: 'var(--bg-surface)',
                  border: '1.5px solid var(--border-light)',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#FFCC4D';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(255, 204, 77, 0.18)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: '#1C1917',
                    color: '#FFCC4D',
                    fontWeight: 900,
                    fontSize: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #FFCC4D'
                  }}>
                    {s.step}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#D97706', background: 'rgba(217, 119, 6, 0.1)', padding: '3px 10px', borderRadius: 999 }}>
                    {s.badge}
                  </span>
                </div>
                <h3 style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, lineHeight: 1.6, margin: 0, flex: 1 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Academic Levels Offered */}
        <section style={{ background: 'var(--bg-surface-2)', padding: 'clamp(40px, 6vw, 64px) clamp(16px, 3.5vw, 48px)' }}>
          <div style={{ maxWidth: 1600, width: '100%', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <span style={{ background: 'rgba(217, 119, 6, 0.1)', color: '#D97706', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '5px 16px', borderRadius: 999, display: 'inline-block' }}>
                Grade Levels
              </span>
              <h2 style={{ color: 'var(--text-primary)', fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 800, marginTop: 12 }}>
                Programs & Classes Available
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              {grades.map(g => (
                <div
                  key={g.level}
                  style={{
                    padding: '30px 26px',
                    borderRadius: 22,
                    background: 'var(--bg-surface)',
                    border: '1.5px solid var(--border-light)',
                    borderTop: `4px solid ${g.color}`,
                    boxShadow: 'var(--shadow-md)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 800, color: g.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                    {g.level}
                  </span>
                  <h3 style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 800, marginBottom: 12 }}>
                    {g.classes}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.65, flex: 1, margin: 0 }}>
                    {g.focus}
                  </p>
                  <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border-light)' }}>
                    <Link
                      to="/register"
                      style={{
                        color: 'var(--text-primary)',
                        fontWeight: 700,
                        fontSize: 13,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>Enroll in {g.classes}</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Required Documents */}
        <section style={{ maxWidth: 1600, width: '100%', margin: '0 auto', padding: 'clamp(40px, 6vw, 64px) clamp(16px, 3.5vw, 48px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ background: 'rgba(217, 119, 6, 0.1)', color: '#D97706', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '5px 16px', borderRadius: 999, display: 'inline-block' }}>
              Checklist
            </span>
            <h2 style={{ color: 'var(--text-primary)', fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 800, marginTop: 12 }}>
              Required Documents for Admission
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {requirements.map(r => (
              <div
                key={r.title}
                style={{
                  padding: '24px 20px',
                  borderRadius: 20,
                  background: 'var(--bg-surface)',
                  border: '1.5px solid var(--border-light)',
                  display: 'flex',
                  gap: 16,
                  alignItems: 'flex-start'
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'var(--bg-surface-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0
                }}>
                  {r.icon}
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{r.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.5, margin: 0 }}>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      <Footer />
    </div>
  );
}

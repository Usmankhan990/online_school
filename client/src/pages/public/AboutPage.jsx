import { PublicNav, Footer } from './LandingPage';

export default function AboutPage() {
  return (
    <div style={{ background: '#f8fafc' }}>
      <PublicNav />
      <div style={{ paddingTop: 90 }}>
        {/* Hero */}
        <section className="gradient-bg-hero" style={{ padding: '60px 24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ color: 'white', fontSize: 40, fontWeight: 800, marginBottom: 16 }}>About Usman Online School</h1>
            <p style={{ color: '#94a3b8', fontSize: 18, lineHeight: 1.6 }}>Empowering students across Pakistan with quality education — from KG to 8th grade.</p>
          </div>
        </section>

        <section style={{ maxWidth: 800, margin: '0 auto', padding: '64px 24px' }}>
          <div className="card" style={{ padding: 40 }}>
            <h2 style={{ color: '#1e3a5f', fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Our Mission</h2>
            <p style={{ color: '#475569', fontSize: 16, lineHeight: 1.8, marginBottom: 24 }}>
              To provide every child in Pakistan access to quality education through technology. We believe that no geographical boundary, no financial constraint, and no physical limitation should prevent a student from learning.
            </p>
            <h2 style={{ color: '#1e3a5f', fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Why Choose Us?</h2>
            <div style={{ display: 'grid', gap: 16 }}>
              {[
                { icon: '📖', title: 'PCTB 2026 Curriculum', text: 'We strictly follow the Punjab Board curriculum ensuring your child stays on track.' },
                { icon: '🎯', title: 'Structured Learning', text: 'Timetables, homework, exams, and grading — just like a physical school.' },
                { icon: '👨‍👩‍👧', title: 'Parent Involvement', text: 'Dedicated parent portal for real-time monitoring of your child\'s progress.' },
                { icon: '💻', title: '100% Online', text: 'Learn from anywhere, anytime. All you need is internet access.' },
              ].map(item => (
                <div key={item.title} style={{ display: 'flex', gap: 16, padding: 16, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <h4 style={{ color: '#0f172a', fontWeight: 700, marginBottom: 4 }}>{item.title}</h4>
                    <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.5 }}>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

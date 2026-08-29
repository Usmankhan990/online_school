import { PublicNav, Footer } from './LandingPage';

export default function PrivacyPage() {
  return (
    <div style={{ background: '#f8fafc' }}>
      <PublicNav />
      <div style={{ paddingTop: 90 }}>
        <section className="gradient-bg-hero" style={{ padding: '48px 24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ color: 'white', fontSize: 36, fontWeight: 800 }}>Privacy Policy</h1>
          </div>
        </section>
        <section style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
          <div className="card" style={{ padding: 40 }}>
            {[
              { t: 'Information We Collect', c: 'We collect personal information including name, father\'s name, CNIC, email, contact numbers, class details, and uploaded documents during registration. This information is necessary for school operations.' },
              { t: 'How We Use Your Information', c: 'Your data is used solely for educational purposes: student management, attendance tracking, exam administration, report generation, fee management, and communication with parents.' },
              { t: 'Data Protection', c: 'All data is securely stored and encrypted. We use JWT-based authentication and bcrypt password hashing. Only authorized school administrators have access to student data.' },
              { t: 'Third-Party Sharing', c: 'We do not sell or share your personal information with third parties. Textbook resources are provided via PCTB and Ustad360 for educational purposes only.' },
              { t: 'Data Retention', c: 'Student records are retained for the duration of enrollment plus 2 years. You may request data deletion by contacting our admin office.' },
              { t: 'Contact', c: 'For privacy-related concerns, email us at info@usmanonlineschool.com.' },
            ].map((s, i) => (
              <div key={i} style={{ marginBottom: 24 }}>
                <h3 style={{ color: '#1e3a5f', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{s.t}</h3>
                <p style={{ color: '#475569', fontSize: 15, lineHeight: 1.7 }}>{s.c}</p>
              </div>
            ))}
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 24 }}>Last updated: April 2026</p>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

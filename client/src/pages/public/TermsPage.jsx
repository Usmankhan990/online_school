import { PublicNav, Footer } from './LandingPage';

export default function TermsPage() {
  return (
    <div style={{ background: '#f8fafc' }}>
      <PublicNav />
      <div style={{ paddingTop: 90 }}>
        <section className="gradient-bg-hero" style={{ padding: '48px 24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ color: 'white', fontSize: 36, fontWeight: 800 }}>Terms of Service</h1>
          </div>
        </section>
        <section style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
          <div className="card" style={{ padding: 40 }}>
            {[
              { t: 'Acceptance', c: 'By using Usman Online School, you agree to these Terms. If you do not agree, please do not use the platform.' },
              { t: 'Services', c: 'We provide an online school management platform including digital books, exams, homework management, attendance, results, and fee tracking for KG to 8th grade following PCTB Punjab curriculum.' },
              { t: 'User Accounts', c: 'Users must provide accurate information. Students require admin approval for account activation. Users are responsible for maintaining account security.' },
              { t: 'Academic Integrity', c: 'Students must not cheat on exams or submit plagiarized work. Violations may result in account suspension.' },
              { t: 'Content', c: 'Textbooks are provided courtesy of PCTB Punjab for educational use only. Course materials are intellectual property of the school.' },
              { t: 'Fees', c: 'Fee structures are set by school administration. Late payments may incur additional charges. Payment history is maintained in the system.' },
              { t: 'Limitation', c: 'The platform is provided as-is. We are not liable for internet connectivity issues or device compatibility problems.' },
              { t: 'Changes', c: 'We reserve the right to modify these terms. Users will be notified of significant changes through the notification system.' },
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

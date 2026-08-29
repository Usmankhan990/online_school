import { PublicNav, Footer } from './LandingPage';
import { useState } from 'react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const handleSubmit = (e) => { e.preventDefault(); setSent(true); };

  return (
    <div style={{ background: '#f8fafc' }}>
      <PublicNav />
      <div style={{ paddingTop: 90 }}>
        <section className="gradient-bg-hero" style={{ padding: '60px 24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ color: 'white', fontSize: 40, fontWeight: 800, marginBottom: 16 }}>Contact Us</h1>
            <p style={{ color: '#94a3b8', fontSize: 18 }}>Have questions? We'd love to hear from you.</p>
          </div>
        </section>

        <section style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
            <div className="card" style={{ padding: 32 }}>
              <h3 style={{ color: '#1e3a5f', fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Send a Message</h3>
              {sent ? (
                <div className="alert-success" style={{ padding: 20, borderRadius: 12, textAlign: 'center' }}>
                  <span style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>✅</span>
                  <p style={{ fontWeight: 600 }}>Message sent successfully!</p>
                  <p style={{ fontSize: 14, marginTop: 4 }}>We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div><label className="form-label">Full Name</label><input className="form-input" required placeholder="Your name" /></div>
                  <div><label className="form-label">Email</label><input className="form-input" type="email" required placeholder="your@email.com" /></div>
                  <div><label className="form-label">Subject</label><input className="form-input" required placeholder="What is this about?" /></div>
                  <div><label className="form-label">Message</label><textarea className="form-input" rows={4} required placeholder="Your message..." style={{ resize: 'vertical' }} /></div>
                  <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>Send Message</button>
                </form>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: '📧', title: 'Email', value: 'info@usmanonlineschool.com' },
                { icon: '📞', title: 'Phone', value: '+92 300 1234567' },
                { icon: '📍', title: 'Address', value: 'Lahore, Punjab, Pakistan' },
                { icon: '⏰', title: 'Office Hours', value: 'Mon-Sat: 9:00 AM - 5:00 PM' },
              ].map(c => (
                <div key={c.title} className="card" style={{ padding: 20, display: 'flex', gap: 14, alignItems: 'center' }}>
                  <span style={{ fontSize: 28 }}>{c.icon}</span>
                  <div>
                    <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.title}</p>
                    <p style={{ color: '#0f172a', fontWeight: 600, fontSize: 15 }}>{c.value}</p>
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

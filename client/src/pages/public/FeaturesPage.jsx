import { PublicNav, Footer } from './LandingPage';

export default function FeaturesPage() {
  const modules = [
    { icon: '📚', title: 'Digital Library', desc: 'Access 66+ PCTB 2026 textbooks from KG to 8th class. Search, filter by class & subject, read online.', color: '#3b82f6' },
    { icon: '🎥', title: 'Live Classes', desc: 'Join real-time video classes with your teacher. Interactive learning with Q&A sessions.', color: '#7c3aed' },
    { icon: '📹', title: 'Recorded Lectures', desc: 'Missed a class? Watch recorded lectures anytime at your own pace.', color: '#ec4899' },
    { icon: '📝', title: 'Online Exams', desc: 'MCQ and subjective exams with timer, auto-grading, and instant results.', color: '#f59e0b' },
    { icon: '📊', title: 'Results & Report Cards', desc: 'View subject-wise marks, grades, percentages, and official report cards.', color: '#10b981' },
    { icon: '📋', title: 'Homework & Classwork', desc: 'Receive daily assignments, submit online, and get teacher feedback.', color: '#06b6d4' },
    { icon: '✅', title: 'Attendance Tracking', desc: 'Daily attendance marked by teachers. Monthly summaries for students and parents.', color: '#8b5cf6' },
    { icon: '💰', title: 'Fee Management', desc: 'Track fees, view payment history, and get reminders for due dates.', color: '#ef4444' },
    { icon: '🔔', title: 'Notifications', desc: 'Stay updated with homework alerts, exam schedules, results, and announcements.', color: '#0ea5e9' },
    { icon: '👨‍👩‍👧', title: 'Parent Portal', desc: 'Parents monitor everything — attendance, homework, results, fees — in real-time.', color: '#f97316' },
    { icon: '👨‍🏫', title: 'Teacher Dashboard', desc: 'Teachers manage courses, create exams, grade submissions, and mark attendance.', color: '#14b8a6' },
    { icon: '🛡️', title: 'Admin Panel', desc: 'Complete school management — students, teachers, classes, fees, reports.', color: '#1e3a5f' },
  ];

  return (
    <div style={{ background: 'var(--bg-body, #FAF6EE)', minHeight: '100vh', color: 'var(--text-primary, #1C1917)' }}>
      <PublicNav />
      <div style={{ paddingTop: 90 }}>
        <section className="gradient-bg-hero" style={{ padding: '60px 24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ color: 'white', fontSize: 40, fontWeight: 800, marginBottom: 16 }}>Platform Features</h1>
            <p style={{ color: '#D8CEBD', fontSize: 18 }}>Everything a school needs — now digital, accessible, and beautiful.</p>
          </div>
        </section>

        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {modules.map(m => (
              <div
                key={m.title}
                style={{
                  padding: '24px 22px',
                  borderRadius: 22,
                  background: 'var(--bg-surface, #FFFFFF)',
                  border: '1.5px solid var(--border-light, #EBE4D5)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  borderTop: `3px solid ${m.color || '#FFCC4D'}`
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(255, 204, 77, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.05)';
                }}
              >
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: 'var(--bg-surface-2, #FAF6EE)',
                  border: '1.5px solid var(--border-light, #EBE4D5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  marginBottom: 16,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                }}>
                  {m.icon}
                </div>
                <h3 style={{ color: 'var(--text-primary, #1C1917)', fontSize: 17, fontWeight: 800, marginBottom: 8 }}>{m.title}</h3>
                <p style={{ color: 'var(--text-secondary, #57534E)', fontSize: 13.5, lineHeight: 1.6, margin: 0, flex: 1 }}>{m.desc}</p>
                <div style={{
                  marginTop: 18,
                  paddingTop: 14,
                  borderTop: '1px solid var(--border-light, #EBE4D5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#1C1917', background: '#FFCC4D', padding: '3px 10px', borderRadius: 999 }}>
                    PCTB 2026
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary, #1C1917)' }}>
                    View Module →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

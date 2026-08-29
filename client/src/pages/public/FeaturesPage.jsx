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
    <div style={{ background: '#f8fafc' }}>
      <PublicNav />
      <div style={{ paddingTop: 90 }}>
        <section className="gradient-bg-hero" style={{ padding: '60px 24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ color: 'white', fontSize: 40, fontWeight: 800, marginBottom: 16 }}>Platform Features</h1>
            <p style={{ color: '#94a3b8', fontSize: 18 }}>Everything a school needs — now digital, accessible, and beautiful.</p>
          </div>
        </section>

        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {modules.map(m => (
              <div key={m.title} className="card" style={{ padding: 28, borderLeft: `4px solid ${m.color}` }}>
                <span style={{ fontSize: 36, display: 'block', marginBottom: 12 }}>{m.icon}</span>
                <h3 style={{ color: '#0f172a', fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{m.title}</h3>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

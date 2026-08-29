import { Link } from 'react-router-dom';

const MODULE_DATA = {
  // Admin pages
  'Classes & Subjects': { icon: '🏫', desc: 'Manage class levels (KG-8th) and assign subjects to each class.', color: '#8b5cf6' },
  'Subjects Management': { icon: '📖', desc: 'View and manage all subjects in the curriculum.', color: '#06b6d4' },
  'Courses Overview': { icon: '📚', desc: 'View all courses created by teachers across all classes.', color: '#3b82f6' },
  'Exams Overview': { icon: '📝', desc: 'Monitor all exams across the school — upcoming, active, and completed.', color: '#f59e0b' },
  'Fees Management': { icon: '💰', desc: 'Create fee plans, assign fees by class, and track payments.', color: '#10b981' },
  'Payment Verification': { icon: '💳', desc: 'Review and verify student payments. Approve or reject pending transactions.', color: '#ec4899' },
  'Parents Management': { icon: '👨‍👩‍👧', desc: 'View all registered parents and their linked children.', color: '#f97316' },
  'Attendance Overview': { icon: '📅', desc: 'View school-wide attendance trends and summaries.', color: '#14b8a6' },
  'Results Overview': { icon: '📊', desc: 'View exam results across all classes and subjects.', color: '#6366f1' },
  'Notifications Center': { icon: '🔔', desc: 'Send announcements and manage notifications for the entire school.', color: '#0ea5e9' },
  'Reports & Analytics': { icon: '📈', desc: 'View comprehensive reports on enrollment, fees, attendance, and performance.', color: '#1e3a5f' },
  'Settings': { icon: '⚙️', desc: 'Configure school settings, academic year, and system preferences.', color: '#64748b' },
  'Profile': { icon: '👤', desc: 'View and update your profile information.', color: '#475569' },

  // Teacher pages
  'Materials': { icon: '📤', desc: 'Upload and manage course materials, notes, and resources.', color: '#3b82f6' },
  'Homework Manager': { icon: '📋', desc: 'Create, assign, and manage homework for your courses.', color: '#f59e0b' },
  'Review Submissions': { icon: '📥', desc: 'Review and grade student homework submissions.', color: '#10b981' },
  'Mark Attendance': { icon: '✅', desc: 'Mark daily attendance for your classes.', color: '#14b8a6' },
  'Grade & Results': { icon: '📊', desc: 'Grade exams and publish results for students.', color: '#8b5cf6' },
  'Teacher Notifications': { icon: '🔔', desc: 'View your notifications and announcements.', color: '#0ea5e9' },

  // Student pages
  'My Courses': { icon: '📚', desc: 'View your enrolled courses, materials, and progress.', color: '#3b82f6' },
  'Live Classes': { icon: '🎥', desc: 'Join real-time video classes with your teachers.', color: '#7c3aed' },
  'Recorded Lectures': { icon: '📹', desc: 'Watch recorded lectures at your own pace.', color: '#ec4899' },
  'Homework': { icon: '📝', desc: 'View assigned homework, submit your work, and check grades.', color: '#f59e0b' },
  'My Exams': { icon: '✍️', desc: 'View upcoming exams and attempt available ones.', color: '#ef4444' },
  'Report Card': { icon: '🎓', desc: 'View and download your official report card.', color: '#10b981' },
  'My Attendance': { icon: '📅', desc: 'View your attendance history and monthly percentage.', color: '#14b8a6' },
  'My Fees': { icon: '💰', desc: 'View fee status, payment history, and pending dues.', color: '#f97316' },
  'Student Notifications': { icon: '🔔', desc: 'View your notifications and school announcements.', color: '#0ea5e9' },

  // Parent pages
  'Child Overview': { icon: '👧', desc: 'View a complete summary of your child\'s school activities.', color: '#3b82f6' },
  'Child Attendance': { icon: '📅', desc: 'View your child\'s daily attendance and monthly summary.', color: '#14b8a6' },
  'Child Homework': { icon: '📝', desc: 'Monitor your child\'s homework completion status.', color: '#f59e0b' },
  'Child Results': { icon: '📊', desc: 'View your child\'s exam results and performance trends.', color: '#8b5cf6' },
  'Child Report Card': { icon: '🎓', desc: 'View and download your child\'s official report card.', color: '#10b981' },
  'Child Fees': { icon: '💰', desc: 'View fee status, due amounts, and payment history.', color: '#f97316' },
  'Parent Notifications': { icon: '🔔', desc: 'View notifications and school announcements.', color: '#0ea5e9' },
};

export default function PlaceholderPage({ title, description }) {
  const data = MODULE_DATA[title] || { icon: '📄', desc: description || 'This module is coming soon.', color: '#64748b' };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <h1>{data.icon} {title}</h1>
        <p>{data.desc}</p>
      </div>

      <div className="card" style={{ padding: 48, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, background: `${data.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 40 }}>
          {data.icon}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{title}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 460, margin: '0 auto 24px', lineHeight: 1.6 }}>
          {data.desc}
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fffbeb', color: '#d97706', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: '1px solid #fde68a' }}>
          <span>🚧</span> This module is under active development
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {[
          { icon: '✅', text: 'Backend API Ready', sub: 'All endpoints configured' },
          { icon: '🎨', text: 'UI Design Planned', sub: 'Premium components' },
          { icon: '🔄', text: 'Coming Soon', sub: 'In next update' },
        ].map(item => (
          <div key={item.text} className="card" style={{ padding: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 24 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.text}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

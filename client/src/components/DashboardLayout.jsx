import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/* ═══════════════════════════════════════════════════
   ICON COMPONENTS (inline SVG for zero-dep icons)
   ═══════════════════════════════════════════════════ */
const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const Icons = {
  dashboard: <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" />,
  students: <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2 M23 21v-2a4 4 0 00-3-3.87 M9 7a4 4 0 100-8 4 4 0 000 8 M16 3.13a4 4 0 010 7.75" />,
  teachers: <Icon d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2 M12 11l4-4-4-4 M9 7a4 4 0 100-8 4 4 0 000 8" />,
  parents: <Icon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4-4v2 M12 3a4 4 0 100 8 4 4 0 000-8" />,
  classes: <Icon d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />,
  subjects: <Icon d="M4 19.5A2.5 2.5 0 016.5 17H20 M4 19.5V5.5A2.5 2.5 0 016.5 3H20v16H6.5a2.5 2.5 0 00-2.5 2.5z" />,
  courses: <Icon d="M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c0 2 4 3 6 3s6-1 6-3v-5" />,
  books: <Icon d="M4 19.5A2.5 2.5 0 016.5 17H20 M4 19.5V5.5A2.5 2.5 0 016.5 3H20v14H6.5a2.5 2.5 0 00-2.5 2.5z" />,
  exams: <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2 M9 14l2 2 4-4" />,
  homework: <Icon d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" />,
  attendance: <Icon d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2 M12 11l0 0 M12 16l0 0 M8 2v4 M16 2v4 M3 10h18" />,
  fees: <Icon d="M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />,
  results: <Icon d="M18 20V10 M12 20V4 M6 20v-6" />,
  notifications: <Icon d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0" />,
  settings: <Icon d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z M12 15a3 3 0 100-6 3 3 0 000 6" />,
  profile: <Icon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4-4v2 M12 3a4 4 0 100 8 4 4 0 000-8" />,
  reports: <Icon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12" />,
  pending: <Icon d="M12 2a10 10 0 100 20 10 10 0 000-20 M12 6v6l4 2" />,
  live: <Icon d="M23 7l-7 5 7 5V7 M14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z" />,
  recorded: <Icon d="M12 2a10 10 0 100 20 10 10 0 000-20 M10 8l6 4-6 4V8z" />,
  submissions: <Icon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3" />,
  materials: <Icon d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />,
  reportcard: <Icon d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M12 18v-6 M9 15l3 3 3-3" />,
  child: <Icon d="M12 2a4 4 0 014 4v2a4 4 0 01-8 0V6a4 4 0 014-4 M4 21v-1a6 6 0 0112 0v1" />,
  payments: <Icon d="M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2z M1 10h22" />,
  logout: <Icon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9" />,
  menu: <Icon d="M3 12h18M3 6h18M3 18h18" />,
  search: <Icon d="M11 19a8 8 0 100-16 8 8 0 000 16z M21 21l-4.35-4.35" />,
  sun: <Icon d="M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M4.93 19.07l1.41-1.41 M17.66 6.34l1.41-1.41 M12 17a5 5 0 100-10 5 5 0 000 10z" />,
  moon: <Icon d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />,
  close: <Icon d="M18 6L6 18 M6 6l12 12" />,
};

/* Navigation config by role */
const NAV_CONFIG = {
  super_admin: [
    { section: 'Main' },
    { label: 'Dashboard', path: '/admin', icon: 'dashboard' },
    { label: 'Pending Admissions', path: '/admin/pending-students', icon: 'pending' },
    { section: 'Management' },
    { label: 'Students', path: '/admin/students', icon: 'students' },
    { label: 'Teachers', path: '/admin/teachers', icon: 'teachers' },
    { label: 'Parents', path: '/admin/parents', icon: 'parents' },
    { label: 'Classes', path: '/admin/classes', icon: 'classes' },
    { label: 'Subjects', path: '/admin/subjects', icon: 'subjects' },
    { section: 'Academics' },
    { label: 'Courses', path: '/admin/courses', icon: 'courses' },
    { label: 'Books', path: '/admin/books', icon: 'books' },
    { label: 'Exams', path: '/admin/exams', icon: 'exams' },
    { label: 'Results', path: '/admin/results', icon: 'results' },
    { section: 'Finance' },
    { label: 'Fees', path: '/admin/fees', icon: 'fees' },
    { label: 'Payments', path: '/admin/payments', icon: 'payments' },
    { section: 'Other' },
    { label: 'Attendance', path: '/admin/attendance', icon: 'attendance' },
    { label: 'Notifications', path: '/admin/notifications', icon: 'notifications' },
    { label: 'Reports', path: '/admin/reports', icon: 'reports' },
    { label: 'Settings', path: '/admin/settings', icon: 'settings' },
    { label: 'Profile', path: '/admin/profile', icon: 'profile' },
  ],
  teacher: [
    { section: 'Main' },
    { label: 'Dashboard', path: '/teacher', icon: 'dashboard' },
    { label: 'My Courses', path: '/teacher/courses', icon: 'courses' },
    { label: 'Materials', path: '/teacher/materials', icon: 'materials' },
    { section: 'Academics' },
    { label: 'Live Classes', path: '/teacher/live-classes', icon: 'live' },
    { label: 'Homework', path: '/teacher/homework', icon: 'homework' },
    { label: 'Submissions', path: '/teacher/submissions', icon: 'submissions' },
    { label: 'Attendance', path: '/teacher/attendance', icon: 'attendance' },
    { label: 'Exams', path: '/teacher/exams', icon: 'exams' },
    { label: 'Results', path: '/teacher/results', icon: 'results' },
    { section: 'PTB Curriculum' },
    { label: 'Curriculum Roadmap', path: '/teacher/courses', icon: 'materials' },
    { section: 'Other' },
    { label: 'Notifications', path: '/teacher/notifications', icon: 'notifications' },
    { label: 'Profile', path: '/teacher/profile', icon: 'profile' },
  ],
  student: [
    { section: 'Main' },
    { label: 'Dashboard', path: '/student', icon: 'dashboard' },
    { label: 'My Courses', path: '/student/courses', icon: 'courses' },
    { label: 'My Books', path: '/student/books', icon: 'books' },
    { section: 'Learning' },
    { label: 'Live Classes', path: '/student/live-classes', icon: 'live' },
    { label: 'Recorded Lectures', path: '/student/lectures', icon: 'recorded' },
    { label: 'Homework', path: '/student/homework', icon: 'homework' },
    { section: 'Assessment' },
    { label: 'Exams', path: '/student/exams', icon: 'exams' },
    { label: 'Results', path: '/student/results', icon: 'results' },
    { label: 'Report Card', path: '/student/report-card', icon: 'reportcard' },
    { section: 'PTB 2026' },
    { label: 'Curriculum Roadmap', path: '/student/courses', icon: 'courses' },
    { label: 'My Textbooks', path: '/student/books', icon: 'books' },
    { section: 'Other' },
    { label: 'Attendance', path: '/student/attendance', icon: 'attendance' },
    { label: 'Fees', path: '/student/fees', icon: 'fees' },
    { label: 'Notifications', path: '/student/notifications', icon: 'notifications' },
    { label: 'Profile', path: '/student/profile', icon: 'profile' },
  ],
  parent: [
    { section: 'Main' },
    { label: 'Dashboard', path: '/parent', icon: 'dashboard' },
    { label: 'Child Overview', path: '/parent/child', icon: 'child' },
    { section: 'Academics' },
    { label: 'Attendance', path: '/parent/attendance', icon: 'attendance' },
    { label: 'Homework', path: '/parent/homework', icon: 'homework' },
    { label: 'Results', path: '/parent/results', icon: 'results' },
    { label: 'Report Card', path: '/parent/report-card', icon: 'reportcard' },
    { section: 'Finance' },
    { label: 'Fees', path: '/parent/fees', icon: 'fees' },
    { section: 'Other' },
    { label: 'Notifications', path: '/parent/notifications', icon: 'notifications' },
    { label: 'Profile', path: '/parent/profile', icon: 'profile' },
  ],
};

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const navItems = NAV_CONFIG[user?.role] || [];
  const roleName = { super_admin: 'Super Admin', teacher: 'Teacher', student: 'Student', parent: 'Parent' }[user?.role] || '';
  const rolePortal = { super_admin: 'Admin Portal', teacher: 'Teacher Portal', student: 'Student Portal', parent: 'Parent Portal' }[user?.role] || '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-body)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 md:hidden" style={{ background: 'var(--bg-overlay)' }} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">U</div>
          <div className="sidebar-brand-text">
            <h2>Usman Online School</h2>
            <p>KG to 8th Punjab Board</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if (item.section) {
              return <div key={i} className="sidebar-section">{item.section}</div>;
            }
            const isActive = location.pathname === item.path;
            return (
              <Link key={i} to={item.path} className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}>
                <span className="link-icon">{Icons[item.icon]}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="sidebar-section" style={{ marginTop: 16 }}></div>
          <button onClick={handleLogout} className="sidebar-link w-full" style={{ color: '#f87171', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', font: 'inherit' }}>
            <span className="link-icon">{Icons.logout}</span>
            <span>Logout</span>
          </button>
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.full_name?.charAt(0) || 'U'}</div>
          <div className="sidebar-user-info">
            <h4>{user?.full_name || 'User'}</h4>
            <p>{roleName}</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <header className="topbar">
          <div className="flex items-center gap-4">
            <button className="topbar-icon-btn md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {Icons.menu}
            </button>
            <div className="topbar-search hidden sm:flex">
              <span style={{ color: 'var(--text-tertiary)' }}>{Icons.search}</span>
              <input placeholder="Search anything..." />
            </div>
          </div>

          <div className="topbar-actions">
            <span className="text-xs font-semibold hidden md:block" style={{ color: 'var(--text-tertiary)', marginRight: 8 }}>
              {rolePortal}
            </span>
            <button className="topbar-icon-btn" onClick={() => setDarkMode(!darkMode)} title="Toggle theme">
              {darkMode ? Icons.sun : Icons.moon}
            </button>
            <button className="topbar-icon-btn" onClick={() => navigate(location.pathname.split('/').slice(0, 2).join('/') + '/notifications')}>
              {Icons.notifications}
              <span className="topbar-badge">3</span>
            </button>
            <div className="sidebar-avatar avatar-sm" style={{ 
              background: 'linear-gradient(135deg, #1e3a5f, #10b981)', 
              color: 'white', 
              width: 36, height: 36, fontSize: 14, cursor: 'pointer' 
            }} title={user?.full_name}>
              {user?.full_name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

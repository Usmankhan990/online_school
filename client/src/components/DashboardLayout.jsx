import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api, { FILE_BASE } from '../services/api';
import logoImg from '../assets/logo.jpg';
import LanguageToggle from './LanguageToggle';
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
    { label: 'Digital Library', path: '/teacher/books', icon: 'books' },
    { label: 'Curriculum Roadmap', path: '/teacher/courses', icon: 'materials' },
    { section: 'Other' },
    { label: 'Notifications', path: '/teacher/notifications', icon: 'notifications' },
    { label: 'Profile', path: '/teacher/profile', icon: 'profile' },
  ],
  student: [
    { section: 'Main' },
    { label: 'Dashboard', path: '/student', icon: 'dashboard' },
    { label: 'My Courses', path: '/student/courses', icon: 'courses' },
    { section: 'Learning' },
    { label: 'Live Classes', path: '/student/live-classes', icon: 'live' },
    { label: 'Study Materials', path: '/student/materials', icon: 'materials' },
    { label: 'Homework', path: '/student/homework', icon: 'homework' },
    { section: 'Assessment' },
    { label: 'Exams', path: '/student/exams', icon: 'exams' },
    { label: 'Results', path: '/student/results', icon: 'results' },
    { label: 'Report Card', path: '/student/report-card', icon: 'reportcard' },
    { section: 'PTB 2026' },
    { label: 'Curriculum Roadmap', path: '/curriculum-roadmap', icon: 'courses' },
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
    { label: 'Child Overview', path: '/parent/child-overview', icon: 'child' },
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
  const { user, logout, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    current_password: '',
    new_password: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [currentPassStatus, setCurrentPassStatus] = useState('idle'); // 'idle' | 'valid' | 'invalid'
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [unreadCount, setUnreadCount] = useState(0);

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('blob:') || avatar.startsWith('http')) return avatar;
    return `${FILE_BASE}/uploads/${avatar}`;
  };

  useEffect(() => {
    if (editProfileOpen && user) {
      setEditForm({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        current_password: '',
        new_password: '',
      });
      setAvatarFile(null);
      setAvatarPreview(getAvatarUrl(user.avatar));
      setProfileMsg({ type: '', text: '' });
      setShowCurrentPass(false);
      setShowNewPass(false);
      setCurrentPassStatus('idle');
    }
  }, [editProfileOpen, user]);

  useEffect(() => {
    if (!editForm.current_password) {
      setCurrentPassStatus('idle');
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.post('/auth/verify-password', { current_password: editForm.current_password });
        if (res.data?.valid) {
          setCurrentPassStatus('valid');
        } else {
          setCurrentPassStatus('invalid');
        }
      } catch (err) {
        setCurrentPassStatus('invalid');
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [editForm.current_password]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropImageSrc(reader.result);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleCropComplete = (croppedFile, previewUrl) => {
    setAvatarFile(croppedFile);
    setAvatarPreview(previewUrl);
    setCropImageSrc(null);
  };

  const newPassMinLength = editForm.new_password.length >= 8;
  const newPassUpper = /[A-Z]/.test(editForm.new_password);
  const newPassLower = /[a-z]/.test(editForm.new_password);
  const newPassNumber = /\d/.test(editForm.new_password);
  const newPassSpecial = /[^A-Za-z0-9]/.test(editForm.new_password);
  const isNewPassValid = newPassUpper && newPassLower && newPassNumber && newPassSpecial && newPassMinLength;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (editForm.new_password) {
      if (!editForm.current_password || currentPassStatus !== 'valid') {
        setProfileMsg({ type: 'error', text: 'Please enter your correct current password.' });
        return;
      }
      if (!isNewPassValid) {
        setProfileMsg({ type: 'error', text: 'New password does not meet all security requirements.' });
        return;
      }
    }
    setSavingProfile(true);
    setProfileMsg({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('full_name', editForm.full_name);
      formData.append('email', editForm.email);
      if (editForm.phone) formData.append('phone', editForm.phone);
      if (editForm.current_password) formData.append('current_password', editForm.current_password);
      if (editForm.new_password) formData.append('new_password', editForm.new_password);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (updateUser) {
        updateUser(res.data.user);
      }
      setProfileMsg({ type: 'success', text: res.data.message || 'Profile updated successfully!' });
      setTimeout(() => {
        setEditProfileOpen(false);
      }, 700);
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    if (!user) return;
    const fetchUnreadCount = () => {
      api.get('/auth/notifications/unread-count')
        .then(res => setUnreadCount(res.data.unread_count))
        .catch(err => console.error('Failed to fetch unread count', err));
    };
    fetchUnreadCount();
    window.addEventListener('notifications-updated', fetchUnreadCount);
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => {
      window.removeEventListener('notifications-updated', fetchUnreadCount);
      clearInterval(interval);
    };
  }, [user]);

  const navRef = useRef(null);

  // Preserve sidebar scroll position or scroll active item into view
  useEffect(() => {
    if (navRef.current) {
      const activeEl = navRef.current.querySelector('.sidebar-link.active');
      if (activeEl) {
        const navRect = navRef.current.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();
        if (activeRect.top < navRect.top || activeRect.bottom > navRect.bottom) {
          activeEl.scrollIntoView({ block: 'nearest' });
        }
      }
    }
  }, [location.pathname]);

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
          <img src={logoImg} alt="Taleem Ghar" className="sidebar-brand-icon" style={{ objectFit: 'cover', background: '#ffffff', padding: 1 }} />
          <div className="sidebar-brand-text">
            <h2>Taleem Ghar</h2>
            <p>KG to 8th Punjab Board</p>
          </div>
        </div>

        <nav ref={navRef} className="sidebar-nav">
          {navItems.map((item, i) => {
            if (item.section) {
              return <div key={i} className="sidebar-section">{item.section}</div>;
            }
            const isActive = location.pathname === item.path ||
              (item.path === '/student/courses' && location.pathname === '/my-courses') ||
              (item.path === '/student/books' && (location.pathname === '/my-textbooks' || location.pathname.startsWith('/student/books/'))) ||
              (item.path === '/student/homework' && location.pathname === '/homework') ||
              (item.path === '/student/results' && location.pathname === '/results') ||
              (item.path === '/student/fees' && location.pathname === '/fees' && user?.role === 'student') ||
              (item.path === '/admin/fees' && location.pathname === '/fees' && user?.role === 'super_admin') ||
              (item.path === '/parent/fees' && location.pathname === '/fees' && user?.role === 'parent') ||
              (item.path === '/parent/child-overview' && (location.pathname === '/parent/child-overview' || location.pathname === '/parent/child'));
            return (
              <Link key={i} to={item.path} className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}>
                <span className="link-icon">{Icons[item.icon]}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}


        </nav>

        <div className="sidebar-user">
          <div className="sidebar-avatar" style={{ overflow: 'hidden', padding: 0 }}>
            {user?.avatar ? (
              <img 
                src={getAvatarUrl(user.avatar)} 
                alt={user.full_name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                onError={(e) => { e.currentTarget.style.display = 'none'; }} 
              />
            ) : (
              user?.full_name?.charAt(0) || 'U'
            )}
          </div>
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
            <span className="text-xs font-semibold hidden md:flex items-center justify-center" 
                  style={{ 
                    color: 'var(--text-secondary)', 
                    marginRight: 8,
                    background: 'var(--bg-surface-2)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-full)',
                    padding: '6px 14px'
                  }}>
              {rolePortal}
            </span>
            <LanguageToggle />
            <button className="topbar-icon-btn" onClick={() => setDarkMode(!darkMode)} title="Toggle theme">
              {darkMode ? Icons.sun : Icons.moon}
            </button>
            <button className="topbar-icon-btn" onClick={() => navigate(location.pathname.split('/').slice(0, 2).join('/') + '/notifications')}>
              {Icons.notifications}
              {unreadCount > 0 && <span className="topbar-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
            </button>
            <div className="relative" tabIndex={-1} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setProfileOpen(false) }}>
              <div 
                className="sidebar-avatar avatar-sm" 
                onClick={() => setProfileOpen(!profileOpen)}
                style={{ 
                  background: 'linear-gradient(135deg, #1e3a5f, #10b981)', 
                  color: 'white', 
                  width: 36, height: 36, fontSize: 14, cursor: 'pointer',
                  overflow: 'hidden', padding: 0
                }} 
                title={user?.full_name}
              >
                {user?.avatar ? (
                  <img 
                    src={getAvatarUrl(user.avatar)} 
                    alt={user.full_name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                  />
                ) : (
                  user?.full_name?.charAt(0) || 'U'
                )}
              </div>

              {profileOpen && (
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    right: 0, 
                    marginTop: 8, 
                    width: 220, 
                    background: '#ffffff', 
                    borderRadius: 12, 
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', 
                    border: '1px solid #e2e8f0', 
                    zIndex: 50, 
                    overflow: 'hidden',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                >
                  <div style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div 
                      style={{ 
                        background: '#334155', 
                        color: 'white', 
                        width: 34, 
                        height: 34, 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13, 
                        fontWeight: 700,
                        flexShrink: 0,
                        overflow: 'hidden',
                        padding: 0
                      }}
                    >
                      {user?.avatar ? (
                        <img 
                          src={getAvatarUrl(user.avatar)} 
                          alt={user.full_name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                        />
                      ) : (
                        user?.full_name?.charAt(0) || 'U'
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user?.full_name}
                      </p>
                      <p style={{ margin: 0, marginTop: 2, fontSize: 11.5, color: '#64748b', fontWeight: 500 }}>
                        {roleName}
                      </p>
                    </div>
                  </div>

                  <div style={{ padding: '8px 10px' }}>
                    <button 
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setProfileOpen(false);
                        setEditProfileOpen(true);
                      }}
                      style={{ 
                        width: '100%', 
                        textAlign: 'left', 
                        padding: '8px 12px', 
                        fontSize: 13, 
                        fontWeight: 600,
                        color: '#ffffff', 
                        background: '#0f172a', 
                        borderRadius: 8,
                        border: 'none', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        marginBottom: 6,
                        transition: 'opacity 0.2s'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>👤</span>
                        <span>Edit Profile</span>
                      </span>
                      <span style={{ fontSize: 12, opacity: 0.8 }}>⚙️</span>
                    </button>

                    <button 
                      onClick={handleLogout}
                      style={{ 
                        width: '100%', 
                        textAlign: 'left', 
                        padding: '8px 12px', 
                        fontSize: 13, 
                        fontWeight: 600,
                        color: '#ef4444', 
                        background: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        borderRadius: 8,
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <span style={{ width: 16, height: 16, display: 'flex', alignItems: 'center' }}>{Icons.logout}</span>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Edit Profile Modal */}
        {editProfileOpen && createPortal(
          <div 
            style={{ 
              position: 'fixed', 
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(15, 23, 42, 0.65)', 
              backdropFilter: 'blur(4px)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              zIndex: 99999, 
              padding: '20px',
              boxSizing: 'border-box'
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setEditProfileOpen(false); }}
          >
            <div 
              className="hide-scrollbar"
              style={{ 
                background: '#ffffff', 
                borderRadius: 20, 
                padding: '32px 36px', 
                maxWidth: 680, 
                width: '100%', 
                maxHeight: 'calc(100vh - 40px)',
                overflowY: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
                border: '1px solid #e2e8f0',
                boxSizing: 'border-box',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>Edit Profile</h2>
                <button 
                  type="button" 
                  onClick={() => setEditProfileOpen(false)} 
                  style={{ 
                    background: '#f1f5f9', 
                    border: 'none', 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    fontSize: 14, 
                    cursor: 'pointer', 
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                >
                  ✕
                </button>
              </div>

              {profileMsg.text && (
                <div 
                  style={{ 
                    padding: '10px 14px', 
                    borderRadius: 10, 
                    marginBottom: 20, 
                    fontSize: 13, 
                    fontWeight: 600,
                    background: profileMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
                    color: profileMsg.type === 'success' ? '#059669' : '#dc2626',
                    border: `1px solid ${profileMsg.type === 'success' ? '#a7f3d0' : '#fecaca'}`
                  }}
                >
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleSaveProfile}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '28px 36px', alignItems: 'flex-start' }}>
                  
                  {/* Left Column: Avatar, Contact & Role */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Avatar with Camera Button */}
                    <div style={{ position: 'relative', width: 110, height: 110, margin: '4px 0 20px 4px' }}>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        style={{ 
                          width: 110, 
                          height: 110, 
                          borderRadius: '50%', 
                          background: 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 50%, #c084fc 100%)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          overflow: 'hidden',
                          fontSize: 40,
                          color: '#ffffff',
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: '0 8px 20px -4px rgba(99, 102, 241, 0.25)'
                        }}
                      >
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span>👤</span>
                        )}
                      </div>

                      {/* Camera icon badge */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        title="Change Photo"
                        style={{
                          position: 'absolute',
                          bottom: 2,
                          right: 2,
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: '#0f172a',
                          border: '2.5px solid #ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                          <circle cx="12" cy="13" r="4"/>
                        </svg>
                      </button>
                      <input 
                        ref={fileInputRef} 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarChange} 
                        style={{ display: 'none' }} 
                      />
                    </div>

                    {/* Contact & Role Section */}
                    <div style={{ marginTop: 6 }}>
                      <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0' }}>Contact & Role</h3>
                      
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#475569' }}>Phone Number</label>
                        <input 
                          type="text" 
                          value={editForm.phone} 
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} 
                          placeholder="Phone Number"
                          style={{ 
                            width: '100%', 
                            padding: '10px 14px', 
                            background: '#f8fafc', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: 10, 
                            fontSize: 13.5, 
                            color: '#0f172a',
                            boxSizing: 'border-box',
                            outline: 'none'
                          }} 
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#475569' }}>Role / Designation</label>
                        <div style={{ position: 'relative' }}>
                          <select 
                            disabled 
                            value={user?.role || 'student'} 
                            style={{ 
                              width: '100%', 
                              padding: '10px 32px 10px 14px', 
                              background: '#f8fafc', 
                              border: '1px solid #e2e8f0', 
                              borderRadius: 10, 
                              fontSize: 13.5, 
                              color: '#0f172a', 
                              fontWeight: 500,
                              appearance: 'none',
                              cursor: 'not-allowed',
                              boxSizing: 'border-box'
                            }}
                          >
                            <option value="super_admin">Super Admin</option>
                            <option value="teacher">Teacher</option>
                            <option value="student">Student</option>
                            <option value="parent">Parent</option>
                          </select>
                          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b', fontSize: 10 }}>▼</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Personal Info & Security */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Personal Info */}
                    <div>
                      <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0' }}>Personal Info</h3>
                      
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#475569' }}>Full Name</label>
                        <input 
                          type="text" 
                          value={editForm.full_name} 
                          onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} 
                          required 
                          placeholder="Full Name"
                          style={{ 
                            width: '100%', 
                            padding: '10px 14px', 
                            background: '#f8fafc', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: 10, 
                            fontSize: 13.5, 
                            color: '#0f172a',
                            boxSizing: 'border-box',
                            outline: 'none'
                          }} 
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#475569' }}>Email Address</label>
                        <input 
                          type="email" 
                          value={editForm.email} 
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} 
                          required 
                          placeholder="Email Address"
                          style={{ 
                            width: '100%', 
                            padding: '10px 14px', 
                            background: '#f8fafc', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: 10, 
                            fontSize: 13.5, 
                            color: '#0f172a',
                            boxSizing: 'border-box',
                            outline: 'none'
                          }} 
                        />
                      </div>
                    </div>

                    {/* Security */}
                    <div style={{ marginTop: 20 }}>
                      <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0' }}>Security</h3>
                      
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#475569' }}>Current Password</label>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type={showCurrentPass ? 'text' : 'password'} 
                            value={editForm.current_password} 
                            onChange={(e) => setEditForm({ ...editForm, current_password: e.target.value })} 
                            style={{ 
                              width: '100%', 
                              padding: '10px 38px 10px 14px', 
                              background: '#f8fafc', 
                              border: `1px solid ${editForm.current_password ? (currentPassStatus === 'invalid' ? '#dc3545' : currentPassStatus === 'valid' ? '#10b981' : '#e2e8f0') : '#e2e8f0'}`, 
                              borderRadius: 10, 
                              fontSize: 13.5, 
                              color: '#0f172a',
                              boxSizing: 'border-box',
                              outline: 'none'
                            }} 
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowCurrentPass(!showCurrentPass)} 
                            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: 4 }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                          </button>
                        </div>
                        {editForm.current_password.length > 0 && currentPassStatus === 'invalid' && (
                          <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>
                            Wrong password.
                          </div>
                        )}
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: '#475569' }}>New Password</label>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type={showNewPass ? 'text' : 'password'} 
                            value={editForm.new_password} 
                            onChange={(e) => setEditForm({ ...editForm, new_password: e.target.value })} 
                            style={{ 
                              width: '100%', 
                              padding: '10px 38px 10px 14px', 
                              background: '#f8fafc', 
                              border: `1px solid ${editForm.new_password ? (isNewPassValid ? '#10b981' : '#e2e8f0') : '#e2e8f0'}`, 
                              borderRadius: 10, 
                              fontSize: 13.5, 
                              color: '#0f172a',
                              boxSizing: 'border-box',
                              outline: 'none'
                            }} 
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowNewPass(!showNewPass)} 
                            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: 4 }}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                          </button>
                        </div>

                        {editForm.new_password.length > 0 && !isNewPassValid && (
                          <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>
                            {!newPassUpper ? 'Password must contain at least one uppercase letter.' :
                             !newPassLower ? 'Password must contain at least one lowercase letter.' :
                             !newPassNumber ? 'Password must contain at least one number.' :
                             !newPassSpecial ? 'Password must contain at least one special character.' :
                             'Password must be at least 8 characters.'}
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                </div>

                {/* Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32, paddingTop: 18, borderTop: '1px solid #f1f5f9' }}>
                  <button 
                    type="button" 
                    onClick={() => setEditProfileOpen(false)} 
                    style={{ 
                      padding: '10px 24px', 
                      borderRadius: 10, 
                      background: '#f1f5f9', 
                      color: '#334155', 
                      fontWeight: 600, 
                      fontSize: 13.5, 
                      border: 'none', 
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={savingProfile} 
                    style={{ 
                      padding: '10px 26px', 
                      borderRadius: 10, 
                      background: '#0f172a', 
                      color: '#ffffff', 
                      fontWeight: 600, 
                      fontSize: 13.5, 
                      border: 'none', 
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Circular Avatar Crop & Zoom Modal */}
        {cropImageSrc && (
          <AvatarCropModal 
            imageSrc={cropImageSrc} 
            onClose={() => setCropImageSrc(null)} 
            onCropComplete={handleCropComplete} 
          />
        )}

        {/* Page content */}
        <main className="page-content flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   CIRCULAR AVATAR CROP & ZOOM MODAL COMPONENT
   ═══════════════════════════════════════════════════ */
function AvatarCropModal({ imageSrc, onClose, onCropComplete }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);
  const cropSize = 260; // diameter of circular frame in px

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch support for mobile/tablets
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  const handleWheel = (e) => {
    e.preventDefault();
    setScale((prev) => Math.min(3, Math.max(1, prev - e.deltaY * 0.0015)));
  };

  const handleCrop = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    const canvas = document.createElement('canvas');
    const outSize = 400; // Output 400x400 HD Avatar
    canvas.width = outSize;
    canvas.height = outSize;
    const ctx = canvas.getContext('2d');

    // Circular clip
    ctx.beginPath();
    ctx.arc(outSize / 2, outSize / 2, outSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Map displayed position to 400x400 canvas
    const ratio = outSize / cropSize;
    const baseScale = Math.max(cropSize / img.naturalWidth, cropSize / img.naturalHeight);
    const renderWidth = img.naturalWidth * baseScale * scale;
    const renderHeight = img.naturalHeight * baseScale * scale;

    const drawX = (cropSize / 2 - renderWidth / 2 + position.x) * ratio;
    const drawY = (cropSize / 2 - renderHeight / 2 + position.y) * ratio;
    const drawW = renderWidth * ratio;
    const drawH = renderHeight * ratio;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'cropped-avatar.jpg', { type: 'image/jpeg' });
        onCropComplete(file, URL.createObjectURL(blob));
      }
    }, 'image/jpeg', 0.95);
  };

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100001,
        padding: 20,
        boxSizing: 'border-box'
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        style={{
          background: '#ffffff',
          borderRadius: 20,
          padding: '24px 28px',
          maxWidth: 420,
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Crop & Adjust Photo</h3>
          <button 
            type="button" 
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              width: 30,
              height: 30,
              borderRadius: '50%',
              fontSize: 13,
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ margin: '0 0 16px 0', fontSize: 13, color: '#64748b' }}>
          Drag to reposition and use slider or mouse wheel to zoom in/out inside the round frame.
        </p>

        {/* Circular Crop Area */}
        <div 
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            position: 'relative',
            width: cropSize,
            height: cropSize,
            margin: '0 auto',
            overflow: 'hidden',
            borderRadius: '50%',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            boxShadow: '0 0 0 4px #0f172a, 0 10px 25px rgba(0,0,0,0.2)',
            background: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img 
            ref={imgRef}
            src={imageSrc} 
            alt="To crop"
            draggable={false}
            style={{
              position: 'absolute',
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              maxWidth: 'none',
              maxHeight: 'none',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              pointerEvents: 'none'
            }}
          />
        </div>

        {/* Zoom Controls */}
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12, padding: '0 10px' }}>
          <span style={{ fontSize: 14, color: '#64748b', userSelect: 'none' }}>🔍-</span>
          <input 
            type="range" 
            min="1" 
            max="3" 
            step="0.02" 
            value={scale} 
            onChange={(e) => setScale(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#0f172a', cursor: 'pointer' }}
          />
          <span style={{ fontSize: 14, color: '#64748b', userSelect: 'none' }}>🔍+</span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
          <button 
            type="button" 
            onClick={onClose}
            style={{
              padding: '9px 18px',
              borderRadius: 10,
              background: '#f1f5f9',
              color: '#334155',
              fontWeight: 600,
              fontSize: 13,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleCrop}
            style={{
              padding: '9px 22px',
              borderRadius: 10,
              background: '#0f172a',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 13,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(15,23,42,0.2)'
            }}
          >
            Apply & Set
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

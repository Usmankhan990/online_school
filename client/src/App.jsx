import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// ── Public Pages ──
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import FeaturesPage from './pages/public/FeaturesPage';
import ContactPage from './pages/public/ContactPage';
import PrivacyPage from './pages/public/PrivacyPage';
import TermsPage from './pages/public/TermsPage';

// ── Auth Pages ──
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// ── Admin Pages ──
import AdminDashboard from './pages/admin/AdminDashboard';
import PendingStudents from './pages/admin/PendingStudents';
import AdminStudents from './pages/admin/AdminStudents';
import ManageTeachers from './pages/admin/ManageTeachers';
import AdminBooks from './pages/admin/AdminBooks';
import AdminClasses from './pages/admin/AdminClasses';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminFees from './pages/admin/AdminFees';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminResults from './pages/admin/AdminResults';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';
import AdminParents from './pages/admin/AdminParents';
import AdminCourses from './pages/admin/AdminCourses';
import AdminExams from './pages/admin/AdminExams';

// ── Teacher Pages ──
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherCourses from './pages/teacher/TeacherCourses';
import TeacherExams from './pages/teacher/TeacherExams';
import TeacherLiveClasses from './pages/teacher/TeacherLiveClasses';
import TeacherBooks from './pages/teacher/TeacherBooks';
import TeacherBookViewer from './pages/teacher/TeacherBookViewer';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherMaterials from './pages/teacher/TeacherMaterials';
import TeacherHomework from './pages/teacher/TeacherHomework';
import TeacherSubmissions from './pages/teacher/TeacherSubmissions';
import TeacherResults from './pages/teacher/TeacherResults';
import TeacherNotifications from './pages/teacher/TeacherNotifications';

// ── Student Pages ──
import StudentDashboard from './pages/student/StudentDashboard';
import StudentMaterials from './pages/student/StudentMaterials';
import StudentResults from './pages/student/StudentResults';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentLiveClasses from './pages/student/StudentLiveClasses';
import StudentFees from './pages/student/StudentFees';
import StudentNotifications from './pages/student/StudentNotifications';
import StudentCourses from './pages/student/StudentCourses';
import StudentHomework from './pages/student/StudentHomework';
import StudentExams from './pages/student/StudentExams';
import StudentReportCard from './pages/student/StudentReportCard';

// ── Parent Pages ──
import ParentDashboard from './pages/parent/ParentDashboard';
import ParentAttendance from './pages/parent/ParentAttendance';
import ParentResults from './pages/parent/ParentResults';
import ParentFees from './pages/parent/ParentFees';
import ParentHomework from './pages/parent/ParentHomework';
import ParentReportCard from './pages/parent/ParentReportCard';
import ParentNotifications from './pages/parent/ParentNotifications';

// ── Shared Pages ──
import ProfilePage from './pages/shared/ProfilePage';

// ── Placeholder (for remaining minor pages) ──
import PlaceholderPage from './pages/PlaceholderPage';

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" />;
  const routes = { super_admin: '/admin', teacher: '/teacher', student: '/student', parent: '/parent' };
  return <Navigate to={routes[user.role] || '/'} />;
}

// Helper wrapper for dashboard pages
const D = ({ children, roles }) => (
  <ProtectedRoute roles={roles}><DashboardLayout>{children}</DashboardLayout></ProtectedRoute>
);
const P = ({ title, roles }) => (
  <D roles={roles}><PlaceholderPage title={title} /></D>
);

function App() {
  return (
    <BrowserRouter basename="/online_school">
      <AuthProvider>
        <Routes>
          {/* ═══════ Public Website ═══════ */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* ═══════ Auth ═══════ */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<LoginPage />} />
          <Route path="/dashboard" element={<RoleRedirect />} />

          {/* ═══════ SUPER ADMIN PORTAL ═══════ */}
          <Route path="/admin" element={<D roles={['super_admin']}><AdminDashboard /></D>} />
          <Route path="/admin/pending-students" element={<D roles={['super_admin']}><PendingStudents /></D>} />
          <Route path="/admin/students" element={<D roles={['super_admin']}><AdminStudents /></D>} />
          <Route path="/admin/teachers" element={<D roles={['super_admin']}><ManageTeachers /></D>} />
          <Route path="/admin/books" element={<D roles={['super_admin']}><AdminBooks /></D>} />
          <Route path="/admin/classes" element={<D roles={['super_admin']}><AdminClasses /></D>} />
          <Route path="/admin/subjects" element={<D roles={['super_admin']}><AdminSubjects /></D>} />
          <Route path="/admin/fees" element={<D roles={['super_admin']}><AdminFees /></D>} />
          <Route path="/admin/payments" element={<D roles={['super_admin']}><AdminFees /></D>} />
          <Route path="/admin/parents" element={<D roles={['super_admin']}><AdminParents /></D>} />
          <Route path="/admin/courses" element={<D roles={['super_admin']}><AdminCourses /></D>} />
          <Route path="/admin/exams" element={<D roles={['super_admin']}><AdminExams /></D>} />
          <Route path="/admin/attendance" element={<D roles={['super_admin']}><AdminAttendance /></D>} />
          <Route path="/admin/results" element={<D roles={['super_admin']}><AdminResults /></D>} />
          <Route path="/admin/notifications" element={<D roles={['super_admin']}><AdminNotifications /></D>} />
          <Route path="/admin/reports" element={<D roles={['super_admin']}><AdminReports /></D>} />
          <Route path="/admin/settings" element={<D roles={['super_admin']}><AdminSettings /></D>} />
          <Route path="/admin/profile" element={<D roles={['super_admin']}><ProfilePage /></D>} />

          {/* ═══════ TEACHER PORTAL ═══════ */}
          <Route path="/teacher" element={<D roles={['teacher']}><TeacherDashboard /></D>} />
          <Route path="/teacher/courses" element={<D roles={['teacher']}><TeacherCourses /></D>} />
          <Route path="/teacher/exams" element={<D roles={['teacher']}><TeacherExams /></D>} />
          <Route path="/teacher/materials" element={<D roles={['teacher']}><TeacherMaterials /></D>} />
          <Route path="/teacher/homework" element={<D roles={['teacher']}><TeacherHomework /></D>} />
          <Route path="/teacher/submissions" element={<D roles={['teacher']}><TeacherSubmissions /></D>} />
          <Route path="/teacher/attendance" element={<D roles={['teacher']}><TeacherAttendance /></D>} />
          <Route path="/teacher/live-classes" element={<D roles={['teacher']}><TeacherLiveClasses /></D>} />
          <Route path="/teacher/books" element={<D roles={['teacher']}><TeacherBooks /></D>} />
          <Route path="/teacher/books/:id" element={<D roles={['teacher']}><TeacherBookViewer /></D>} />
          <Route path="/teacher/results" element={<D roles={['teacher']}><TeacherResults /></D>} />
          <Route path="/teacher/notifications" element={<D roles={['teacher']}><TeacherNotifications /></D>} />
          <Route path="/teacher/profile" element={<D roles={['teacher']}><ProfilePage /></D>} />

          {/* ═══════ STUDENT PORTAL ═══════ */}
          <Route path="/student" element={<D roles={['student']}><StudentDashboard /></D>} />
          <Route path="/student/courses" element={<D roles={['student']}><StudentCourses /></D>} />
          <Route path="/student/live-classes" element={<D roles={['student']}><StudentLiveClasses /></D>} />
          <Route path="/student/materials" element={<D roles={['student']}><StudentMaterials /></D>} />
          <Route path="/student/homework" element={<D roles={['student']}><StudentHomework /></D>} />
          <Route path="/student/exams" element={<D roles={['student']}><StudentExams /></D>} />
          <Route path="/student/results" element={<D roles={['student']}><StudentResults /></D>} />
          <Route path="/student/report-card" element={<D roles={['student']}><StudentReportCard /></D>} />
          <Route path="/student/attendance" element={<D roles={['student']}><StudentAttendance /></D>} />
          <Route path="/student/fees" element={<D roles={['student']}><StudentFees /></D>} />
          <Route path="/student/notifications" element={<D roles={['student']}><StudentNotifications /></D>} />
          <Route path="/student/profile" element={<D roles={['student']}><ProfilePage /></D>} />

          {/* ═══════ PARENT PORTAL ═══════ */}
          <Route path="/parent" element={<D roles={['parent']}><ParentDashboard /></D>} />
          <Route path="/parent/child" element={<D roles={['parent']}><ParentDashboard /></D>} />
          <Route path="/parent/attendance" element={<D roles={['parent']}><ParentAttendance /></D>} />
          <Route path="/parent/homework" element={<D roles={['parent']}><ParentHomework /></D>} />
          <Route path="/parent/results" element={<D roles={['parent']}><ParentResults /></D>} />
          <Route path="/parent/report-card" element={<D roles={['parent']}><ParentReportCard /></D>} />
          <Route path="/parent/fees" element={<D roles={['parent']}><ParentFees /></D>} />
          <Route path="/parent/notifications" element={<D roles={['parent']}><ParentNotifications /></D>} />
          <Route path="/parent/profile" element={<D roles={['parent']}><ProfilePage /></D>} />

          {/* ═══════ 404 ═══════ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeContextProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import LeavesPage from './pages/LeavesPage';
import AdminLeavesPage from './pages/AdminLeavesPage';
import AdminEmployeesPage from './pages/AdminEmployeesPage';
import AdminAttendancePage from './pages/AdminAttendancePage';
import AttendancePage from './pages/AttendancePage';
import AdminTasksPage from './pages/AdminTasksPage';
import AdminCustomersPage from './pages/AdminCustomersPage';
import AdminHolidaysPage from './pages/AdminHolidaysPage';
import HolidaysPage from './pages/HolidaysPage';
import TasksPage from './pages/TasksPage';
import AdminNoticesPage from './pages/AdminNoticesPage';
import AdminSalaryPage from './pages/AdminSalaryPage';
import UserSalaryPage from './pages/UserSalaryPage';
import ConveyancePage from './pages/ConveyancePage';
import AdminConveyancePage from './pages/AdminConveyancePage';
import SiteVisitsPage from './pages/SiteVisitsPage';
import AdminSiteVisitsPage from './pages/AdminSiteVisitsPage';
import { Menu } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: string }> = ({ children, role }) => {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
    </div>
  );

  if (!user) {
    console.log('ProtectedRoute: No user found, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    console.log(`ProtectedRoute: Role mismatch. Expected: ${role}, User Role: ${user.role}. Redirecting...`);
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />;
  }

  return (
    <div className="app-layout" style={{ display: 'flex', backgroundColor: 'var(--bg)', minHeight: '100vh', position: 'relative' }}>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="app-layout-content" style={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease' }}>
        {/* Mobile Header */}
        <div style={{
          height: 'var(--header-height)',
          width: '100%',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 80,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }} className="mobile-only-flex">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            style={{
              background: 'var(--primary-light)',
              border: 'none',
              borderRadius: '10px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              cursor: 'pointer',
            }}
          >
            <Menu size={20} />
          </button>
          <div style={{ marginLeft: '16px', fontWeight: 800, color: 'var(--primary)', fontSize: '18px' }}>CMS</div>
        </div>

        <main className="main-layout" style={{ 
          flex: 1, 
          marginLeft: 'var(--sidebar-width)',
          width: 'calc(100% - var(--sidebar-width))',
          transition: 'all 0.3s ease',
          padding: 'var(--page-padding)'
        }}>
          {children}
        </main>
        <div style={{ marginLeft: 'var(--sidebar-width)', transition: 'all 0.3s ease' }}>
          <Footer />
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeContextProvider>
      <AuthProvider>
        <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/leaves" element={
            <ProtectedRoute role="admin">
              <AdminLeavesPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/employees" element={
            <ProtectedRoute role="admin">
              <AdminEmployeesPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/attendance" element={
            <ProtectedRoute role="admin">
              <AdminAttendancePage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/tasks" element={
            <ProtectedRoute role="admin">
              <AdminTasksPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/customers" element={
            <ProtectedRoute role="admin">
              <AdminCustomersPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/holidays" element={
            <ProtectedRoute role="admin">
              <AdminHolidaysPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/site-visits" element={
            <ProtectedRoute role="admin">
              <AdminSiteVisitsPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/notices" element={
            <ProtectedRoute role="admin">
              <AdminNoticesPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/salary" element={
            <ProtectedRoute role="admin">
              <AdminSalaryPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/conveyance" element={
            <ProtectedRoute role="admin">
              <AdminConveyancePage />
            </ProtectedRoute>
          } />

          <Route path="/attendance" element={
            <ProtectedRoute role="user">
              <AttendancePage />
            </ProtectedRoute>
          } />

          <Route path="/leaves" element={
            <ProtectedRoute role="user">
              <LeavesPage />
            </ProtectedRoute>
          } />

          <Route path="/tasks" element={
            <ProtectedRoute role="user">
              <TasksPage />
            </ProtectedRoute>
          } />

          <Route path="/holidays" element={
            <ProtectedRoute role="user">
              <HolidaysPage />
            </ProtectedRoute>
          } />

          <Route path="/salary" element={
            <ProtectedRoute role="user">
              <UserSalaryPage />
            </ProtectedRoute>
          } />

          <Route path="/conveyance" element={
            <ProtectedRoute role="user">
              <ConveyancePage />
            </ProtectedRoute>
          } />

          <Route path="/site-visits" element={
            <ProtectedRoute role="user">
              <SiteVisitsPage />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute role="user">
              <UserDashboard />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
        </Router>
      </AuthProvider>
    </ThemeContextProvider>
  );
}

export default App;

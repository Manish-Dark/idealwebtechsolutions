import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, CheckSquare, LogOut,
  User, FileText, MapPin, CreditCard, Briefcase, Building2,
  Megaphone, Activity, Car, Sun, Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const adminLinks = [
    { name: 'Dashboard',   icon: <LayoutDashboard size={18} />, path: '/admin' },
    { name: 'Customers',   icon: <Building2 size={18} />,       path: '/admin/customers' },
    { name: 'Employees',   icon: <Users size={18} />,           path: '/admin/employees' },
    { name: 'Attendance',  icon: <Activity size={18} />,        path: '/admin/attendance' },
    { name: 'Site Visits', icon: <MapPin size={18} />,          path: '/admin/site-visits' },
    { name: 'Leaves',      icon: <Calendar size={18} />,        path: '/admin/leaves' },
    { name: 'Tasks',       icon: <CheckSquare size={18} />,     path: '/admin/tasks' },
    { name: 'Holidays',    icon: <Briefcase size={18} />,       path: '/admin/holidays' },
    { name: 'Salary',      icon: <CreditCard size={18} />,      path: '/admin/salary' },
    { name: 'Conveyance',  icon: <Car size={18} />,             path: '/admin/conveyance' },
    { name: 'Notices',     icon: <Megaphone size={18} />,       path: '/admin/notices' },
  ];

  const userLinks = [
    { name: 'Dashboard',    icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { name: 'Attendance',   icon: <Calendar size={18} />,        path: '/attendance' },
    { name: 'Leaves',       icon: <FileText size={18} />,        path: '/leaves' },
    { name: 'Tasks',        icon: <CheckSquare size={18} />,     path: '/tasks' },
    { name: 'Holidays',     icon: <Briefcase size={18} />,       path: '/holidays' },
    { name: 'Salary Slips', icon: <CreditCard size={18} />,      path: '/salary' },
    { name: 'Conveyance',   icon: <Car size={18} />,             path: '/conveyance' },
    { name: 'Site Visits',  icon: <MapPin size={18} />,          path: '/site-visits' },
  ];

  const links = user?.role === 'admin' ? adminLinks : userLinks;

  return (
    <div style={{
      width: '260px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      background: 'var(--sidebar-bg)',
      boxShadow: '4px 0 24px rgba(99,102,241,0.25)',
      overflow: 'hidden',
    }}>
      {/* Decorative orbs */}
      <div style={{
        position: 'absolute', top: '-40px', right: '-40px',
        width: '140px', height: '140px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.07)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '80px', left: '-50px',
        width: '160px', height: '160px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{
        padding: '24px 20px 18px',
        borderBottom: '1px solid var(--sidebar-border)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
      }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '13px',
          background: 'rgba(255,255,255,0.22)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: 900, color: 'white',
          letterSpacing: '0.5px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)',
        }}>CMS</div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light' : 'Switch to Dark'}
          style={{
            width: '46px',
            height: '26px',
            borderRadius: '99px',
            background: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.3)',
            cursor: 'pointer',
            position: 'relative',
            transition: 'background 0.3s ease',
            flexShrink: 0,
          }}
        >
          <div style={{
            position: 'absolute',
            top: '3px',
            left: '3px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'white',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isDark ? 'translateX(20px)' : 'translateX(0)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {isDark
              ? <Moon size={11} color="#6366F1" strokeWidth={2.5} />
              : <Sun size={11} color="#F97316" strokeWidth={2.5} />
            }
          </div>
        </button>
      </div>

      {/* Profile chip */}
      <NavLink to="/profile" style={{ textDecoration: 'none', flexShrink: 0 }}>
        <div style={{
          margin: '14px 12px 8px',
          padding: '12px 14px',
          borderRadius: '14px',
          background: 'rgba(255,255,255,0.14)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '11px',
          transition: 'background 0.2s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.22)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.14)')}
        >
          <div style={{
            width: '36px', height: '36px', borderRadius: '11px',
            background: 'rgba(255,255,255,0.25)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '15px', flexShrink: 0,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)',
          }}>
            {(user?.name || 'U').charAt(0)}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: '13px', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
              {user?.role === 'admin' ? '🔐 Administrator' : '👤 Employee'}
            </p>
          </div>
          <User size={14} color="rgba(255,255,255,0.5)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
        </div>
      </NavLink>

      {/* Nav links */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 10px 8px' }} className="custom-scrollbar">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/admin' || link.path === '/dashboard'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: '10px 13px',
              borderRadius: '12px',
              marginBottom: '3px',
              gap: '11px',
              color: isActive ? 'white' : 'var(--sidebar-text)',
              backgroundColor: isActive ? 'rgba(255,255,255,0.22)' : 'transparent',
              fontWeight: isActive ? 700 : 500,
              fontSize: '14px',
              transition: 'all 0.15s ease',
              textDecoration: 'none',
              boxShadow: isActive ? 'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 12px rgba(0,0,0,0.1)' : 'none',
              backdropFilter: isActive ? 'blur(8px)' : 'none',
              border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
            })}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              if (el.getAttribute('aria-current') !== 'page') {
                el.style.backgroundColor = 'rgba(255,255,255,0.1)';
              }
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              if (el.getAttribute('aria-current') !== 'page') {
                el.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ opacity: 0.9 }}>{link.icon}</span>
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '10px 10px 20px', flexShrink: 0, borderTop: '1px solid var(--sidebar-border)', position: 'relative' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '11px',
            width: '100%',
            padding: '10px 13px',
            borderRadius: '12px',
            color: 'rgba(255,255,255,0.8)',
            backgroundColor: 'rgba(239,68,68,0.2)',
            fontSize: '14px',
            fontWeight: 600,
            border: '1px solid rgba(239,68,68,0.3)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.35)';
            (e.currentTarget as HTMLButtonElement).style.color = 'white';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.2)';
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.8)';
          }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Calendar, CheckSquare, Briefcase, ChevronRight, Activity } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeTasks: 0,
    holidaysLeft: 0,
    pendingLeaves: 0,
    siteVisitsToday: 0,
    activeProjects: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, leavesRes, tasksRes, holidaysRes, visitsRes, customersRes] = await Promise.all([
          api.get('/api/admin/users'),
          api.get('/api/admin/leaves'),
          api.get('/api/admin/tasks'),
          api.get('/api/admin/holidays'),
          api.get('/api/admin/site-visits'),
          api.get('/api/admin/customers')
        ]);

        const today = new Date().setHours(0, 0, 0, 0);

        setStats({
          totalEmployees: usersRes.data.length,
          pendingLeaves: leavesRes.data.filter((l: any) => l.status === 'Pending').length,
          activeTasks: tasksRes.data.filter((t: any) => t.progress < 100).length,
          holidaysLeft: holidaysRes.data.filter((h: any) => new Date(h.date).getTime() >= today).length,
          siteVisitsToday: visitsRes.data.filter((v: any) => new Date(v.date).setHours(0, 0, 0, 0) === today).length,
          activeProjects: customersRes.data.length
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Polling every 10 seconds
    return () => clearInterval(interval);
  }, [user]);

  const shortcuts = [
    {
      title: 'Employee Directory',
      desc: 'Manage profiles, IDs, and joining dates',
      icon: <Users size={24} />,
      path: '/admin/employees',
      color: 'var(--primary)',
      count: stats.totalEmployees
    },
    {
      title: 'Leave Requests',
      desc: 'Approve or reject employee leave applications',
      icon: <Calendar size={24} />,
      path: '/admin/leaves',
      color: 'var(--warning)',
      count: stats.pendingLeaves,
      badge: stats.pendingLeaves > 0 ? 'Urgent' : null
    },
    {
      title: 'Company Tasks',
      desc: 'Assign and track project progress',
      icon: <CheckSquare size={24} />,
      path: '/admin/tasks',
      color: 'var(--success)',
      count: stats.activeTasks
    },
    {
      title: 'Holiday Calendar',
      desc: 'Manage company-wide holidays',
      icon: <Briefcase size={24} />,
      path: '/admin/holidays',
      color: 'var(--error)',
      count: stats.holidaysLeft
    }
  ];

  return (
    <div>
      <header style={{ marginBottom: '40px' }}>
        <div>
          <h1 className="responsive-h1" style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Admin Overview</h1>
          <p style={{ color: '#000000' }}>Welcome back, {user?.name}. Here is what's happening today.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-card" style={{ padding: '28px' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Total Strength</p>
          <h2 style={{ fontSize: '28px', fontWeight: 700 }}>{stats.totalEmployees} <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--success)' }}>Employees</span></h2>
        </div>
        <div className="glass-card" style={{ padding: '28px' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Pending Approvals</p>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: stats.pendingLeaves > 0 ? 'var(--warning)' : 'inherit' }}>{stats.pendingLeaves}</h2>
        </div>
        <div className="glass-card" style={{ padding: '28px' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Site Visits</p>
          <h2 style={{ fontSize: '28px', fontWeight: 700 }}>{stats.siteVisitsToday} <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>Today</span></h2>
        </div>
        <div className="glass-card" style={{ padding: '28px' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Active Projects</p>
          <h2 style={{ fontSize: '28px', fontWeight: 700 }}>{stats.activeProjects}</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '24px' }}>
        {shortcuts.map(item => (
          <div
            key={item.path}
            className="glass-card"
            onClick={() => navigate(item.path)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              border: item.badge ? '1.5px solid var(--warning)' : '1.5px solid var(--border)',
              padding: '24px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'var(--primary)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = item.badge ? 'var(--warning)' : 'var(--border)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: `${item.color}10`,
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {item.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '18px' }}>{item.title}</h3>
                  {item.badge && <span style={{ backgroundColor: 'var(--warning)', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase', fontWeight: 700 }}>{item.badge}</span>}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.desc}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              <span style={{ fontSize: '20px', fontWeight: 800 }}>{item.count}</span>
              <ChevronRight size={20} color="var(--text-muted)" />
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Activity color="var(--primary)" size={24} />
          <div>
            <h4 style={{ fontWeight: 700 }}>System Health</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>All modules operational. Last sync: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ width: '4px', height: '16px', backgroundColor: 'var(--success)', borderRadius: '2px' }}></div>)}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

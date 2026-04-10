import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bell, Calendar, Info, AlertTriangle } from 'lucide-react';

const NoticesPage: React.FC = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotices = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const res = await axios.get(`http://localhost:5000/api/users/notices?t=${Date.now()}`, config);
      setNotices(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch Notices Error:', err);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotices();
    const interval = setInterval(fetchNotices, 15000); // Check for new announcements every 15s
    return () => clearInterval(interval);
  }, [fetchNotices]);

  const getPriorityTheme = (p: string) => {
    switch(p) {
      case 'Urgent': return { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', icon: <Bell size={20} /> };
      case 'High': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', icon: <AlertTriangle size={20} /> };
      case 'Medium': return { bg: 'rgba(0, 102, 255, 0.1)', color: 'var(--primary)', icon: <Info size={20} /> };
      default: return { bg: 'rgba(100, 116, 139, 0.1)', color: 'var(--text-muted)', icon: <Info size={20} /> };
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading announcements...</div>;

  return (
    <div style={{ padding: '0px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 className="responsive-h1" style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Corporate Notices</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Stay informed with the latest official announcements and policy updates.</p>
      </header>

      <div style={{ display: 'grid', gap: '24px' }}>
        {notices.map(n => {
          const theme = getPriorityTheme(n.priority);
          return (
            <div 
              key={n._id} 
              className="glass-card" 
              style={{ 
                padding: '32px', 
                borderLeft: `6px solid ${theme.color}`,
                transition: 'transform 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: theme.bg, color: theme.color }}>
                    {theme.icon}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: theme.color }}>
                    {n.priority} Announcement
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>
                  <Calendar size={14} />
                  {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px', color: 'var(--text-main)' }}>{n.title}</h2>
              <p style={{ fontSize: '15px', color: 'var(--text-main)', lineHeight: '1.7', whiteSpace: 'pre-wrap', opacity: 0.9 }}>{n.content}</p>
              
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Published at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {notices.length === 0 && (
          <div className="glass-card" style={{ textAlign: 'center', padding: '80px 40px' }}>
            <Bell size={48} color="var(--border)" style={{ margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)' }}>Quiet for now</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>There are no official notices published at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticesPage;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Calendar, Briefcase, FileText, ChevronRight, Activity, Megaphone, Bell, Info, AlertTriangle, Sparkles, Send } from 'lucide-react';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [stats, setStats] = useState({ present: 0, pendingTasks: 0, holidays: 0, leaves: 0 });
  const [holidays, setHolidays] = useState<any[]>([]);
  const [moods, setMoods] = useState<any[]>([]);
  const [newMood, setNewMood] = useState('Productive');
  const [isSubmittingMood, setIsSubmittingMood] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        
        const [tasksRes, attendanceRes, noticesRes, holidayRes, leaveRes, moodRes] = await Promise.all([
          axios.get('http://localhost:5000/api/users/tasks', config),
          axios.get('http://localhost:5000/api/users/attendance', config),
          axios.get('http://localhost:5000/api/users/notices', config),
          axios.get('http://localhost:5000/api/users/holidays', config),
          axios.get('http://localhost:5000/api/users/leaves', config),
          axios.get('http://localhost:5000/api/users/mood', config)
        ]);
        
        setTasks(tasksRes.data);
        setNotices(noticesRes.data);
        setHolidays(holidayRes.data);
        setMoods(moodRes.data);
        
        const today = new Date().toISOString().split('T')[0];
        const upcomingHolidays = holidayRes.data.filter((h: any) => h.date >= today).length;

        setStats({
          present: attendanceRes.data.length,
          pendingTasks: tasksRes.data.filter((t: any) => t.status === 'Pending').length,
          holidays: upcomingHolidays,
          leaves: leaveRes.data.length
        });
      } catch (err) {
        console.error('Fetch Dashboard Error:', err);
      }
    };
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMoodSubmit = async () => {
    try {
      setIsSubmittingMood(true);
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const res = await axios.post('http://localhost:5000/api/users/mood', { mood: newMood }, config);
      setMoods([res.data, ...moods.slice(0, 9)]);
      setIsSubmittingMood(false);
    } catch (err) {
      console.error('Mood Submit Error:', err);
      setIsSubmittingMood(false);
    }
  };

  const getPriorityTheme = (p: string) => {
    switch(p) {
      case 'Urgent': return { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', icon: <Bell size={16} /> };
      case 'High': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', icon: <AlertTriangle size={16} /> };
      case 'Medium': return { bg: 'rgba(0, 102, 255, 0.1)', color: 'var(--primary)', icon: <Info size={16} /> };
      default: return { bg: 'rgba(100, 116, 139, 0.1)', color: 'var(--text-muted)', icon: <Info size={16} /> };
    }
  };

  return (
    <div style={{ padding: '0px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 className="responsive-h1" style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Hello, {user?.name} 👋</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back to your employee dashboard. Have a productive day!</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 250px), 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
              <Calendar size={24} />
            </div>
            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Working Days</span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 700 }}>{stats.present} <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400 }}>Total</span></h2>
        </div>
 
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
              <Briefcase size={24} />
            </div>
            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Pending Tasks</span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 700 }}>{stats.pendingTasks}</h2>
        </div>
 
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
              <FileText size={24} />
            </div>
            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Holidays</span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 700 }}>{stats.holidays} <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400 }}>Upcoming</span></h2>
        </div>
 
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(0, 102, 255, 0.1)', color: 'var(--primary)' }}>
              <FileText size={24} />
            </div>
            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>My Leaves</span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 700 }}>{stats.leaves} <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400 }}>Total</span></h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* COMPANY ANNOUNCEMENTS */}
          {notices.length > 0 && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '420px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexShrink: 0 }}>
                <Megaphone size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Company Announcements</h3>
              </div>
              <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', paddingRight: '8px' }}>
                {notices.map(n => {
                  const theme = getPriorityTheme(n.priority);
                  return (
                    <div key={n._id} style={{ padding: '16px', borderRadius: '12px', border: `1px solid var(--border)`, borderLeft: `8px solid ${theme.color}`, backgroundColor: 'rgba(255,255,255,0.01)', flexShrink: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                           <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: theme.color, backgroundColor: theme.bg, padding: '2px 8px', borderRadius: '4px' }}>{n.priority}</span>
                           <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{n.title}</h4>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-main)', opacity: 0.8, lineHeight: '1.5' }}>{n.content}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexShrink: 0 }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Recent Assignments</h3>
              <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>View All</span>
            </div>
            <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '12px' }}>
              {tasks.length > 0 ? tasks.map((task: any) => (
                <div key={task._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle size={16} color={task.progress === 100 ? 'var(--success)' : 'var(--text-muted)'} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '14px' }}>{task.title}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Due: {new Date(task.deadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                     <span style={{ fontSize: '11px', fontWeight: 700, color: task.progress === 100 ? 'var(--success)' : 'var(--primary)' }}>{task.progress || 0}%</span>
                     <ChevronRight size={16} color="var(--text-muted)" />
                  </div>
                </div>
              )) : <p style={{ color: 'var(--text-muted)' }}>No tasks assigned.</p>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* MY HEALTH & MOOD */}
          <div className="glass-card">
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>My Health</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Activity color="var(--primary)" size={18} />
                  <div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Recent Mood</p>
                    <p style={{ fontWeight: 600 }}>{moods[0]?.mood || 'Not set'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                   {['Happy', 'Productive', 'Tired', 'Focused'].map(m => (
                     <button 
                       key={m} 
                       onClick={() => setNewMood(m)}
                       style={{ 
                         padding: '4px 8px', 
                         borderRadius: '6px', 
                         fontSize: '11px', 
                         border: '1px solid var(--border)',
                         backgroundColor: newMood === m ? 'var(--primary)' : 'transparent',
                         color: newMood === m ? 'white' : 'var(--text-muted)',
                         cursor: 'pointer'
                       }}
                     >
                       {m}
                     </button>
                   ))}
                   <button 
                     onClick={handleMoodSubmit} 
                     disabled={isSubmittingMood}
                     style={{ padding: '4px', borderRadius: '6px', backgroundColor: 'var(--success)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                   >
                     <Send size={12} />
                   </button>
                </div>
              </div>
              <div style={{ height: '80px', backgroundColor: 'rgba(0, 102, 255, 0.05)', borderRadius: '12px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '12px' }}>
                {[40, 70, 45, 90, 65, 80, 50].map((h, i) => <div key={i} style={{ flex: 1, height: `${h}%`, backgroundColor: 'var(--primary)', borderRadius: '4px', opacity: 0.3 + (i * 0.1) }}></div>)}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>Weekly Engagement Activity</p>
            </div>
          </div>

          {/* UPCOMING HOLIDAYS HISTORY */}
          <div className="glass-card">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Upcoming Holidays</h3>
                <Calendar size={18} color="var(--primary)" />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {holidays.filter(h => new Date(h.date) >= new Date(new Date().setHours(0,0,0,0))).slice(0, 3).map(h => (
                  <div key={h._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(0, 102, 255, 0.05)', color: 'var(--primary)', flexShrink: 0 }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, lineHeight: 1 }}>{new Date(h.date).getDate()}</span>
                        <span style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase' }}>{new Date(h.date).toLocaleString('default', { month: 'short' })}</span>
                     </div>
                     <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.title}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{h.type}</p>
                     </div>
                  </div>
                ))}
                {holidays.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No upcoming holidays.</p>}
                <div style={{ marginTop: '8px', textAlign: 'center' }}>
                   <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => window.location.href = '/holidays'}>View Full Calendar</span>
                </div>
             </div>
          </div>

          {/* RECENT MOOD HISTORY */}
          <div className="glass-card">
             <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Mood History</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {moods.slice(0, 5).map(m => (
                  <div key={m._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={14} color="var(--warning)" />
                        <span style={{ fontSize: '13px', fontWeight: 500 }}>{m.mood}</span>
                     </div>
                     <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(m.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
                {moods.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No mood entries yet.</p>}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Calendar, AlertCircle } from 'lucide-react';

const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyTasks = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const res = await axios.get(`http://localhost:5000/api/users/tasks?t=${Date.now()}`, config);
      setTasks(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch My Tasks Error:', err);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyTasks();
    const interval = setInterval(fetchMyTasks, 10000); // Live sync
    return () => clearInterval(interval);
  }, [fetchMyTasks]);

  const updateProgress = async (id: string, progress: number) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(`http://localhost:5000/api/users/tasks/${id}/progress`, { progress }, config);
      // Optimistically update UI
      setTasks(prev => prev.map(t => t._id === id ? { ...t, progress } : t));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update progress');
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'var(--success)';
    if (progress >= 70) return 'var(--primary)';
    if (progress >= 50) return 'var(--warning)';
    return 'var(--error)';
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading your tasks...</div>;

  return (
    <div style={{ padding: '40px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>My Assignments</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your assigned tasks and report your ongoing completion progress.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
        {tasks.map(t => (
          <div key={t._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
               <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>{t.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: new Date(t.deadline) < new Date() && t.progress < 100 ? 'var(--error)' : 'var(--text-muted)' }}>
                     {new Date(t.deadline) < new Date() && t.progress < 100 ? <AlertCircle size={14} /> : <Calendar size={14} />}
                     <span style={{ fontSize: '12px', fontWeight: 600 }}>Due: {new Date(t.deadline).toLocaleDateString()}</span>
                  </div>
               </div>
               <div style={{ padding: '6px 12px', backgroundColor: t.progress === 100 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.05)', color: t.progress === 100 ? 'var(--success)' : 'var(--text-main)', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                 {t.progress === 100 ? 'Done' : 'Active'}
               </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px', flex: 1 }}>
              {t.description}
            </p>

            <div style={{ marginTop: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                 <span>Completion Status</span>
                 <span>{t.progress || 0}%</span>
              </div>
              
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
                  <div style={{ height: '100%', width: `${t.progress || 0}%`, backgroundColor: getProgressColor(t.progress || 0), transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                 {[30, 50, 70, 100].map(val => (
                   <button 
                     key={val}
                     onClick={() => updateProgress(t._id, val)}
                     disabled={t.progress === val || t.progress === 100}
                     style={{ 
                       padding: '10px 0', 
                       borderRadius: '8px', 
                       border: t.progress === val ? `2px solid ${getProgressColor(val)}` : '1px solid var(--border)',
                       backgroundColor: t.progress === val ? `${getProgressColor(val)}15` : 'var(--surface)',
                       color: t.progress === val ? getProgressColor(val) : 'var(--text-main)',
                       fontWeight: 700,
                       fontSize: '13px',
                       cursor: (t.progress === val || t.progress === 100) ? 'default' : 'pointer',
                       opacity: (t.progress === val || t.progress === 100) ? (t.progress === val ? 1 : 0.4) : 0.8,
                       transition: 'all 0.2s'
                     }}
                   >
                     {val === 100 ? 'Done' : `${val}%`}
                   </button>
                 ))}
              </div>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
            <CheckSquare size={48} color="var(--border)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>You're all caught up!</h3>
            <p style={{ color: 'var(--text-muted)' }}>You have no assigned tasks. Enjoy your day.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;

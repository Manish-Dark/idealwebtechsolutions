import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Trash2, User as UserIcon, AlertCircle } from 'lucide-react';

const AdminTasksPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    deadline: ''
  });

  const fetchAllData = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const [tasksRes, usersRes, customersRes] = await Promise.all([
        axios.get(`/api/admin/tasks?t=${Date.now()}`, config),
        axios.get(`/api/admin/users?t=${Date.now()}`, config),
        axios.get(`/api/admin/customers?t=${Date.now()}`, config)
      ]);
      setTasks(tasksRes.data);
      // Only keep normal users
      setUsers(usersRes.data.filter((u: any) => u.role === 'user'));
      setCustomers(customersRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch Tasks Error:', err);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 10000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.post('/api/admin/tasks', taskForm, config);
      alert('Task assigned successfully!');
      setTaskForm({ title: '', description: '', assignedTo: '', deadline: '' });
      fetchAllData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign task');
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete(`/api/admin/tasks/${id}`, config);
      fetchAllData();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'var(--success)';
    if (progress >= 70) return 'var(--primary)';
    if (progress >= 50) return 'var(--warning)';
    return 'var(--error)';
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading tasks...</div>;

  return (
    <div>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ flex: '1', minWidth: 0 }}>
          <h1 className="responsive-h1" style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Task Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Assign work to employees and monitor real-time completion progress.</p>
        </div>
        <div className="status-pill status-pill--live">
          <div className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
          LIVE
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '32px', alignItems: 'start' }}>

        {/* ASSIGN TASK MODULE */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <CheckSquare size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Assign New Task</h3>
          </div>

          <form onSubmit={handleAssignTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Employee</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <select
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)' }}
                  required
                >
                  <option value="">Select an employee...</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} (#{u.employeeId})</option>
                  ))}
                </select>
                {taskForm.assignedTo && (
                  <div style={{ padding: '0', backgroundColor: 'transparent', borderRadius: '8px' }}>
                    <select
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--primary)', backgroundColor: 'rgba(0, 102, 255, 0.05)', color: 'var(--primary)', fontWeight: 600 }}
                    >
                      <option value="">Associate with a Client Company (Optional)</option>
                      {customers.map((c) => (
                        <option key={c._id} value={c._id}>{c.company} ({c.name})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Task Title</label>
              <input
                type="text"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                required
                placeholder="e.g. Design Homepage"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Deadline</label>
              <input
                type="date"
                value={taskForm.deadline}
                onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Description</label>
              <textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Detail the exact requirements..."
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', minHeight: '100px', resize: 'vertical' }}
                required
              />
            </div>
            <button
              type="submit"
              style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '12px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: '8px' }}
            >
              Deploy Task
            </button>
          </form>
        </div>

        {/* MONITOR PIPELINE */}
        <div className="glass-card" style={{ padding: '0', height: 'fit-content' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
            <h3 className="responsive-h3" style={{ fontWeight: 700 }}>Deployment Pipeline</h3>
          </div>

          {/* Table View (Desktop) */}
          <div className="task-table-container">
            <div className="table-wrap">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '16px 24px' }}>Task</th>
                    <th style={{ padding: '16px 24px' }}>Assigned To</th>
                    <th style={{ padding: '16px 24px' }}>Deadline</th>
                    <th style={{ padding: '16px 24px' }}>Progress</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(t => (
                    <tr key={t._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{t.title}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.description.substring(0, 40)}{t.description.length > 40 && '...'}</p>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <UserIcon size={14} color="var(--text-muted)" />
                          <span style={{ fontSize: '13px', fontWeight: 500 }}>{t.assignedTo?.name || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: new Date(t.deadline) < new Date() && t.progress < 100 ? 'var(--error)' : 'var(--text-main)' }}>
                          {new Date(t.deadline) < new Date() && t.progress < 100 && <AlertCircle size={14} />}
                          <span style={{ fontSize: '13px', fontWeight: 500 }}>{new Date(t.deadline).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px', width: '38px' }}>{t.progress || 0}%</span>
                          <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--border)', borderRadius: '10px', overflow: 'hidden', minWidth: '60px' }}>
                            <div style={{ height: '100%', width: `${t.progress || 0}%`, backgroundColor: getProgressColor(t.progress || 0), transition: 'all 0.5s ease' }}></div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteTask(t._id)}
                          style={{ padding: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {tasks.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No tasks have been deployed yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card View (Mobile) */}
          <div className="task-mobile-cards">
            {tasks.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No tasks assigned.</div>
            ) : (
              tasks.map(t => (
                <div key={t._id} className="task-item-card animate-scale">
                  <div className="task-card-header">
                    <div style={{ minWidth: 0 }}>
                      <p className="task-card-title">{t.title}</p>
                      <div className="task-card-assignee">
                        <UserIcon size={12} />
                        <span>{t.assignedTo?.name || 'Unassigned'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(t._id)}
                      style={{ padding: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'none', borderRadius: '8px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p className="task-card-desc">
                    {t.description.substring(0, 100)}{t.description.length > 100 && '...'}
                  </p>

                  <div className="task-card-footer">
                    <div className="task-progress-container">
                      <div className="task-progress-info">
                        <div className="task-deadline">
                          Due: {new Date(t.deadline).toLocaleDateString()}
                          {new Date(t.deadline) < new Date() && t.progress < 100 && (
                            <span style={{ color: 'var(--error)', marginLeft: '8px' }}>Overdue</span>
                          )}
                        </div>
                        <span className="task-progress-percent" style={{ color: getProgressColor(t.progress || 0) }}>
                          {t.progress || 0}%
                        </span>
                      </div>
                      <div className="task-progress-bar-bg">
                        <div
                          className="task-progress-bar-fill"
                          style={{
                            width: `${t.progress || 0}%`,
                            backgroundColor: getProgressColor(t.progress || 0)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div >
  );
};

export default AdminTasksPage;

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Megaphone, Trash2, Plus, AlertTriangle, Info, Bell } from 'lucide-react';

const AdminNoticesPage: React.FC = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    priority: 'Medium'
  });

  const fetchNotices = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const res = await axios.get(`http://localhost:5000/api/admin/notices?t=${Date.now()}`, config);
      setNotices(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch Notices Error:', err);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.post('http://localhost:5000/api/admin/notices', noticeForm, config);
      alert('Notice published successfully!');
      setNoticeForm({ title: '', content: '', priority: 'Medium' });
      fetchNotices();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to publish notice');
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this notice?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete(`http://localhost:5000/api/admin/notices/${id}`, config);
      fetchNotices();
    } catch (err) {
      alert('Failed to delete notice');
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Urgent': return 'var(--error)';
      case 'High': return '#f59e0b';
      case 'Medium': return 'var(--primary)';
      case 'Low': return 'var(--text-muted)';
      default: return 'var(--primary)';
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading notices...</div>;

  return (
    <div>
      <header style={{ marginBottom: '40px' }}>
        <h1 className="responsive-h1" style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Notice Board</h1>
        <p style={{ color: 'var(--text-muted)' }}>Broadcast official company announcements to all employees.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '32px', alignItems: 'start' }}>

        {/* ADD NOTICE FORM */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Megaphone size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Compose Notice</h3>
          </div>

          <form onSubmit={handleAddNotice} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Title / Subject</label>
              <input
                type="text"
                value={noticeForm.title}
                onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                required
                placeholder="e.g. Office Maintenance, Holiday Update"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Priority Level</label>
              <select
                value={noticeForm.priority}
                onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)' }}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Urgent">Urgent / Critical</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Message Content</label>
              <textarea
                value={noticeForm.content}
                onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                placeholder="Write your announcement here..."
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', minHeight: '120px', resize: 'vertical' }}
                required
              />
            </div>
            <button
              type="submit"
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', backgroundColor: 'var(--primary)', color: 'white', padding: '12px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: '8px' }}
            >
              <Plus size={18} />
              Publish Notice
            </button>
          </form>
        </div>

        {/* ACTIVE NOTICES LIST */}
        <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '650px', overflowY: 'auto', paddingRight: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexShrink: 0 }}>
            <Megaphone size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Published Notices</h3>
          </div>
          {notices.map(n => (
            <div key={n._id} className="glass-card" style={{ padding: '16px 20px', borderLeft: `4px solid ${getPriorityColor(n.priority)}`, display: 'flex', alignItems: 'flex-start', gap: '16px', flexShrink: 0 }}>
              <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: `${getPriorityColor(n.priority)}15`, color: getPriorityColor(n.priority), flexShrink: 0 }}>
                {n.priority === 'Urgent' ? <Bell size={18} /> : (n.priority === 'High' ? <AlertTriangle size={18} /> : <Info size={18} />)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: getPriorityColor(n.priority) }}>{n.priority}</span>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</h4>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-main)', opacity: 0.8 }}>{n.content}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>{new Date(n.createdAt).toLocaleDateString()}</div>
                <button
                  onClick={() => handleDeleteNotice(n._id)}
                  style={{ padding: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {notices.length === 0 && (
            <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
              <Megaphone size={48} color="var(--border)" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-muted)' }}>No notices published.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminNoticesPage;

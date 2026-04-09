import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar as CalendarIcon, Trash2, Plus } from 'lucide-react';

const AdminHolidaysPage: React.FC = () => {
  const { user } = useAuth();
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [holidayForm, setHolidayForm] = useState({
    title: '',
    date: '',
    type: 'General'
  });

  const fetchHolidays = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const res = await axios.get(`http://localhost:5000/api/admin/holidays?t=${Date.now()}`, config);
      setHolidays(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch Holidays Error:', err);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.post('http://localhost:5000/api/admin/holidays', holidayForm, config);
      alert('Holiday deployed successfully!');
      setHolidayForm({ title: '', date: '', type: 'General' });
      fetchHolidays();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add holiday');
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this holiday?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete(`http://localhost:5000/api/admin/holidays/${id}`, config);
      fetchHolidays();
    } catch (err) {
      alert('Failed to delete holiday');
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading holidays...</div>;

  return (
    <div style={{ padding: '40px' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Holiday Calendar</h1>
          <p style={{ color: 'var(--text-muted)' }}>Declare public and corporate holidays for all employees.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        
        {/* ADD HOLIDAY FORM */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
             <CalendarIcon size={20} color="var(--primary)" />
             <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Declare Holiday</h3>
          </div>

          <form onSubmit={handleAddHoliday} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Holiday Title</label>
              <input 
                type="text" 
                value={holidayForm.title}
                onChange={(e) => setHolidayForm({ ...holidayForm, title: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} 
                required
                placeholder="e.g. Christmas Day, Diwali, etc."
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Holiday Date</label>
              <input 
                type="date" 
                value={holidayForm.date}
                onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} 
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Type</label>
              <select 
                value={holidayForm.type}
                onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)' }}
              >
                <option value="General">General (Public Holiday)</option>
                <option value="Restricted">Restricted Holiday</option>
                <option value="Company Event">Company Event / Retreat</option>
              </select>
            </div>
            <button 
              type="submit"
              className="pulse-dot"
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', backgroundColor: 'var(--primary)', color: 'white', padding: '12px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: '8px' }}
            >
              <Plus size={18} />
              Save Holiday
            </button>
          </form>
        </div>

        {/* HOLIDAY DIRECTORY */}
        <div className="glass-card" style={{ padding: '0', height: 'fit-content' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Upcoming Schedule</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px 24px' }}>Date</th>
                <th style={{ padding: '16px 24px' }}>Occasion</th>
                <th style={{ padding: '16px 24px' }}>Type</th>
                <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map(h => (
                <tr key={h._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, color: 'var(--primary)' }}>
                        <CalendarIcon size={16} />
                        {new Date(h.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                     </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ fontWeight: 600, fontSize: '15px' }}>{h.title}</span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ padding: '4px 10px', backgroundColor: h.type === 'Restricted' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: h.type === 'Restricted' ? 'var(--warning)' : 'var(--success)', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                       {h.type}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDeleteHoliday(h._id)}
                      style={{ padding: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {holidays.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No holidays declared yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default AdminHolidaysPage;

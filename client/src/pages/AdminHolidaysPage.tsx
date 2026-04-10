import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar as CalendarIcon, Trash2, Plus, X } from 'lucide-react';

const AdminHolidaysPage: React.FC = () => {
  const { user } = useAuth();
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [holidayForm, setHolidayForm] = useState({
    title: '',
    date: '',
    type: 'General'
  });

  const fetchHolidays = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const res = await axios.get(`/api/admin/holidays?t=${Date.now()}`, config);
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
      await axios.post('/api/admin/holidays', holidayForm, config);
      alert('Holiday deployed successfully!');
      setHolidayForm({ title: '', date: '', type: 'General' });
      setShowAddModal(false);
      fetchHolidays();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add holiday');
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this holiday?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete(`/api/admin/holidays/${id}`, config);
      fetchHolidays();
    } catch (err) {
      alert('Failed to delete holiday');
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading holidays...</div>;

  return (
    <div>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '1', minWidth: 0 }}>
          <h1 className="responsive-h1" style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Holiday Calendar</h1>
          <p style={{ color: 'var(--text-muted)' }}>Declare public and corporate holidays for all employees.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 102, 255, 0.2)' }}
        >
          <Plus size={20} />
          <span className="hide-mobile">Declare Holiday</span>
          <span className="show-mobile">Declare</span>
        </button>
      </header>

      {/* HOLIDAY DIRECTORY */}
      <div className="glass-card" style={{ padding: '0' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Upcoming Schedule</h3>
          <span style={{ fontSize: '12px', fontWeight: 800, backgroundColor: 'rgba(0,102,255,0.1)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px' }}>
            {holidays.length} Events
          </span>
        </div>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '340px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 8px', fontSize: '11px', width: '85px' }}>Date</th>
                <th style={{ padding: '12px 8px', fontSize: '11px' }}>Occasion</th>
                <th style={{ padding: '12px 8px', fontSize: '11px' }} className="hide-mobile">Type</th>
                <th style={{ padding: '12px 8px', fontSize: '11px', textAlign: 'right', width: '45px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map(h => (
                <tr key={h._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: 'var(--primary)', fontSize: '11px' }}>
                      <CalendarIcon size={12} />
                      {new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '12px' }}>{h.title}</span>
                  </td>
                  <td style={{ padding: '12px 8px' }} className="hide-mobile">
                    <span style={{ padding: '4px 8px', backgroundColor: h.type === 'Restricted' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: h.type === 'Restricted' ? '#f59e0b' : 'var(--success)', borderRadius: '20px', fontSize: '10px', fontWeight: 700 }}>
                      {h.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteHoliday(h._id)}
                      style={{ padding: '4px', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', transition: 'all 0.2s' }}
                      title="Remove Holiday"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {holidays.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <CalendarIcon size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                    <p>No holidays declared yet. Use the button above to add one.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD HOLIDAY MODAL */}
      {showAddModal && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="glass-card animate-scale" style={{ width: '100%', maxWidth: '400px', padding: '24px', boxSizing: 'border-box', marginTop: '-150px', marginLeft: '-40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(0,102,255,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarIcon size={24} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 800 }}>Declare Holiday</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddHoliday} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>Holiday Title</label>
                <input
                  type="text"
                  value={holidayForm.title}
                  onChange={(e) => setHolidayForm({ ...holidayForm, title: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'var(--surface-2)', fontSize: '15px' }}
                  required
                  placeholder="e.g. Diwali, Christmas"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>Holiday Date</label>
                <input
                  type="date"
                  value={holidayForm.date}
                  onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'var(--surface-2)', fontSize: '15px' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>Holiday Type</label>
                <select
                  value={holidayForm.type}
                  onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'var(--surface-2)', fontSize: '15px' }}
                >
                  <option value="General">General (Public Holiday)</option>
                  <option value="Restricted">Restricted Holiday</option>
                  <option value="Company Event">Company Event</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'transparent', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 2, backgroundColor: 'var(--primary)', color: 'white', padding: '14px', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 102, 255, 0.2)' }}
                >
                  Confirm & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )
      }
    </div >
  );
};

export default AdminHolidaysPage;

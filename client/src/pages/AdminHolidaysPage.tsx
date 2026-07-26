import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
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
      const res = await api.get(`/api/admin/holidays?t=${Date.now()}`);
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
      await api.post('/api/admin/holidays', holidayForm);
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
      await api.delete(`/api/admin/holidays/${id}`);
      fetchHolidays();
    } catch (err) {
      alert('Failed to delete holiday');
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading holidays...</div>;

  return (
    <div>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="responsive-h1" style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>Holiday Calendar</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Declare public and corporate holidays for all employees.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            backgroundColor: 'var(--primary)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px var(--primary-glow)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <Plus size={18} />
          <span className="hide-mobile">Declare Holiday</span>
          <span className="show-mobile">Declare</span>
        </button>
      </header>

      {/* HOLIDAY DIRECTORY */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Upcoming Schedule</h3>
          <span style={{ fontSize: '12px', fontWeight: 800, backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 14px', borderRadius: '20px' }}>
            {holidays.length} Events
          </span>
        </div>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--surface-2)' }}>
                <th style={{ padding: '14px 24px', width: '180px' }}>Date</th>
                <th style={{ padding: '14px 24px' }}>Occasion</th>
                <th style={{ padding: '14px 24px', width: '160px' }} className="hide-mobile">Type</th>
                <th style={{ padding: '14px 24px', textAlign: 'right', width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map(h => (
                <tr key={h._id} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--primary)', fontSize: '13px', background: 'var(--primary-light)', padding: '5px 12px', borderRadius: '8px' }}>
                      <CalendarIcon size={14} />
                      {new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>{h.title}</span>
                  </td>
                  <td style={{ padding: '16px 24px' }} className="hide-mobile">
                    <span style={{ padding: '4px 10px', backgroundColor: h.type === 'Restricted' ? 'var(--warning-light)' : 'var(--success-light)', color: h.type === 'Restricted' ? 'var(--warning)' : 'var(--success)', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                      {h.type}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteHoliday(h._id)}
                      style={{ padding: '6px 10px', borderRadius: '8px', background: 'var(--error-light)', border: 'none', color: 'var(--error)', cursor: 'pointer', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}
                      title="Remove Holiday"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {holidays.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <CalendarIcon size={40} style={{ marginBottom: '12px', opacity: 0.3, color: 'var(--primary)' }} />
                    <p style={{ fontWeight: 500, fontSize: '14px' }}>No holidays declared yet. Click "Declare Holiday" to add one.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD HOLIDAY MODAL */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
        >
          <div className="glass-card animate-scale" style={{ width: '100%', maxWidth: '440px', padding: '28px', boxSizing: 'border-box', background: 'var(--surface)', borderRadius: '20px', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarIcon size={22} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Declare Holiday</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddHoliday} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>Holiday Title</label>
                <input
                  type="text"
                  value={holidayForm.title}
                  onChange={(e) => setHolidayForm({ ...holidayForm, title: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'var(--surface-2)', fontSize: '14px', color: 'var(--text-main)', boxSizing: 'border-box' }}
                  required
                  placeholder="e.g. Diwali, Christmas, Republic Day"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>Holiday Date</label>
                <input
                  type="date"
                  value={holidayForm.date}
                  onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'var(--surface-2)', fontSize: '14px', color: 'var(--text-main)', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>Holiday Type</label>
                <select
                  value={holidayForm.type}
                  onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'var(--surface-2)', fontSize: '14px', color: 'var(--text-main)', boxSizing: 'border-box' }}
                >
                  <option value="General">General (Public Holiday)</option>
                  <option value="Restricted">Restricted Holiday</option>
                  <option value="Company Event">Company Event</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'transparent', fontWeight: 700, cursor: 'pointer', color: 'var(--text-main)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1.5, backgroundColor: 'var(--primary)', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px var(--primary-glow)' }}
                >
                  Confirm & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHolidaysPage;

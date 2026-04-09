import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar as CalendarIcon, Briefcase, PartyPopper } from 'lucide-react';

const HolidaysPage: React.FC = () => {
  const { user } = useAuth();
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHolidays = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const res = await axios.get(`http://localhost:5000/api/users/holidays?t=${Date.now()}`, config);
      setHolidays(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch Holidays Error:', err);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHolidays();
    const interval = setInterval(fetchHolidays, 10000); // Live sync every 10 seconds
    return () => clearInterval(interval);
  }, [fetchHolidays]);

  if (loading) return <div style={{ padding: '40px' }}>Loading holiday calendar...</div>;

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(0, 102, 255, 0.1)', color: 'var(--primary)', marginBottom: '16px' }}>
          <PartyPopper size={32} />
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Company Holidays</h1>
        <p style={{ color: 'var(--text-muted)' }}>Check out your upcoming designated days off and corporate events.</p>
      </header>

      <div style={{ display: 'grid', gap: '16px' }}>
        {holidays.map((h) => {
          const isPast = new Date(h.date) < new Date(new Date().setHours(0,0,0,0));
          return (
            <div 
              key={h._id} 
              className="glass-card" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '24px',
                opacity: isPast ? 0.6 : 1,
                borderLeft: isPast ? '4px solid var(--border)' : `4px solid ${h.type === 'Restricted' ? 'var(--warning)' : 'var(--primary)'}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '12px', 
                  backgroundColor: isPast ? 'var(--bg)' : 'rgba(0, 102, 255, 0.05)',
                  color: isPast ? 'var(--text-muted)' : 'var(--primary)'
                }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, lineHeight: 1 }}>{new Date(h.date).getDate()}</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>{new Date(h.date).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: isPast ? 'var(--text-muted)' : 'var(--text-main)' }}>{h.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                    <CalendarIcon size={14} />
                    {new Date(h.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
              
              <div style={{ padding: '6px 16px', backgroundColor: isPast ? 'var(--bg)' : (h.type === 'Restricted' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)'), color: isPast ? 'var(--text-muted)' : (h.type === 'Restricted' ? 'var(--warning)' : 'var(--success)'), borderRadius: '20px', fontSize: '13px', fontWeight: 700 }}>
                {isPast ? 'Passed' : h.type}
              </div>
            </div>
          );
        })}

        {holidays.length === 0 && (
          <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Briefcase size={48} color="var(--border)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>No Holidays Configured</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Your administration has not published the holiday calendar yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HolidaysPage;

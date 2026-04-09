import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, FileText, Clock } from 'lucide-react';

const LeavesPage: React.FC = () => {
  const { user } = useAuth();
  const [leaveBalance, setLeaveBalance] = useState<any>(null);
  const [providedBalance, setProvidedBalance] = useState<any>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [leaveForm, setLeaveForm] = useState({ type: 'Sick Leave', startDate: '', endDate: '', reason: '', description: '' });

  const fetchLeaveData = useCallback(async () => {
    try {
      const token = user?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // Adding ?t= timestamp to prevent caching
      const profileRes = await axios.get(`http://localhost:5000/api/users/profile?t=${Date.now()}`, config);
      setLeaveBalance(profileRes.data.leaveBalance);
      setProvidedBalance(profileRes.data.providedBalance);

      const leavesRes = await axios.get(`http://localhost:5000/api/users/leaves?t=${Date.now()}`, config);
      setLeaves(leavesRes.data);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    fetchLeaveData();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchLeaveData, 10000);

    return () => clearInterval(interval);
  }, [fetchLeaveData]);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.post('http://localhost:5000/api/users/leaves', leaveForm, config);
      alert('Leave application submitted successfully!');
      setLeaveForm({ type: 'Sick Leave', startDate: '', endDate: '', reason: '', description: '' });
      // Refresh leaves list
      const leavesRes = await axios.get('http://localhost:5000/api/users/leaves', config);
      setLeaves(leavesRes.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit leave application');
    }
  };

  return (
    <div style={{ padding: '40px' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Leave Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Check your leave balances and apply for new leaves.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => fetchLeaveData()} 
            style={{ 
              backgroundColor: 'var(--surface)', 
              color: 'var(--text-main)', 
              padding: '8px 16px', 
              borderRadius: '8px', 
              fontSize: '12px', 
              fontWeight: 600, 
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Clock size={16} /> Sync Now
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: 'var(--success)' }}>
            <div className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
            LIVE
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', width: 'fit-content', margin: '0 auto 12px' }}>
            <Calendar size={20} />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Sick Leave</p>
          <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--error)' }}>{leaveBalance?.sickLeave || 0}</h3>
        </div>
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', width: 'fit-content', margin: '0 auto 12px' }}>
            <FileText size={20} />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Earned Leave</p>
          <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>{leaveBalance?.earnedLeave || 0}</h3>
        </div>
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(0, 102, 255, 0.1)', color: 'var(--primary)', width: 'fit-content', margin: '0 auto 12px' }}>
            <Calendar size={20} />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>COFF</p>
          <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)' }}>{leaveBalance?.compensatoryOff || 0}</h3>
        </div>
        
        <div className="glass-card" style={{ textAlign: 'center', border: '1px solid var(--primary)' }}>
          <p style={{ color: 'var(--primary)', fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>Total Provided</p>
          <h3 style={{ fontSize: '28px', fontWeight: 700 }}>
            {providedBalance ? (providedBalance.sickLeave + providedBalance.earnedLeave + providedBalance.compensatoryOff) : 32}
          </h3>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', border: '1px solid var(--error)' }}>
          <p style={{ color: 'var(--error)', fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>Current Used</p>
          <h3 style={{ fontSize: '28px', fontWeight: 700 }}>
            {leaves.filter(l => l.status === 'Approved').reduce((acc, l) => {
              let count = 0;
              let d = new Date(l.startDate);
              const end = new Date(l.endDate);
              while (d <= end) { count++; d.setDate(d.getDate() + 1); }
              return acc + count;
            }, 0)}
          </h3>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', background: 'var(--primary)', color: 'white' }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '8px' }}>Total Remaining</p>
          <h3 style={{ fontSize: '28px', fontWeight: 700 }}>
            {(providedBalance ? (providedBalance.sickLeave + providedBalance.earnedLeave + providedBalance.compensatoryOff) : 32) - leaves.filter(l => l.status === 'Approved').reduce((acc, l) => {
              let count = 0;
              let d = new Date(l.startDate);
              const end = new Date(l.endDate);
              while (d <= end) { count++; d.setDate(d.getDate() + 1); }
              return acc + count;
            }, 0)}
          </h3>
        </div>
      </div>

      <div className="glass-card" style={{ maxWidth: '800px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Apply for Leave</h3>
        <form onSubmit={handleApplyLeave} style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-muted)' }}>Leave Type</label>
              <select 
                value={leaveForm.type}
                onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)' }}
              >
                <option>Sick Leave</option>
                <option>Earned Leave</option>
                <option>COFF</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-muted)' }}>From Date</label>
              <input 
                type="date" 
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} 
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-muted)' }}>To Date</label>
              <input 
                type="date" 
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} 
                required
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-muted)' }}>Description</label>
            <textarea 
              value={leaveForm.description}
              onChange={(e) => setLeaveForm({ ...leaveForm, description: e.target.value })}
              placeholder="Explain the reason in detail..."
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', minHeight: '80px', resize: 'vertical' }}
            />
          </div>
          <button 
            type="submit"
            style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '12px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: '8px' }}
          >
            Submit Leave Application
          </button>
        </form>
      </div>

      <div className="glass-card" style={{ marginTop: '40px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>My Leave Applications</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>Type</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>Start Date</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>End Date</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px', fontWeight: 500 }}>{l.type}</td>
                  <td style={{ padding: '16px' }}>{new Date(l.startDate).toLocaleDateString()}</td>
                  <td style={{ padding: '16px' }}>{new Date(l.endDate).toLocaleDateString()}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: 600,
                      backgroundColor: l.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : l.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: l.status === 'Approved' ? 'var(--success)' : l.status === 'Rejected' ? 'var(--error)' : 'var(--warning)'
                    }}>
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No leave applications found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeavesPage;

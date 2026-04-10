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
    <div style={{ padding: '0px' }}>
      <header className="page-header" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h1 className="responsive-h1" style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Leave Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Apply for time off and track your balances.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => fetchLeaveData()}
            style={{
              backgroundColor: 'var(--surface)',
              color: 'var(--text-main)',
              padding: '12px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 700,
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Clock size={16} /> Sync Now
          </button>
          <div className="status-pill status-pill--live">
            <div className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
            LIVE
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', width: 'fit-content', margin: '0 auto 12px' }}>
            <Calendar size={20} />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>Sick Leave</p>
          <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--error)' }}>{leaveBalance?.sickLeave || 0}</h3>
        </div>
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', width: 'fit-content', margin: '0 auto 12px' }}>
            <FileText size={20} />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>Earned Leave</p>
          <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--success)' }}>{leaveBalance?.earnedLeave || 0}</h3>
        </div>
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(0, 102, 255, 0.1)', color: 'var(--primary)', width: 'fit-content', margin: '0 auto 12px' }}>
            <Calendar size={20} />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>COFF</p>
          <h3 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>{leaveBalance?.compensatoryOff || 0}</h3>
        </div>

        <div className="glass-card" style={{ textAlign: 'center', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>Total Provided</p>
          <h3 style={{ fontSize: '32px', fontWeight: 800 }}>
            {providedBalance ? (providedBalance.sickLeave + providedBalance.earnedLeave + providedBalance.compensatoryOff) : 32}
          </h3>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', border: '1px solid var(--border)' }}>
          <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>Current Used</p>
          <h3 style={{ fontSize: '32px', fontWeight: 800 }}>
            {leaves.filter(l => l.status === 'Approved').reduce((acc, l) => {
              let count = 0;
              let d = new Date(l.startDate);
              const end = new Date(l.endDate);
              while (d <= end) { count++; d.setDate(d.getDate() + 1); }
              return acc + count;
            }, 0)}
          </h3>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', border: '1px solid var(--primary)', backgroundColor: 'rgba(0, 102, 255, 0.03)', boxShadow: 'inset 0 0 20px rgba(0, 102, 255, 0.05)' }}>
          <p style={{ color: 'var(--primary)', fontSize: '14px', marginBottom: '8px', fontWeight: 700 }}>Total Remaining</p>
          <h3 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--primary)' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))', gap: '40px', alignItems: 'start' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>Apply for Leave</h3>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>From Date</label>
                <input
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-main)', fontSize: '14px' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>To Date</label>
                <input
                  type="date"
                  value={leaveForm.endDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-main)', fontSize: '14px' }}
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

        <div className="glass-card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>My Leave Applications</h3>
          <div className="user-leave-table-container">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '16px' }}>Type</th>
                    <th style={{ padding: '16px' }}>Start Date</th>
                    <th style={{ padding: '16px' }}>End Date</th>
                    <th style={{ padding: '16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((l) => (
                    <tr key={l._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px', fontWeight: 600 }}>{l.type}</td>
                      <td style={{ padding: '16px', fontSize: '14px' }}>{new Date(l.startDate).toLocaleDateString()}</td>
                      <td style={{ padding: '16px', fontSize: '14px' }}>{new Date(l.endDate).toLocaleDateString()}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 700,
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

          {/* Mobile View: Cards */}
          <div className="user-leave-mobile-cards">
            {leaves.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No applications found.</div>
            ) : (
              leaves.map(l => (
                <div key={l._id} className="user-leave-item-card animate-scale">
                  <div className="user-leave-card-header">
                    <span className="user-leave-card-type">{l.type}</span>
                    <span className="user-leave-card-status" style={{
                      backgroundColor: l.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : l.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: l.status === 'Approved' ? 'var(--success)' : l.status === 'Rejected' ? 'var(--error)' : 'var(--warning)'
                    }}>
                      {l.status}
                    </span>
                  </div>

                  <div className="user-leave-card-dates">
                    <div className="user-leave-date-group">
                      <span className="user-leave-date-label">Start Date</span>
                      <span className="user-leave-date-value">{new Date(l.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="user-leave-date-group">
                      <span className="user-leave-date-label">End Date</span>
                      <span className="user-leave-date-value">{new Date(l.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    {l.description ? `"${l.description.substring(0, 60)}${l.description.length > 60 ? '...' : ''}"` : 'No description provided'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeavesPage;

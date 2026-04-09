import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Check, X } from 'lucide-react';

const AdminLeavesPage: React.FC = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalBalance, setGlobalBalance] = useState({ sickLeave: 12, earnedLeave: 15, compensatoryOff: 5 });

  const fetchLeaves = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      // Adding a timestamp ?t= to prevent browser caching
      const { data } = await axios.get(`http://localhost:5000/api/admin/leaves?t=${Date.now()}`, config);
      setLeaves(data);
      setLoading(false);
    } catch (err: any) {
      console.error('AdminLeavesPage Fetch Error:', err.response?.data || err.message);
      setLoading(false);
      if (err.response?.status === 401) {
        console.log('AdminLeavesPage: Unauthorized! Potential session issue.');
      }
    }
  }, [user]);

  useEffect(() => {
    fetchLeaves();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchLeaves, 5000);
    
    return () => clearInterval(interval);
  }, [fetchLeaves]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(`http://localhost:5000/api/admin/leaves/${id}`, { status }, config);
      alert(`Leave request ${status.toLowerCase()}ed`);
      fetchLeaves();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleGlobalUpdate = async () => {
    if (!window.confirm('Are you sure you want to update leave balances for ALL employees? This will override their current balances.')) return;
    
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.put('http://localhost:5000/api/admin/balances/global', globalBalance, config);
      alert(data.message);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update global balances');
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

  return (
    <div style={{ padding: '40px' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Leave Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Review and approve employee leave requests.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: 'var(--success)' }}>
          <div className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
          LIVE
        </div>
      </header>

      <div className="glass-card" style={{ marginBottom: '40px', border: '1px solid var(--primary)' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          Global Leave Allocation
          <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)', backgroundColor: 'var(--surface)', padding: '4px 10px', borderRadius: '10px' }}>Updates Everyone</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)' }}>Sick Leave</label>
            <input 
              type="number" 
              value={globalBalance.sickLeave}
              onChange={(e) => setGlobalBalance({ ...globalBalance, sickLeave: parseInt(e.target.value) })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)' }}>Earned Leave</label>
            <input 
              type="number" 
              value={globalBalance.earnedLeave}
              onChange={(e) => setGlobalBalance({ ...globalBalance, earnedLeave: parseInt(e.target.value) })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)' }}>COFF</label>
            <input 
              type="number" 
              value={globalBalance.compensatoryOff}
              onChange={(e) => setGlobalBalance({ ...globalBalance, compensatoryOff: parseInt(e.target.value) })}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
          </div>
          <button 
            onClick={handleGlobalUpdate}
            style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '12px', borderRadius: '8px', fontWeight: 600, height: '44px' }}
          >
            Apply to All Employees
          </button>
        </div>
      </div>

      <div className="glass-card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>Employee</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>Type</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>Duration</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>Description</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px' }}>
                    <p style={{ fontWeight: 600 }}>{l.user?.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{l.user?.employeeId}</p>
                  </td>
                  <td style={{ padding: '16px' }}>{l.type}</td>
                  <td style={{ padding: '16px' }}>
                    <p style={{ fontSize: '14px' }}>{l.startDate ? new Date(l.startDate).toLocaleDateString() : 'N/A'} -</p>
                    <p style={{ fontSize: '14px' }}>{l.endDate ? new Date(l.endDate).toLocaleDateString() : 'N/A'}</p>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ maxWidth: '200px', fontSize: '14px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.description}>
                      {l.description || '-'}
                    </div>
                  </td>
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
                  <td style={{ padding: '16px' }}>
                    {l.status === 'Pending' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleStatusUpdate(l._id, 'Approved')}
                          style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: 'none', cursor: 'pointer' }}
                          title="Approve"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(l._id, 'Rejected')}
                          style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'none', cursor: 'pointer' }}
                          title="Reject"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No actions</span>
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No leave requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminLeavesPage;

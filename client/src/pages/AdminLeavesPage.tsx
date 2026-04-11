import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Check, X } from 'lucide-react';

const AdminLeavesPage: React.FC = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalBalance, setGlobalBalance] = useState({ sickLeave: 12, earnedLeave: 15, compensatoryOff: 5 });

  const fetchLeaves = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/admin/leaves?t=${Date.now()}`);
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
      await api.put(`/api/admin/leaves/${id}`, { status });
      alert(`Leave request ${status.toLowerCase()}ed`);
      fetchLeaves();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleGlobalUpdate = async () => {
    if (!window.confirm('Are you sure you want to update leave balances for ALL employees? This will override their current balances.')) return;

    try {
      const { data } = await api.put('/api/admin/balances/global', globalBalance);
      alert(data.message);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update global balances');
    }
  };

  if (loading) return <div style={{ padding: 'var(--page-padding)' }}>Loading...</div>;

  return (
    <div>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1', minWidth: 0 }}>
          <h1 className="responsive-h1" style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Leave Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Review and approve employee leave requests.</p>
        </div>
        <div className="status-pill status-pill--live">
          <div className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
          LIVE
        </div>
      </header>

      <div className="glass-card" style={{ marginBottom: '40px', border: '1.5px solid var(--primary)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          Global Leave Allocation
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', backgroundColor: 'var(--surface)', padding: '4px 12px', borderRadius: '12px', textTransform: 'uppercase' }}>Affects All Employees</span>
        </h3>
        <div className="global-leave-grid">
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Sick Leave</label>
            <input
              type="number"
              value={globalBalance.sickLeave}
              onChange={(e) => setGlobalBalance({ ...globalBalance, sickLeave: parseInt(e.target.value) })}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Earned Leave</label>
            <input
              type="number"
              value={globalBalance.earnedLeave}
              onChange={(e) => setGlobalBalance({ ...globalBalance, earnedLeave: parseInt(e.target.value) })}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>COFF</label>
            <input
              type="number"
              value={globalBalance.compensatoryOff}
              onChange={(e) => setGlobalBalance({ ...globalBalance, compensatoryOff: parseInt(e.target.value) })}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)' }}
            />
          </div>
          <button
            onClick={handleGlobalUpdate}
            style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, height: '48px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 102, 255, 0.2)' }}
          >
            Update All Balances
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="leave-table-container" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
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

        {/* Mobile View: Cards */}
        <div className="leave-mobile-cards">
          {leaves.map((l) => (
            <div key={l._id} className="leave-card animate-scale">
              <div className="leave-card-header">
                <div>
                  <p className="leave-card-value">{l.user?.name}</p>
                  <p className="leave-card-label" style={{ marginTop: '2px' }}>{l.user?.employeeId}</p>
                </div>
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
              </div>

              <div className="leave-card-body">
                <div className="leave-card-item">
                  <span className="leave-card-label">Type</span>
                  <span className="leave-card-value">{l.type}</span>
                </div>
                <div className="leave-card-item">
                  <span className="leave-card-label">Duration</span>
                  <span className="leave-card-value">
                    {l.startDate ? new Date(l.startDate).toLocaleDateString() : 'N/A'} - {l.endDate ? new Date(l.endDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="leave-card-item" style={{ gridColumn: 'span 2' }}>
                  <span className="leave-card-label">Description</span>
                  <p className="leave-card-value" style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '13px' }}>
                    {l.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {l.status === 'Pending' && (
                <div className="leave-card-actions">
                  <button
                    onClick={() => handleStatusUpdate(l._id, 'Approved')}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--success-light)', color: 'var(--success)', fontWeight: 700 }}
                  >
                    <Check size={18} /> Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(l._id, 'Rejected')}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--error-light)', color: 'var(--error)', fontWeight: 700 }}
                  >
                    <X size={18} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
          {leaves.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No leave requests found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLeavesPage;

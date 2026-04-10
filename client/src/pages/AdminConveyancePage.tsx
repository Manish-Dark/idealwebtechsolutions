import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Car, Coffee, Utensils, ShoppingBag, Search, Users } from 'lucide-react';

const AdminConveyancePage: React.FC = () => {
  const { user } = useAuth();
  const [conveyances, setConveyances] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchData = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const [conRes, empRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/conveyance', config),
        axios.get('http://localhost:5000/api/admin/users', config)
      ]);
      setConveyances(conRes.data);
      setEmployees(empRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleStatusChange = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put(`http://localhost:5000/api/admin/conveyance/${id}`, { status }, config);
      alert(`Claim ${status} successfully!`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to update status`);
    }
  };

  const filteredEmployees = employees.filter(e =>
    (e.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (e.employeeId?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredClaims = conveyances.filter(c => {
    if (selectedUserId && String(c.user?._id) !== String(selectedUserId)) return false;

    const search = searchTerm.toLowerCase();
    const matchesSearch = (c.user?.name?.toLowerCase() || '').includes(search) ||
      (c.siteProjectName?.toLowerCase() || '').includes(search) ||
      (c.user?.employeeId?.toLowerCase() || '').includes(search);
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

  return (
    <div>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: 0 }}>
          <h1 className="responsive-h1" style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Conveyance Claims</h1>
          <p style={{ color: 'var(--text-muted)' }}>Review and process employee expense claims.</p>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', width: '100%', maxWidth: 'max-content' }} className="admin-header-actions">
          <div style={{ position: 'relative', flex: '1', minWidth: '0' }} className="admin-search-bar">
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search employee or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '14px' }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)', fontWeight: 600, fontSize: '14px', flex: '0 0 auto', cursor: 'pointer' }}
          >
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '40px', alignItems: 'start' }}>
        {/* Top/Left Pane: Employee List */}
        <div className="glass-card employee-selection-pane" style={{ padding: '24px', maxHeight: '300px', overflowY: 'visible', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Employees</h3>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', backgroundColor: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
              {filteredEmployees.length}
            </span>
          </div>

          <div className="custom-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '20px' }}>
            <div
              onClick={() => setSelectedUserId(null)}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                backgroundColor: selectedUserId === null ? 'var(--primary)' : 'var(--surface)',
                color: selectedUserId === null ? 'white' : 'var(--text-main)',
                fontWeight: 700,
                transition: 'all 0.2s ease',
                border: selectedUserId === null ? 'none' : '1px solid var(--border)',
                whiteSpace: 'nowrap',
                fontSize: '13px'
              }}
            >
              All History
            </div>

            {filteredEmployees.map(u => (
              <div
                key={u._id}
                onClick={() => setSelectedUserId(u._id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: selectedUserId === u._id ? 'rgba(0, 102, 255, 0.1)' : 'var(--surface)',
                  color: selectedUserId === u._id ? 'var(--primary)' : 'var(--text-main)',
                  transition: 'all 0.2s ease',
                  border: '1px solid',
                  borderColor: selectedUserId === u._id ? 'rgba(0, 102, 255, 0.3)' : 'var(--border)',
                  whiteSpace: 'nowrap',
                  fontSize: '13px'
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: selectedUserId === u._id ? 'var(--primary)' : 'rgba(0,0,0,0.05)', color: selectedUserId === u._id ? 'white' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                  {(u.name || 'E').charAt(0)}
                </div>
                <span style={{ fontWeight: 600 }}>{u.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Pane: Claims Table */}
        <div className="glass-card table-wrap" style={{ padding: '0', height: 'fit-content' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '16px 24px' }}>Employee</th>
                  <th style={{ padding: '16px 24px' }}>Date / Category</th>
                  <th style={{ padding: '16px 24px' }}>Site & Details</th>
                  <th style={{ padding: '16px 24px' }}>Amount</th>
                  <th style={{ padding: '16px 24px' }}>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map((c) => (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 700 }}>
                          {c.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '14px' }}>{c.user?.name}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>#{c.user?.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 600 }}>{new Date(c.date).toLocaleDateString()}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {c.expenseType === 'Travel' && <Car size={14} />}
                        {c.expenseType === 'Lunch' && <Coffee size={14} />}
                        {c.expenseType === 'Dinner' && <Utensils size={14} />}
                        {c.expenseType === 'Local Purchase' && <ShoppingBag size={14} />}
                        <span>{c.expenseType}</span>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 600 }}>{c.siteProjectName}</p>
                      {c.expenseType === 'Travel' ? (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {c.travelFrom} → {c.travelTo} via {c.transportMedium}
                        </p>
                      ) : (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.description || 'No description'}
                        </p>
                      )}
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <p style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-main)' }}>₹{c.amount?.toLocaleString()}</p>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{
                        backgroundColor: c.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : c.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: c.status === 'Approved' ? 'var(--success)' : c.status === 'Pending' ? '#f59e0b' : 'var(--error)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      {c.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleStatusChange(c._id, 'Approved')}
                            style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: 'none', cursor: 'pointer' }}
                            title="Approve"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleStatusChange(c._id, 'Rejected')}
                            style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'none', cursor: 'pointer' }}
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredClaims.length === 0 && <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No claims found for the selected criteria.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConveyancePage;

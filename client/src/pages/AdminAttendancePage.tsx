import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Search, Calendar, Users, Activity, AlertTriangle } from 'lucide-react';

const AdminAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    try {
      const [attRes, usersRes] = await Promise.all([
        api.get(`/api/admin/attendance?t=${Date.now()}`),
        api.get(`/api/admin/users?t=${Date.now()}`)
      ]);

      console.log(`[AdminAttendance] Fetched ${usersRes.data.length} users and ${attRes.data.length} records.`);
      setAttendance(attRes.data);
      setUsers(usersRes.data);
      setError(null);
      setLoading(false);
    } catch (err: any) {
      console.error('Fetch Admin Data Error:', err);
      setError(err.response?.data?.message || 'Failed to connect to the server. Please check your connection.');
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 10000); // Unified refresh: Every 10 seconds
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const calculateHours = (cin: string, cout: string) => {
    if (!cin || !cout) return '---';
    const diff = new Date(cout).getTime() - new Date(cin).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  // Sidebar List: Filter purely by search term
  const employeeList = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAttendance = attendance.filter(record => {
    // Selection Filter: Robust ID comparison
    if (selectedUserId) {
      const recordUserId = record.user?._id || record.user;
      if (String(recordUserId) !== String(selectedUserId)) return false;
    }

    // Search Filter: Check name or ID
    const userName = record.user?.name || "Unknown User";
    const empId = record.user?.employeeId || "N/A";

    return userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center' }}>
      <Activity className="pulse-dot" size={32} color="var(--primary)" style={{ marginBottom: '16px' }} />
      <p style={{ color: 'var(--text-muted)' }}>Synching attendance data...</p>
    </div>
  );

  return (
    <div>
      {error && (
        <div style={{ padding: '16px 24px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <AlertTriangle size={20} />
          <p style={{ fontWeight: 600 }}>{error}</p>
        </div>
      )}

      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: 0 }}>
          <h1 className="responsive-h1" style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Attendance Monitor</h1>
          <p style={{ color: 'var(--text-muted)' }}>Track employee check-ins and live locations.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', width: '100%', maxWidth: 'max-content' }} className="admin-header-actions">
          <div style={{ position: 'relative', flex: '1', minWidth: '0' }} className="admin-search-bar">
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '14px' }}
            />
          </div>
          <button
            onClick={fetchAllData}
            style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Refresh Data"
          >
            <Activity size={18} />
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px', alignItems: 'start' }}>
        {/* Top/Left Pane: Employee List */}
        <div className="glass-card employee-selection-pane" style={{ padding: '24px', maxHeight: '300px', overflowY: 'visible', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Employees</h3>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', backgroundColor: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
              {employeeList.length}
            </span>
          </div>

          <div className="custom-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '20px', marginBottom: '10px' }}>
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

            {employeeList.map(u => (
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
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: selectedUserId === u._id ? 'var(--primary)' : 'rgba(0,0,0,0.05)', color: selectedUserId === u._id ? 'white' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                  {(u.name || 'E').charAt(0)}
                </div>
                <span style={{ fontWeight: 600 }}>{u.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Pane: Attendance Table */}
        <div className="glass-card table-wrap custom-scrollbar" style={{ padding: '0', maxHeight: '550px', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px 24px' }}>Employee</th>
                <th style={{ padding: '16px 24px' }}>Date</th>
                <th style={{ padding: '16px 24px' }}>Check In</th>
                <th style={{ padding: '16px 24px' }}>Check Out</th>
                <th style={{ padding: '16px 24px' }}>Hours</th>
                <th style={{ padding: '16px 24px' }}>Location</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((record) => (
                <tr key={record._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>
                        {(record.user?.name || 'E').charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600 }}>{record.user?.name}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>#{record.user?.employeeId || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} color="var(--text-muted)" />
                      {new Date(record.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--success)', fontSize: '14px', fontWeight: 600 }}>
                    {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--error)', fontSize: '14px', fontWeight: 600 }}>
                    {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Still Working'}
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 700, fontSize: '14px' }}>
                    {calculateHours(record.checkIn, record.checkOut)}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {typeof record.location?.lat === 'number' && typeof record.location?.lng === 'number' ? (
                      <a
                        href={`https://www.google.com/maps?q=${record.location.lat},${record.location.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: 'var(--primary)',
                          textDecoration: 'none',
                          fontSize: '13px',
                          backgroundColor: 'rgba(0, 102, 255, 0.08)',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          width: 'fit-content',
                          fontWeight: 600
                        }}
                      >
                        <MapPin size={14} />
                        View Map ({record.location.lat.toFixed(4)}, {record.location.lng.toFixed(4)})
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontStyle: 'italic' }}>No GPS Data</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredAttendance.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No attendance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendancePage;

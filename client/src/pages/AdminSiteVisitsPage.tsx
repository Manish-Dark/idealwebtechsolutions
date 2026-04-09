import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Building2, User, ArrowRight, Search, Users } from 'lucide-react';

const AdminSiteVisitsPage: React.FC = () => {
  const { user } = useAuth();
  const [visits, setVisits] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const [visitsRes, empRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/site-visits', config),
        axios.get('http://localhost:5000/api/admin/users', config)
      ]);
      setVisits(visitsRes.data);
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

  const filteredEmployees = employees.filter(e => 
    (e.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (e.employeeId?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredVisits = visits.filter(v => {
    if (selectedUserId && String(v.user?._id) !== String(selectedUserId)) return false;
    
    const search = searchTerm.toLowerCase();
    return (v.user?.name?.toLowerCase() || '').includes(search) || 
           (v.customer?.name?.toLowerCase() || '').includes(search) || 
           (v.customer?.company?.toLowerCase() || '').includes(search) || 
           (v.user?.employeeId?.toLowerCase() || '').includes(search);
  });

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

  return (
    <div style={{ padding: '40px' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Site Visit Logs</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor all employee site visits and client interactions.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by name, ID or customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)' }}
            />
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px' }}>
        {/* Left Pane: Employee List */}
        <div className="glass-card" style={{ padding: '24px', height: 'calc(100vh - 200px)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Users size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Employees</h3>
             </div>
             <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
               {filteredEmployees.length}
             </span>
          </div>
          
          <div 
            onClick={() => setSelectedUserId(null)}
            style={{ 
              padding: '12px 16px', 
              borderRadius: '12px', 
              cursor: 'pointer',
              backgroundColor: selectedUserId === null ? 'var(--primary)' : 'var(--surface)',
              color: selectedUserId === null ? 'white' : 'var(--text-main)',
              fontWeight: selectedUserId === null ? 700 : 600,
              transition: 'all 0.2s ease',
              marginBottom: '12px',
              textAlign: 'center',
              border: selectedUserId === null ? 'none' : '1px solid var(--border)',
              flexShrink: 0
            }}
          >
            All Visit Logs
          </div>

          <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
            {filteredEmployees.map(u => (
              <div 
                key={u._id}
                onClick={() => setSelectedUserId(u._id)}
                style={{ 
                  padding: '12px 16px', 
                  borderRadius: '12px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: selectedUserId === u._id ? 'rgba(0, 102, 255, 0.1)' : 'transparent',
                  color: selectedUserId === u._id ? 'var(--primary)' : 'var(--text-main)',
                  transition: 'all 0.2s ease',
                  border: '1px solid',
                  borderColor: selectedUserId === u._id ? 'rgba(0, 102, 255, 0.3)' : 'transparent'
                }}
              >
                 <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: selectedUserId === u._id ? 'var(--primary)' : 'var(--surface)', color: selectedUserId === u._id ? 'white' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>
                     {(u.name || 'E').charAt(0)}
                 </div>
                 <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: selectedUserId === u._id ? 700 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>{u.designation || u.role} | #{u.employeeId}</p>
                 </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Visits Table */}
        <div className="glass-card" style={{ padding: '0', height: 'fit-content' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '16px 24px' }}>Employee</th>
                  <th style={{ padding: '16px 24px' }}>Date / Customer</th>
                  <th style={{ padding: '16px 24px' }}>Contact Details</th>
                  <th style={{ padding: '16px 24px' }}>Work Summary</th>
                  <th style={{ padding: '16px 24px' }}>Follow-up</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisits.map((v) => (
                  <tr key={v._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(0, 102, 255, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                          {v.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '14px' }}>{v.user?.name}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: #{v.user?.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 700 }}>{new Date(v.date).toLocaleDateString()}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <Building2 size={13} color="var(--primary)" />
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{v.customer?.name} ({v.customer?.company})</span>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                         <User size={14} color="var(--text-muted)" />
                         <span style={{ fontSize: '13px', fontWeight: 600 }}>{v.contactPersonName}</span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '22px' }}>{v.contactPersonDesignation} | {v.contactPersonMobile}</p>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <p style={{ fontSize: '13px', maxWidth: '250px', lineHeight: '1.4' }}>
                        {v.workDescription}
                      </p>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      {v.nextAction ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
                          <ArrowRight size={14} />
                          {v.nextAction}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredVisits.length === 0 && <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No site visits found for the selected criteria.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSiteVisitsPage;

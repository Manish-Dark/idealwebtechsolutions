import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, X, MapPin, Building2, User, Phone, Briefcase, FileText, Calendar, ArrowRight } from 'lucide-react';

const SiteVisitsPage: React.FC = () => {
  const { user } = useAuth();
  const [visits, setVisits] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    date: new Date().toISOString().split('T')[0],
    contactPersonType: 'Manual', // Selection or Manual
    contactPersonName: '',
    contactPersonMobile: '',
    contactPersonDesignation: '',
    workDescription: '',
    nextAction: ''
  });

  const fetchData = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const [visitsRes, customersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users/site-visits', config),
        axios.get('http://localhost:5000/api/users/customers', config)
      ]);
      setVisits(visitsRes.data);
      setCustomers(customersRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCustomerSelect = (customerId: string) => {
    const selected = customers.find(c => c._id === customerId);
    setFormData({
      ...formData,
      customer: customerId,
      // Default to Manual but if Selection chosen later it will use this
      contactPersonName: selected?.name || '',
      contactPersonMobile: selected?.phone || '',
    });
  };

  const handleContactTypeChange = (type: string) => {
    const selected = customers.find(c => c._id === formData.customer);
    setFormData({
      ...formData,
      contactPersonType: type,
      contactPersonName: type === 'Selection' ? (selected?.name || '') : '',
      contactPersonMobile: type === 'Selection' ? (selected?.phone || '') : '',
      contactPersonDesignation: type === 'Selection' ? 'Primary Contact' : '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer) {
      alert('Please select a customer');
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.post('http://localhost:5000/api/users/site-visit', formData, config);
      alert('Site visit logged successfully!');
      setShowAddModal(false);
      setFormData({
        customer: '',
        date: new Date().toISOString().split('T')[0],
        contactPersonType: 'Manual',
        contactPersonName: '',
        contactPersonMobile: '',
        contactPersonDesignation: '',
        workDescription: '',
        nextAction: ''
      });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to log visit');
    }
  };

  // Stats
  const totalVisits = visits.length;
  const recentVisits = visits.filter(v => {
    const d = new Date(v.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const pendingFollowUps = visits.filter(v => v.nextAction).length;

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

  return (
    <div style={{ padding: '40px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Site Visit Logs</h1>
          <p style={{ color: 'var(--text-muted)' }}>Document your client meetings and site inspections.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <Plus size={20} />
          Log New Visit
        </button>
      </header>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(0, 102, 255, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <MapPin size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Total Visits</p>
            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>{totalVisits}</h2>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
            <Calendar size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>This Month</p>
            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>{recentVisits}</h2>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
            <ArrowRight size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Follow-ups</p>
            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>{pendingFollowUps}</h2>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="glass-card" style={{ padding: '0' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Recent Visit Logs</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px 24px' }}>Date / Customer</th>
                <th style={{ padding: '16px 24px' }}>Contact Person</th>
                <th style={{ padding: '16px 24px' }}>Work Description</th>
                <th style={{ padding: '16px 24px' }}>Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((v) => (
                <tr key={v._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{new Date(v.date).toLocaleDateString()}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <Building2 size={14} color="var(--primary)" />
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{v.customer?.name} ({v.customer?.company})</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 600 }}>{v.contactPersonName}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{v.contactPersonDesignation} | {v.contactPersonMobile}</p>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <p style={{ fontSize: '13px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={v.workDescription}>
                      {v.workDescription}
                    </p>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {v.nextAction ? (
                      <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600, backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
                        {v.nextAction}
                      </span>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>None</span>
                    )}
                  </td>
                </tr>
              ))}
              {visits.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    <div style={{ marginBottom: '16px', opacity: 0.5 }}><MapPin size={40} /></div>
                    <p>No site visits logged yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Visit Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '650px', margin: '20px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MapPin size={24} color="var(--primary)" />
                <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Log Site Visit</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
               <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Select Customer</label>
                    <select 
                      required 
                      value={formData.customer} 
                      onChange={(e) => handleCustomerSelect(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)' }}
                    >
                      <option value="">Choose a customer...</option>
                      {customers.map(c => (
                        <option key={c._id} value={c._id}>{c.name} ({c.company})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Visit Date</label>
                    <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)' }} />
                  </div>
               </div>

               <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Contact Person Details</h4>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        type="button"
                        onClick={() => handleContactTypeChange('Selection')}
                        style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--primary)', backgroundColor: formData.contactPersonType === 'Selection' ? 'var(--primary)' : 'transparent', color: formData.contactPersonType === 'Selection' ? 'white' : 'var(--primary)', cursor: 'pointer' }}
                      >
                        Existing
                      </button>
                      <button 
                         type="button"
                         onClick={() => handleContactTypeChange('Manual')}
                         style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--primary)', backgroundColor: formData.contactPersonType === 'Manual' ? 'var(--primary)' : 'transparent', color: formData.contactPersonType === 'Manual' ? 'white' : 'var(--primary)', cursor: 'pointer' }}
                      >
                        Manual
                      </button>
                    </div>
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', color: 'var(--text-muted)' }}>Name</label>
                      <div style={{ position: 'relative' }}>
                        <User size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                        <input type="text" required value={formData.contactPersonName} onChange={(e) => setFormData({...formData, contactPersonName: e.target.value})} readOnly={formData.contactPersonType === 'Selection'} style={{ width: '100%', padding: '8px 8px 8px 32px', borderRadius: '8px', border: '1px solid var(--border)', background: formData.contactPersonType === 'Selection' ? 'rgba(255,255,255,0.05)' : 'var(--surface)' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', color: 'var(--text-muted)' }}>Mobile</label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                        <input type="text" required value={formData.contactPersonMobile} onChange={(e) => setFormData({...formData, contactPersonMobile: e.target.value})} readOnly={formData.contactPersonType === 'Selection'} style={{ width: '100%', padding: '8px 8px 8px 32px', borderRadius: '8px', border: '1px solid var(--border)', background: formData.contactPersonType === 'Selection' ? 'rgba(255,255,255,0.05)' : 'var(--surface)' }} />
                      </div>
                    </div>
                 </div>
                 <div style={{ marginTop: '16px' }}>
                    <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', color: 'var(--text-muted)' }}>Designation</label>
                    <div style={{ position: 'relative' }}>
                      <Briefcase size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                      <input type="text" required value={formData.contactPersonDesignation} onChange={(e) => setFormData({...formData, contactPersonDesignation: e.target.value})} readOnly={formData.contactPersonType === 'Selection'} style={{ width: '100%', padding: '8px 8px 8px 32px', borderRadius: '8px', border: '1px solid var(--border)', background: formData.contactPersonType === 'Selection' ? 'rgba(255,255,255,0.05)' : 'var(--surface)' }} />
                    </div>
                 </div>
               </div>

               <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Work Done Description</label>
                <div style={{ position: 'relative' }}>
                  <FileText size={16} style={{ position: 'absolute', left: '12px', top: '12px', opacity: 0.5 }} />
                  <textarea rows={3} required value={formData.workDescription} onChange={(e) => setFormData({...formData, workDescription: e.target.value})} placeholder="Describe exactly what work/discussion happened..." style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '10px', border: '1px solid var(--border)', resize: 'none' }} />
                </div>
               </div>

               <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Next Action / Follow-up (Optional)</label>
                <input type="text" value={formData.nextAction} onChange={(e) => setFormData({...formData, nextAction: e.target.value})} placeholder="What needs to happen next?" style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)' }} />
               </div>

               <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '16px', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 12px rgba(0, 102, 255, 0.3)' }}>
                 Submit Site Visit Log
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteVisitsPage;

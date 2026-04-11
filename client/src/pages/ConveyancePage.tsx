import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, X, CheckCircle, Clock, AlertCircle, DollarSign, Navigation, Car, Coffee, Utensils, ShoppingBag, MoreHorizontal, Calendar } from 'lucide-react';

const ConveyancePage: React.FC = () => {
  const { user } = useAuth();
  const [conveyances, setConveyances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    expenseType: 'Travel',
    siteProjectName: '',
    amount: '',
    description: '',
    travelFrom: '',
    travelTo: '',
    transportMedium: 'Taxi'
  });

  const fetchConveyances = useCallback(async () => {
    try {
      const { data } = await api.get('/api/users/conveyance');
      setConveyances(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConveyances();
    const interval = setInterval(fetchConveyances, 15000);
    return () => clearInterval(interval);
  }, [fetchConveyances]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/users/conveyance', formData);
      alert('Claim submitted successfully!');
      setShowAddModal(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        expenseType: 'Travel',
        siteProjectName: '',
        amount: '',
        description: '',
        travelFrom: '',
        travelTo: '',
        transportMedium: 'Taxi'
      });
      fetchConveyances();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit claim');
    }
  };

  // Dashboard Stats
  const totalClaims = conveyances.length;
  const pendingClaims = conveyances.filter(c => c.status === 'Pending').length;
  const approvedClaims = conveyances.filter(c => c.status === 'Approved').length;
  const totalApprovedAmount = conveyances
    .filter(c => c.status === 'Approved')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

  return (
    <div style={{ padding: '0px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 className="responsive-h1" style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Conveyance Claims</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage and track your expense reimbursements.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 102, 255, 0.2)' }}
        >
          <Plus size={20} />
          Add New Claim
        </button>
      </header>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(0, 102, 255, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Navigation size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Total Claims</p>
            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>{totalClaims}</h2>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Pending</p>
            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>{pendingClaims}</h2>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Approved</p>
            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>{approvedClaims}</h2>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(0, 102, 255, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Total Amount</p>
            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>₹{totalApprovedAmount.toLocaleString()}</h2>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="glass-card" style={{ padding: '0' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Claim History</h3>
        </div>
        <div className="conv-table-container">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '16px 24px' }}>Date</th>
                  <th style={{ padding: '16px 24px' }}>Category</th>
                  <th style={{ padding: '16px 24px' }}>Site/Project</th>
                  <th style={{ padding: '16px 24px' }}>Amount</th>
                  <th style={{ padding: '16px 24px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {conveyances.map((c) => (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px', fontSize: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={14} color="var(--text-muted)" />
                        {new Date(c.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        {c.expenseType === 'Travel' && <Car size={16} color="var(--primary)" />}
                        {c.expenseType === 'Lunch' && <Coffee size={16} color="#f59e0b" />}
                        {c.expenseType === 'Dinner' && <Utensils size={16} color="#ef4444" />}
                        {c.expenseType === 'Local Purchase' && <ShoppingBag size={16} color="#8b5cf6" />}
                        {c.expenseType === 'Other' && <MoreHorizontal size={16} color="var(--text-muted)" />}
                        <span style={{ fontWeight: 600 }}>{c.expenseType}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 500 }}>{c.siteProjectName}</p>
                      {c.expenseType === 'Travel' && (
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {c.travelFrom} → {c.travelTo} ({c.transportMedium})
                        </p>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 700 }}>₹{c.amount?.toLocaleString()}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        backgroundColor: c.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : c.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: c.status === 'Approved' ? 'var(--success)' : c.status === 'Pending' ? '#f59e0b' : 'var(--error)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {conveyances.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                      <AlertCircle size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                      <p>No claims found. Submit your first expense!</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile View: Conveyance Cards */}
        <div className="conv-mobile-cards">
          {conveyances.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <AlertCircle size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p>No claims found. Submit your first expense!</p>
            </div>
          ) : (
            conveyances.map((c) => (
              <div key={c._id} className="conv-item-card animate-scale">
                <div className="conv-card-header">
                  <div className="conv-card-category">
                    {c.expenseType === 'Travel' && <Car size={20} color="var(--primary)" />}
                    {c.expenseType === 'Lunch' && <Coffee size={20} color="#f59e0b" />}
                    {c.expenseType === 'Dinner' && <Utensils size={20} color="#ef4444" />}
                    {c.expenseType === 'Local Purchase' && <ShoppingBag size={20} color="#8b5cf6" />}
                    {c.expenseType === 'Other' && <MoreHorizontal size={20} color="var(--text-muted)" />}
                    <span>{c.expenseType}</span>
                  </div>
                  <span className="conv-card-status" style={{
                    backgroundColor: c.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : c.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: c.status === 'Approved' ? 'var(--success)' : c.status === 'Pending' ? '#f59e0b' : 'var(--error)'
                  }}>
                    {c.status}
                  </span>
                </div>

                <div className="conv-card-info">
                  <div className="conv-info-row">
                    <span className="conv-info-label">Date</span>
                    <span className="conv-info-value">{new Date(c.date).toLocaleDateString()}</span>
                  </div>
                  <div className="conv-info-row">
                    <span className="conv-info-label">Project</span>
                    <span className="conv-info-value">{c.siteProjectName}</span>
                  </div>
                </div>

                {c.expenseType === 'Travel' && (
                  <div className="conv-travel-detail">
                    <div className="conv-travel-path">
                      <Navigation size={14} />
                      <span>{c.travelFrom} → {c.travelTo}</span>
                    </div>
                    <div className="conv-travel-medium">Medium: {c.transportMedium}</div>
                  </div>
                )}

                {c.description && (
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '20px' }}>
                    "{c.description}"
                  </div>
                )}

                <div className="conv-card-footer">
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Claim Amount</span>
                  <span className="conv-card-amount">₹{c.amount?.toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Claim Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', margin: '20px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Submit New Claim</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Date</label>
                  <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-main)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Expense Type</label>
                  <select value={formData.expenseType} onChange={(e) => setFormData({ ...formData, expenseType: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
                    <option>Travel</option>
                    <option>Lunch</option>
                    <option>Dinner</option>
                    <option>Local Purchase</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Site/Project Name</label>
                <input type="text" required value={formData.siteProjectName} onChange={(e) => setFormData({ ...formData, siteProjectName: e.target.value })} placeholder="Enter Project Name" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-main)' }} />
              </div>

              {formData.expenseType === 'Travel' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>From</label>
                      <input type="text" required value={formData.travelFrom} onChange={(e) => setFormData({ ...formData, travelFrom: e.target.value })} placeholder="Pickup Location" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-main)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>To</label>
                      <input type="text" required value={formData.travelTo} onChange={(e) => setFormData({ ...formData, travelTo: e.target.value })} placeholder="Destination" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-main)' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Transport Medium</label>
                    <select value={formData.transportMedium} onChange={(e) => setFormData({ ...formData, transportMedium: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
                      <option>Taxi</option>
                      <option>Bus</option>
                      <option>Metro</option>
                      <option>Ola</option>
                      <option>Rapido</option>
                      <option>Uber</option>
                      <option>Own Vehicle</option>
                      <option>Train</option>
                      <option>Other</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Amount (₹)</label>
                <input type="number" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-main)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}>Description (Optional)</label>
                <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Enter claim details..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', resize: 'none', background: 'var(--bg)', color: 'var(--text-main)' }} />
              </div>

              <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '14px', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: '10px' }}>
                Submit Claim Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConveyancePage;

import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Trash2, Users, Building2, Phone, Mail, Edit2, X } from 'lucide-react';

const AdminCustomersPage: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    notes: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await api.get(`/api/admin/customers?t=${Date.now()}`);
      setCustomers(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch Customers Error:', err);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleEditClick = (customer: any) => {
    setIsEditing(true);
    setEditingCustomerId(customer._id);
    setCustomerForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
      address: customer.address || '',
      notes: customer.notes || ''
    });
    // Optional: Scroll to form
    const formElement = document.getElementById('customer-form');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingCustomerId(null);
    setCustomerForm({ name: '', email: '', phone: '', company: '', address: '', notes: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/api/admin/customers/${editingCustomerId}`, customerForm);
        alert('Customer updated successfully!');
      } else {
        await api.post('/api/admin/customers', customerForm);
        alert('Customer added successfully!');
      }
      handleCancelEdit();
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save customer');
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.delete(`/api/admin/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      alert('Failed to delete customer');
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading customers...</div>;

  return (
    <div>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ flex: '1', minWidth: 0 }}>
          <h1 className="responsive-h1" style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Customer Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage external clients and company relationships.</p>
        </div>
        <div className="status-pill status-pill--live">
          <div className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
          LIVE
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px', alignItems: 'start' }}>

        {/* ADD CUSTOMER FORM */}
        <div className="glass-card" style={{ height: 'fit-content' }} id="customer-form">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{isEditing ? 'Update Customer' : 'Add New Customer'}</h3>
            </div>
            {isEditing && (
              <button
                onClick={handleCancelEdit}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}
              >
                <X size={16} /> Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Full Name</label>
              <input
                type="text"
                value={customerForm.name}
                onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                required
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Email Address</label>
              <input
                type="email"
                value={customerForm.email}
                onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Phone Number</label>
              <input
                type="text"
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Company Name</label>
              <input
                type="text"
                value={customerForm.company}
                onChange={(e) => setCustomerForm({ ...customerForm, company: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}
                required
                placeholder="e.g. Acme Corp"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Address & Notes</label>
              <textarea
                value={customerForm.address}
                onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                placeholder="Billing address or extra details..."
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', minHeight: '80px', resize: 'vertical' }}
              />
            </div>
            <button
              type="submit"
              style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '12px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: '8px' }}
            >
              {isEditing ? 'Update Customer' : 'Add Customer'}
            </button>
          </form>
        </div>

        {/* CUSTOMER DIRECTORY */}
        <div className="glass-card" style={{ padding: '0', height: 'fit-content' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
            <h3 className="responsive-h3" style={{ fontWeight: 700 }}>Client Directory</h3>
          </div>
          <div className="cust-table-container">
            <div className="table-wrap">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '16px 24px' }}>Customer</th>
                    <th style={{ padding: '16px 24px' }}>Company</th>
                    <th style={{ padding: '16px 24px' }}>Contact</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{c.name}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.address}</p>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Building2 size={14} color="var(--primary)" />
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>{c.company}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-main)' }}>
                            <Phone size={12} color="var(--text-muted)" /> {c.phone}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-main)' }}>
                            <Mail size={12} color="var(--text-muted)" /> {c.email}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleEditClick(c)}
                            style={{ padding: '8px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                            title="Edit Client"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(c._id)}
                            style={{ padding: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                            title="Delete Client"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No customers have been added yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View: Cards */}
          <div className="cust-mobile-cards">
            {customers.map(c => (
              <div key={c._id} className="cust-card animate-scale">
                <div className="cust-card-header">
                  <div className="cust-card-avatar">{(c.name || 'C').charAt(0)}</div>
                  <div style={{ flex: 1 }}>
                    <p className="cust-card-name">{c.name}</p>
                    <div className="cust-card-company">
                      <Building2 size={14} /> {c.company}
                    </div>
                  </div>
                </div>

                <div className="cust-card-details">
                  <div className="cust-detail-item">
                    <Mail size={16} />
                    <span>{c.email}</span>
                  </div>
                  <div className="cust-detail-item">
                    <Phone size={16} />
                    <span>{c.phone}</span>
                  </div>
                  {c.address && (
                    <div className="cust-detail-item" style={{ marginTop: '4px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{c.address}</p>
                    </div>
                  )}
                </div>

                <div className="cust-card-actions">
                  <button
                    onClick={() => handleEditClick(c)}
                    className="cust-action-btn"
                    style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}
                  >
                    <Edit2 size={18} /> Edit Client
                  </button>
                  <button
                    onClick={() => handleDeleteCustomer(c._id)}
                    className="cust-action-btn"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}
                  >
                    <Trash2 size={18} /> Delete Client
                  </button>
                </div>
              </div>
            ))}
            {customers.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>No customers found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomersPage;

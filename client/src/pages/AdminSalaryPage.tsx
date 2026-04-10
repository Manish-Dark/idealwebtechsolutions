import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, X, CheckCircle, User, DollarSign, AlertCircle, Search, Users, Edit, Trash2 } from 'lucide-react';

const AdminSalaryPage: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [salarySlips, setSalarySlips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editingSlipId, setEditingSlipId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    user: '',
    employeeId: '',
    name: '',
    designation: '',
    department: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    paidDays: '30' as string | number,
    presentDays: '30' as string | number,
    absentDays: '0' as string | number,
    leaveDays: '0' as string | number,
    halfDays: '0' as string | number,
    basicSalary: '' as string | number,
    hra: '' as string | number,
    conveyance: '' as string | number,
    totalDeduction: '' as string | number,
  });

  const fetchEmployees = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const [usersRes, salaryRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/admin/users`, config),
        axios.get(`http://localhost:5000/api/admin/salary`, config)
      ]);
      setEmployees(usersRes.data);
      setSalarySlips(salaryRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Auto-fill Logic
  const handleEmployeeSelect = (empId: string) => {
    const emp = employees.find(e => e._id === empId);
    if (emp) {
      setFormData({
        ...formData,
        user: emp._id,
        employeeId: emp.employeeId || '',
        name: emp.name,
        designation: emp.designation || 'Software Engineer',
        department: emp.department || 'Engineering'
      });
    }
  };

  const handleEditClick = (slip: any) => {
    setEditingSlipId(slip._id);
    setFormData({
      user: slip.user?._id || '',
      employeeId: slip.user?.employeeId || '',
      name: slip.user?.name || '',
      designation: slip.designation || '',
      department: slip.department || '',
      month: slip.month,
      year: slip.year,
      paidDays: slip.paidDays || '30',
      presentDays: slip.presentDays || '30',
      absentDays: slip.absentDays || '0',
      leaveDays: slip.leaveDays || '0',
      halfDays: slip.halfDays || '0',
      basicSalary: slip.basicSalary || '',
      hra: slip.hra || '',
      conveyance: slip.conveyance || '',
      totalDeduction: slip.totalDeduction || '',
    });
    setShowAddModal(true);
  };

  const handleDeleteSlip = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this salary slip?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.delete(`http://localhost:5000/api/admin/salary/${id}`, config);
      await fetchEmployees();
      alert('Salary slip deleted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete salary slip');
    }
  };

  // Calculations
  const grossEarning = Number(formData.basicSalary) + Number(formData.hra || 0) + Number(formData.conveyance || 0);
  const netSalary = grossEarning - Number(formData.totalDeduction || 0);

  // Filters
  const employeeList = employees.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSlips = salarySlips.filter(record => {
    if (selectedUserId) {
      if (String(record.user?._id) !== String(selectedUserId)) return false;
    }

    // Search Filter: Check name or ID
    const userName = record.user?.name || "Unknown User";
    const empId = record.user?.employeeId || "N/A";

    return userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const data = {
        ...formData,
        grossEarning,
        netSalary
      };

      if (editingSlipId) {
        await axios.put(`http://localhost:5000/api/admin/salary/${editingSlipId}`, data, config);
      } else {
        await axios.post('http://localhost:5000/api/admin/salary', data, config);
      }

      await fetchEmployees();

      if (editingSlipId) {
        alert('Salary slip updated successfully!');
      } else {
        alert('Salary slip generated successfully!');
      }

      setShowAddModal(false);
      setEditingSlipId(null);
      // Reset form
      setFormData({
        user: '',
        employeeId: '',
        name: '',
        designation: '',
        department: '',
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        paidDays: '30',
        presentDays: '30',
        absentDays: '0',
        leaveDays: '0',
        halfDays: '0',
        basicSalary: '',
        hra: '',
        conveyance: '',
        totalDeduction: '',
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate salary slip');
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

  return (
    <div>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: 0, marginBottom: '16px' }}>
          <h1 className="responsive-h1" style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Salary Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Generate and manage payroll for all company employees.</p>
        </div>
        <div className="status-pill status-pill--live">
          <div className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
          LIVE
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', width: '100%', maxWidth: 'fit-content' }} className="admin-header-actions">
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
            onClick={() => setShowAddModal(true)}
            style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 102, 255, 0.2)' }}
          >
            <Plus size={20} />
            <span className="hide-mobile">{editingSlipId ? 'Update Slip' : 'Generate Slip'}</span>
            <span className="show-mobile">{editingSlipId ? 'Update' : 'Generate'}</span>
          </button>
        </div>
      </header>

      <div className="admin-salary-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '32px', alignItems: 'start' }}>
        {/* Left Pane: Employee List */}
        <div className="glass-card employee-pane" style={{ padding: '24px', maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Employees</h3>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
              {employeeList.length}
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
            All Salary History
          </div>

          <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
            {employeeList.map(u => (
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
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: selectedUserId === String(u._id) ? 'var(--primary)' : 'var(--surface)', color: selectedUserId === String(u._id) ? 'white' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>
                  {(u.name || 'E').charAt(0)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: selectedUserId === u._id ? 700 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>{u.designation || u.role} | #{u.employeeId}</p>
                </div>
              </div>
            ))}
            {employeeList.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', marginTop: '20px' }}>No matches found.</p>
            )}
          </div>
        </div>

        {/* Right Pane: Salary Table */}
        <div className="glass-card table-wrap" style={{ padding: '0', height: 'fit-content' }}>
          <div className="salary-table-container">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '16px 24px' }}>Employee</th>
                    <th style={{ padding: '16px 24px' }}>Period</th>
                    <th style={{ padding: '16px 24px' }}>Paid Days</th>
                    <th style={{ padding: '16px 24px' }}>Gross Earning</th>
                    <th style={{ padding: '16px 24px' }}>Deductions</th>
                    <th style={{ padding: '16px 24px' }}>Net Salary</th>
                    <th style={{ padding: '16px 24px' }}>Status</th>
                    <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSlips.map(slip => (
                    <tr key={slip._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                            {(slip.user?.name || 'U').charAt(0)}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '14px' }}>{slip.user?.name}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>#{slip.user?.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: '14px' }}>{slip.month} {slip.year}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{slip.presentDays || 0}/{slip.paidDays || 0}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: 600 }}>₹{slip.grossEarning?.toLocaleString()}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px' }}>₹{slip.totalDeduction?.toLocaleString()}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--success)', fontWeight: 700 }}>₹{slip.netSalary?.toLocaleString()}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>{slip.status}</span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleEditClick(slip)}
                            style={{ padding: '6px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--primary)', cursor: 'pointer' }}
                            title="Edit Slip"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteSlip(slip._id)}
                            style={{ padding: '6px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--error)', cursor: 'pointer' }}
                            title="Delete Slip"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredSlips.length === 0 && <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No salary slips found for the selected criteria.</p>}
            </div>
          </div>

          {/* Mobile View: Cards */}
          <div className="sal-mobile-cards">
            {filteredSlips.map(slip => (
              <div key={slip._id} className="sal-card animate-scale">
                <div className="sal-card-header">
                  <div className="sal-card-user">
                    <div className="sal-card-avatar">{(slip.user?.name || 'U').charAt(0)}</div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '15px' }}>{slip.user?.name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{slip.month} {slip.year}</p>
                    </div>
                  </div>
                  <span className="sal-card-amount">₹{slip.netSalary?.toLocaleString()}</span>
                </div>

                <div className="sal-card-grid">
                  <div className="sal-grid-item">
                    <span className="sal-grid-label">Gross</span>
                    <span className="sal-grid-value">₹{slip.grossEarning?.toLocaleString()}</span>
                  </div>
                  <div className="sal-grid-item">
                    <span className="sal-grid-label">Deduction</span>
                    <span className="sal-grid-value" style={{ color: 'var(--error)' }}>₹{slip.totalDeduction?.toLocaleString()}</span>
                  </div>
                  <div className="sal-grid-item">
                    <span className="sal-grid-label">Paid Days</span>
                    <span className="sal-grid-value">{slip.presentDays || 0}/{slip.paidDays || 0}</span>
                  </div>
                  <div className="sal-grid-item">
                    <span className="sal-grid-label">Status</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--success)' }}>{slip.status}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleEditClick(slip)}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: 'none', fontWeight: 700, fontSize: '13px' }}
                  >
                    Edit Slip
                  </button>
                  <button
                    onClick={() => handleDeleteSlip(slip._id)}
                    style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'none' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {filteredSlips.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>No salary slips found.</div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '850px', padding: '28px', maxHeight: '100%', overflowY: 'auto', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: 700 }}>{editingSlipId ? 'Update Salary Slip' : 'Generate Salary Slip'}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{editingSlipId ? 'Modify the salary details below.' : 'Select an employee and enter salary details for calculations.'}</p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingSlipId(null);
                  setFormData({
                    user: '',
                    employeeId: '',
                    name: '',
                    designation: '',
                    department: '',
                    month: new Date().toLocaleString('default', { month: 'long' }),
                    year: new Date().getFullYear(),
                    paidDays: '30',
                    presentDays: '30',
                    absentDays: '0',
                    leaveDays: '0',
                    halfDays: '0',
                    basicSalary: '',
                    hra: '',
                    conveyance: '',
                    totalDeduction: '',
                  });
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '30px' }}>
              {/* Step 1: Employee Selection */}
              <div style={{ padding: '20px', backgroundColor: 'rgba(0, 102, 255, 0.02)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><User size={18} color="var(--primary)" /> Employee Information</h4>
                <div className="responsive-grid-3" style={{ gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Select Employee</label>
                    <select required value={formData.user} onChange={(e) => handleEmployeeSelect(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
                      <option value="">Choose Employee...</option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>{emp.name} (#{emp.employeeId})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Employee Name</label>
                    <input type="text" readOnly value={formData.name} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)', color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Employee ID</label>
                    <input type="text" readOnly value={formData.employeeId} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)', color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Designation</label>
                    <input type="text" readOnly value={formData.designation} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)', color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Department</label>
                    <input type="text" readOnly value={formData.department} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'rgba(0,0,0,0.02)', color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>Period (Month/Year)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} style={{ flex: 2, padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m}>{m}</option>)}
                      </select>
                      <input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Earnings and Deductions */}
              <div className="responsive-grid-2" style={{ gap: '24px' }}>
                {/* Earnings */}
                <div style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', backgroundColor: 'rgba(16, 185, 129, 0.02)' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}><DollarSign size={18} /> Earning Details</h4>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Basic Salary</label>
                      <input type="number" required value={formData.basicSalary} onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value === '' ? '' : Number(e.target.value) })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>HRA</label>
                      <input type="number" value={formData.hra} onChange={(e) => setFormData({ ...formData, hra: e.target.value === '' ? '' : Number(e.target.value) })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Conveyance</label>
                      <input type="number" value={formData.conveyance} onChange={(e) => setFormData({ ...formData, conveyance: e.target.value === '' ? '' : Number(e.target.value) })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }} />
                    </div>
                    <div style={{ marginTop: '10px', padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px' }}>Gross Earning:</span>
                      <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--success)' }}>₹{grossEarning.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', backgroundColor: 'rgba(239, 68, 68, 0.02)' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error)' }}><AlertCircle size={18} /> Attendance & Deduction Details</h4>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div className="responsive-grid-2" style={{ display: 'grid', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Present Days</label>
                        <input type="number" value={formData.presentDays} onChange={(e) => setFormData({ ...formData, presentDays: e.target.value === '' ? '' : Number(e.target.value) })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Absent Days</label>
                        <input type="number" value={formData.absentDays} onChange={(e) => setFormData({ ...formData, absentDays: e.target.value === '' ? '' : Number(e.target.value) })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Leave Days</label>
                        <input type="number" value={formData.leaveDays} onChange={(e) => setFormData({ ...formData, leaveDays: e.target.value === '' ? '' : Number(e.target.value) })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Half Days</label>
                        <input type="number" value={formData.halfDays} onChange={(e) => setFormData({ ...formData, halfDays: e.target.value === '' ? '' : Number(e.target.value) })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Total Paid Days Formula</label>
                      <input type="number" value={formData.paidDays} onChange={(e) => setFormData({ ...formData, paidDays: e.target.value === '' ? '' : Number(e.target.value) })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Total Deduction (Tax, Unpaid Leaves, etc.)</label>
                      <input type="number" value={formData.totalDeduction} onChange={(e) => setFormData({ ...formData, totalDeduction: e.target.value === '' ? '' : Number(e.target.value) })} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }} />
                    </div>
                    <div style={{ marginTop: '10px', padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px' }}>Net Salary:</span>
                      <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--primary)' }}>₹{netSalary.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '14px 28px', borderRadius: '12px', fontWeight: 600, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '14px 40px', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle size={20} />
                  Generate Pay Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSalaryPage;

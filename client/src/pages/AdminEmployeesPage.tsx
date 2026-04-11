import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, X, Mail, Briefcase, Calendar, Eye, Phone, Home, HeartPulse, User as UserIcon, Edit2 } from 'lucide-react';

const AdminEmployeesPage: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<any>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    employeeId: '',
    password: 'Pitech@123',
    role: 'user',
    department: 'Engineering',
    designation: 'Software Engineer',
    joiningDate: new Date().toISOString().split('T')[0],
    contactNumber: '',
    address: '',
    fatherName: '',
    urgentContactNumber: '',
    bloodGroup: 'O+'
  });

  const fetchEmployees = useCallback(async () => {
    try {
      const usersRes = await api.get(`/api/admin/users?t=${Date.now()}`);
      setEmployees(usersRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEmployees();
    const interval = setInterval(fetchEmployees, 5000); // 5s polling
    return () => clearInterval(interval);
  }, [fetchEmployees]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/users', newEmployee);
      alert('Employee added successfully!');
      setShowAddModal(false);
      setNewEmployee({
        name: '',
        email: '',
        employeeId: '',
        password: '',
        role: 'user',
        department: 'Engineering',
        designation: 'Software Engineer',
        joiningDate: new Date().toISOString().split('T')[0],
        contactNumber: '',
        address: '',
        fatherName: '',
        urgentContactNumber: '',
        bloodGroup: 'O+'
      });
      fetchEmployees();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add employee');
    }
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEmployee) return;
    try {
      await api.put(`/api/admin/users/${editEmployee._id}`, editEmployee);
      alert('Employee updated successfully!');
      setShowEditModal(false);
      fetchEmployees();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      alert('Employee deleted successfully');
      fetchEmployees();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  if (loading) return <div style={{ padding: 'var(--page-padding, 40px)' }}>Loading...</div>;

  return (
    <div>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ flex: '1', minWidth: 0 }}>
          <h1 className="responsive-h1" style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Employee Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Add, remove, and manage your company employees.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', width: '100%', maxWidth: 'max-content' }}>
          <div className="status-pill status-pill--live">
            <div className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
            LIVE
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 102, 255, 0.2)' }}
          >
            <Plus size={20} />
            <span className="hide-mobile">Add Employee</span>
            <span className="show-mobile">Add</span>
          </button>
        </div>
      </header>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="emp-table-container" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '16px' }}>ID</th>
                <th style={{ padding: '16px' }}>Employee</th>
                <th style={{ padding: '16px' }}>Email</th>
                <th style={{ padding: '16px' }}>Department</th>
                <th style={{ padding: '16px' }}>Joined Date</th>
                <th style={{ padding: '16px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px', fontWeight: 600, color: 'var(--primary)', fontSize: '14px' }}>#{emp.employeeId || 'N/A'}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>
                        {(emp.name || 'E').charAt(0)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{emp.name}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{emp.designation || emp.role}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>{emp.email}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ backgroundColor: 'rgba(0, 102, 255, 0.05)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
                      {emp.department || 'General'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
                    {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => { setSelectedEmployee(emp); setShowDetailsModal(true); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--primary)', borderRadius: '8px', transition: 'all 0.2s' }}
                        title="View Full Profile"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => { setEditEmployee(emp); setShowEditModal(true); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--success)', borderRadius: '8px', transition: 'all 0.2s' }}
                        title="Edit Employee"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(emp._id, emp.name)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--error)', borderRadius: '8px', transition: 'all 0.2s' }}
                        title="Delete Employee"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Cards */}
        <div className="emp-mobile-cards">
          {employees.map((emp) => (
            <div key={emp._id} className="emp-card animate-scale">
              <div className="emp-card-header">
                <div className="emp-card-avatar">{(emp.name || 'E').charAt(0)}</div>
                <div className="emp-card-info">
                  <span className="emp-card-name">{emp.name}</span>
                  <span className="emp-card-id">#{emp.employeeId || 'N/A'}</span>
                </div>
                <div style={{ backgroundColor: 'rgba(0, 102, 255, 0.05)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700 }}>
                  {emp.department || 'General'}
                </div>
              </div>

              <div className="emp-card-details">
                <div className="emp-detail-item">
                  <span className="emp-detail-label">Designation</span>
                  <span className="emp-detail-value">{emp.designation || emp.role}</span>
                </div>
                <div className="emp-detail-item">
                  <span className="emp-detail-label">Joined</span>
                  <span className="emp-detail-value">{emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="emp-detail-item" style={{ gridColumn: 'span 2' }}>
                  <span className="emp-detail-label">Email</span>
                  <span className="emp-detail-value" style={{ fontWeight: 500, color: 'var(--text-muted)' }}>{emp.email}</span>
                </div>
              </div>

              <div className="emp-card-actions">
                <button
                  onClick={() => { setSelectedEmployee(emp); setShowDetailsModal(true); }}
                  className="emp-action-btn"
                  style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
                >
                  <Eye size={18} /> Profile
                </button>
                <button
                  onClick={() => { setEditEmployee(emp); setShowEditModal(true); }}
                  className="emp-action-btn"
                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}
                >
                  <Edit2 size={18} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteEmployee(emp._id, emp.name)}
                  className="emp-action-btn"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {employees.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>No employees found.</div>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '750px', padding: '28px', maxHeight: '100%', overflowY: 'auto', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Add New Employee</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Fill in the details to create a new company account.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} style={{ display: 'grid', gap: '20px' }}>
              <div className="responsive-grid-2">
                {/* Basic Info */}
                <div style={{ display: 'grid', gap: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, borderLeft: '3px solid var(--primary)', paddingLeft: '10px' }}>Basic Information</h4>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Full Name</label>
                    <input type="text" required value={newEmployee.name} onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Email Address</label>
                    <input type="email" required value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  </div>
                  <div className="responsive-grid-2" style={{ display: 'grid', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Employee ID</label>
                      <input type="text" required value={newEmployee.employeeId} onChange={(e) => setNewEmployee({ ...newEmployee, employeeId: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Password</label>
                      <input type="password" required value={newEmployee.password} onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                    </div>
                  </div>
                  <div className="responsive-grid-3" style={{ display: 'grid', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Department</label>
                      <select value={newEmployee.department} onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
                        <option>Engineering</option>
                        <option>Sales</option>
                        <option>Marketing</option>
                        <option>HR</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Designation</label>
                      <input type="text" required value={newEmployee.designation} onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Joining Date</label>
                      <input type="date" required value={newEmployee.joiningDate} onChange={(e) => setNewEmployee({ ...newEmployee, joiningDate: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                    </div>
                  </div>
                </div>

                {/* Contact & Personal */}
                <div style={{ display: 'grid', gap: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, borderLeft: '3px solid var(--primary)', paddingLeft: '10px' }}>Personal & Emergency</h4>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Personal Contact Number</label>
                    <input type="text" required value={newEmployee.contactNumber} onChange={(e) => setNewEmployee({ ...newEmployee, contactNumber: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Emergency Contact Name (e.g. Father)</label>
                    <input type="text" value={newEmployee.fatherName} onChange={(e) => setNewEmployee({ ...newEmployee, fatherName: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  </div>
                  <div className="responsive-grid-2" style={{ display: 'grid', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Emergency Number</label>
                      <input type="text" value={newEmployee.urgentContactNumber} onChange={(e) => setNewEmployee({ ...newEmployee, urgentContactNumber: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Blood Group</label>
                      <select value={newEmployee.bloodGroup} onChange={(e) => setNewEmployee({ ...newEmployee, bloodGroup: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
                        <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Current Address</label>
                    <textarea rows={2} value={newEmployee.address} onChange={(e) => setNewEmployee({ ...newEmployee, address: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', resize: 'none' }} />
                  </div>
                </div>
              </div>

              <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: '10px', fontSize: '16px' }}>
                Create Employee Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Employee Details Modal */}
      {showDetailsModal && selectedEmployee && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '0', overflowY: 'auto', maxHeight: '100%', borderRadius: '24px' }}>
            {/* Header / Banner */}
            <div style={{ backgroundColor: 'var(--primary)', padding: '32px', color: 'white', position: 'relative' }}>
              <button onClick={() => setShowDetailsModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', color: 'white', padding: '8px', cursor: 'pointer' }}><X size={20} /></button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 700 }}>
                  {(selectedEmployee.name || 'E').charAt(0)}
                </div>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 700 }}>{selectedEmployee.name}</h2>
                  <p style={{ opacity: 0.8, fontSize: '14px' }}>{selectedEmployee.designation || 'Staff'} | {selectedEmployee.role.toUpperCase()} | #{selectedEmployee.employeeId}</p>
                </div>
              </div>
            </div>

            {/* Details Body */}
            <div className="responsive-grid-2" style={{ padding: '32px', gap: '24px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Mail size={18} color="var(--primary)" style={{ marginTop: '4px' }} />
                <div>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</p>
                  <p style={{ fontWeight: 600, fontSize: '14px' }}>{selectedEmployee.email}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Briefcase size={18} color="var(--primary)" style={{ marginTop: '4px' }} />
                <div>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</p>
                  <p style={{ fontWeight: 600, fontSize: '14px' }}>{selectedEmployee.department || 'N/A'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Phone size={18} color="var(--primary)" style={{ marginTop: '4px' }} />
                <div>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Number</p>
                  <p style={{ fontWeight: 600, fontSize: '14px' }}>{selectedEmployee.contactNumber || 'N/A'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <HeartPulse size={18} color="var(--primary)" style={{ marginTop: '4px' }} />
                <div>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Blood Group</p>
                  <p style={{ fontWeight: 600, fontSize: '14px' }}>{selectedEmployee.bloodGroup || 'N/A'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <UserIcon size={18} color="var(--primary)" style={{ marginTop: '4px' }} />
                <div>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Emergency Contact Name</p>
                  <p style={{ fontWeight: 600, fontSize: '14px' }}>{selectedEmployee.fatherName || 'N/A'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Phone size={18} color="var(--error)" style={{ marginTop: '4px' }} />
                <div>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Emergency Number</p>
                  <p style={{ fontWeight: 600, fontSize: '14px' }}>{selectedEmployee.urgentContactNumber || 'N/A'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', gridColumn: 'span 2' }}>
                <Home size={18} color="var(--primary)" style={{ marginTop: '4px' }} />
                <div>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Residential Address</p>
                  <p style={{ fontWeight: 600, fontSize: '14px', lineHeight: 1.5 }}>{selectedEmployee.address || 'N/A'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Calendar size={18} color="var(--primary)" style={{ marginTop: '4px' }} />
                <div>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joined Date</p>
                  <p style={{ fontWeight: 600, fontSize: '14px' }}>{selectedEmployee.joiningDate ? new Date(selectedEmployee.joiningDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Briefcase size={18} color="var(--primary)" style={{ marginTop: '4px' }} />
                <div>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Designation</p>
                  <p style={{ fontWeight: 600, fontSize: '14px' }}>{selectedEmployee.designation || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div style={{ padding: '24px 32px', backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDetailsModal(false)} style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Close Profile</button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Employee Modal */}
      {showEditModal && editEmployee && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '750px', padding: '28px', maxHeight: '100%', overflowY: 'auto', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Edit Employee</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Update profile details and company status.</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee} style={{ display: 'grid', gap: '20px' }}>
              <div className="responsive-grid-2">
                <div style={{ display: 'grid', gap: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, borderLeft: '3px solid var(--primary)', paddingLeft: '10px' }}>Basic Information</h4>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Full Name</label>
                    <input type="text" required value={editEmployee.name} onChange={(e) => setEditEmployee({ ...editEmployee, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Email Address</label>
                    <input type="email" required value={editEmployee.email} onChange={(e) => setEditEmployee({ ...editEmployee, email: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Employee ID</label>
                    <input type="text" required value={editEmployee.employeeId || ''} onChange={(e) => setEditEmployee({ ...editEmployee, employeeId: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  </div>
                  <div className="responsive-grid-3" style={{ display: 'grid', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Role</label>
                      <select value={editEmployee.role} onChange={(e) => setEditEmployee({ ...editEmployee, role: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Department</label>
                      <select value={editEmployee.department} onChange={(e) => setEditEmployee({ ...editEmployee, department: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
                        <option>Engineering</option>
                        <option>Sales</option>
                        <option>Marketing</option>
                        <option>HR</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Designation</label>
                      <input type="text" value={editEmployee.designation || ''} onChange={(e) => setEditEmployee({ ...editEmployee, designation: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, borderLeft: '3px solid var(--primary)', paddingLeft: '10px' }}>Personal & Emergency</h4>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Personal Contact</label>
                    <input type="text" value={editEmployee.contactNumber || ''} onChange={(e) => setEditEmployee({ ...editEmployee, contactNumber: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Emergency Contact Name</label>
                    <input type="text" value={editEmployee.fatherName || ''} onChange={(e) => setEditEmployee({ ...editEmployee, fatherName: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                  </div>
                  <div className="responsive-grid-2" style={{ display: 'grid', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Emergency Number</label>
                      <input type="text" value={editEmployee.urgentContactNumber || ''} onChange={(e) => setEditEmployee({ ...editEmployee, urgentContactNumber: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', marginBottom: '6px', color: 'var(--text-muted)' }}>Blood Group</label>
                      <select value={editEmployee.bloodGroup} onChange={(e) => setEditEmployee({ ...editEmployee, bloodGroup: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
                        <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" style={{ backgroundColor: 'var(--success)', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: '10px', fontSize: '16px' }}>
                Save Updates
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployeesPage;

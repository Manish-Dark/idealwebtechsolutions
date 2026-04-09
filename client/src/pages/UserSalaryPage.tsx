import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FileText, DollarSign, Eye, X, Activity, Briefcase, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const UserSalaryPage: React.FC = () => {
  const { user } = useAuth();
  const [salarySlips, setSalarySlips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState<any | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const slipRef = React.useRef<HTMLDivElement>(null);

  const fetchSalaryHistory = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const res = await axios.get('http://localhost:5000/api/users/salary', config);
      setSalarySlips(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSalaryHistory();
  }, [fetchSalaryHistory]);

  const handleDownloadPDF = async () => {
    if (!slipRef.current || !selectedSlip) return;
    
    try {
      setIsGeneratingPDF(true);
      const element = slipRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`SalarySlip_${selectedSlip.month}_${selectedSlip.year}.pdf`);
      setIsGeneratingPDF(false);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      setIsGeneratingPDF(false);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const totalSlips = salarySlips.length;
  const totalNetSalary = salarySlips.reduce((sum, slip) => sum + (slip.netSalary || 0), 0);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <Activity className="pulse-dot" size={32} color="var(--primary)" style={{ marginBottom: '16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading your salary history...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>My Salary Slips</h1>
        <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase size={16} /> {user?.designation || 'Employee'}
        </p>
      </header>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
          <div style={{ width: '60px', height: '60px', backgroundColor: 'rgba(0, 102, 255, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <FileText size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Salary Slips</p>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>{totalSlips}</h2>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px' }}>
          <div style={{ width: '60px', height: '60px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
            <DollarSign size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Earnings</p>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>₹{totalNetSalary.toLocaleString()}</h2>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Salary History</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px 24px' }}>Period</th>
                <th style={{ padding: '16px 24px' }}>Paid Days</th>
                <th style={{ padding: '16px 24px' }}>Net Salary</th>
                <th style={{ padding: '16px 24px' }}>Status</th>
                <th style={{ padding: '16px 24px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {salarySlips.map((slip) => (
                <tr key={slip._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px', fontSize: '15px', fontWeight: 600 }}>{slip.month} {slip.year}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-main)', fontWeight: 600 }}>{slip.presentDays || 0}/{slip.paidDays || 0}</td>
                  <td style={{ padding: '16px 24px', fontSize: '15px', fontWeight: 700, color: 'var(--success)' }}>₹{slip.netSalary?.toLocaleString()}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>{slip.status}</span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button 
                      onClick={() => setSelectedSlip(slip)}
                      style={{ 
                        padding: '8px 16px', 
                        backgroundColor: 'var(--surface)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '8px', 
                        cursor: 'pointer', 
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--primary)'
                      }}
                    >
                      <Eye size={16} /> View Slip
                    </button>
                  </td>
                </tr>
              ))}
              {salarySlips.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No salary records available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Modal View */}
      {selectedSlip && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '0', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            {/* Modal Header */}
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Salary Statement</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{selectedSlip.month} {selectedSlip.year}</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button 
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  style={{ 
                    padding: '10px 20px', 
                    backgroundColor: 'var(--primary)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '10px', 
                    fontWeight: 700, 
                    cursor: isGeneratingPDF ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px'
                  }}
                >
                  {isGeneratingPDF ? <div className="animate-spin" style={{ width: '14px', height: '14px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></div> : <Download size={16} />}
                  {isGeneratingPDF ? 'Processing...' : 'Download PDF'}
                </button>
                <button onClick={() => setSelectedSlip(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* THE SLIP CONTENT (TARGET FOR PDF) */}
            <div ref={slipRef} style={{ padding: '40px', backgroundColor: '#ffffff', color: '#111827', fontFamily: 'Inter, sans-serif' }}>
              {/* Header / Company Info Placeholder if any, usually Employee info first */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', borderBottom: '2px solid #f3f4f6', paddingBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#111827', letterSpacing: '-0.02em' }}>PAYSLIP</h2>
                  <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: 600 }}>{selectedSlip.month.toUpperCase()} {selectedSlip.year}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Employee ID: #{user?.employeeId}</p>
                   <p style={{ fontSize: '13px', color: '#6b7280' }}>Status: {selectedSlip.status}</p>
                </div>
              </div>

              {/* Employee Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '40px' }}>
                 <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                    <p style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>Employee Name</p>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{user?.name}</p>
                 </div>
                 <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                    <p style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>Designation</p>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{selectedSlip.designation || user?.designation || 'N/A'}</p>
                 </div>
                 <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                    <p style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>Department</p>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{selectedSlip.department || user?.department || 'N/A'}</p>
                 </div>
                 <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                    <p style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 800, marginBottom: '4px' }}>Pay Period</p>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{selectedSlip.month} {selectedSlip.year}</p>
                 </div>
              </div>

              {/* Earnings & Deductions Table */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
                {/* Earnings */}
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>Earnings</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                    <span style={{ fontSize: '14px', color: '#4b5563' }}>Basic Salary</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>₹{selectedSlip.basicSalary?.toLocaleString() || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                    <span style={{ fontSize: '14px', color: '#4b5563' }}>HRA</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>₹{selectedSlip.hra?.toLocaleString() || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                    <span style={{ fontSize: '14px', color: '#4b5563' }}>Conveyance</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>₹{selectedSlip.conveyance?.toLocaleString() || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderTop: '2px dashed #e5e7eb', marginTop: '10px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>Gross Earnings</span>
                    <span style={{ fontSize: '16px', fontWeight: 900, color: '#10b981' }}>₹{selectedSlip.grossEarning?.toLocaleString() || 0}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>Deductions</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                    <span style={{ fontSize: '14px', color: '#4b5563' }}>Tax / Other Deductions</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#ef4444' }}>₹{selectedSlip.totalDeduction?.toLocaleString() || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderTop: '2px dashed #e5e7eb', marginTop: '42px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>Total Deductions</span>
                    <span style={{ fontSize: '16px', fontWeight: 900, color: '#ef4444' }}>₹{selectedSlip.totalDeduction?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>

              {/* Net Payable Banner */}
              <div style={{ padding: '24px', backgroundColor: '#111827', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                 <div>
                    <p style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>NET SALARY PAYABLE</p>
                    <p style={{ fontSize: '12px', color: '#9ca3af' }}>Final amount credited to account</p>
                 </div>
                 <div style={{ fontSize: '32px', fontWeight: 900, color: '#60a5fa' }}>
                    ₹{selectedSlip.netSalary?.toLocaleString() || 0}
                 </div>
              </div>

              {/* Attendance Summary - MOVED TO BOTTOM AS REQUESTED */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '30px' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '15px' }}>Attendance Summary</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                   <div style={{ textAlign: 'center', backgroundColor: '#f0fdf4', padding: '12px 8px', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                      <p style={{ fontSize: '16px', fontWeight: 800, color: '#16a34a' }}>{selectedSlip.presentDays || 0}</p>
                      <p style={{ fontSize: '10px', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Present</p>
                   </div>
                   <div style={{ textAlign: 'center', backgroundColor: '#fef2f2', padding: '12px 8px', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                      <p style={{ fontSize: '16px', fontWeight: 800, color: '#dc2626' }}>{selectedSlip.absentDays || 0}</p>
                      <p style={{ fontSize: '10px', color: '#991b1b', fontWeight: 700, textTransform: 'uppercase' }}>Absent</p>
                   </div>
                   <div style={{ textAlign: 'center', backgroundColor: '#fffbeb', padding: '12px 8px', borderRadius: '12px', border: '1px solid #fef3c7' }}>
                      <p style={{ fontSize: '16px', fontWeight: 800, color: '#d97706' }}>{selectedSlip.leaveDays || 0}</p>
                      <p style={{ fontSize: '10px', color: '#92400e', fontWeight: 700, textTransform: 'uppercase' }}>Leave</p>
                   </div>
                   <div style={{ textAlign: 'center', backgroundColor: '#eff6ff', padding: '12px 8px', borderRadius: '12px', border: '1px solid #dbeafe' }}>
                      <p style={{ fontSize: '16px', fontWeight: 800, color: '#2563eb' }}>{selectedSlip.halfDays || 0}</p>
                      <p style={{ fontSize: '10px', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>Half Day</p>
                   </div>
                   <div style={{ textAlign: 'center', backgroundColor: '#111827', padding: '12px 8px', borderRadius: '12px', border: '1px solid #374151' }}>
                      <p style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>{selectedSlip.presentDays || 0}/{selectedSlip.paidDays || 0}</p>
                      <p style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Total Paid</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSalaryPage;

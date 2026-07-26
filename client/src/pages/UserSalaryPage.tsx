import React, { useState, useEffect, useCallback } from 'react';
import { useLogo } from '../hooks/useLogo';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FileText, DollarSign, Eye, X, Activity, Briefcase, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const UserSalaryPage: React.FC = () => {
  const { user } = useAuth();
  const logoUrl = useLogo();
  const [salarySlips, setSalarySlips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState<any | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const slipRef = React.useRef<HTMLDivElement>(null);

  const fetchSalaryHistory = useCallback(async () => {
    try {
      const res = await api.get('/api/users/salary');
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

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDownloadPDF = async () => {
    if (!slipRef.current || !selectedSlip) return;

    try {
      setIsGeneratingPDF(true);
      const element = slipRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 3, 
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('salary-slip-view');
          if (clonedElement) {
            // FORCE DESKTOP LAYOUT IN CLONE FOR PERFECT EXPORT
            clonedElement.style.width = '1000px'; 
            clonedElement.style.minWidth = '1000px';
            clonedElement.style.height = 'auto';
            clonedElement.style.overflow = 'visible';
            clonedElement.style.padding = '60px'; 
            
            // Force responsive components to desktop layout in the clone
            const responsiveElements = clonedElement.querySelectorAll('.responsive-pdf-target');
            responsiveElements.forEach((el: any) => {
              if (el.dataset.desktopStyle) {
                const styles = JSON.parse(el.dataset.desktopStyle);
                Object.assign(el.style, styles);
              }
            });

            // CRITICAL: Un-clip all parents to ensure full height capture
            let p: HTMLElement | null = clonedElement.parentElement;
            while (p) {
              p.style.maxHeight = 'none';
              p.style.height = 'auto';
              p.style.overflow = 'visible';
              p.style.position = 'static';
              p = p.parentElement;
            }
          }
        }
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
    <div style={{ padding: '0px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 className="responsive-h1" style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>My Salary Slips</h1>
        <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase size={16} /> {user?.designation || 'Employee'}
        </p>
      </header>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '24px', marginBottom: '40px' }}>
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
        <div className="user-sal-table-container">
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

        {/* Mobile View: Salary Cards */}
        <div className="user-sal-mobile-cards">
          {salarySlips.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No records available.</div>
          ) : (
            salarySlips.map((slip) => (
              <div 
                key={slip._id} 
                className="user-sal-item-card animate-scale" 
                id={slip._id}
                onClick={() => setSelectedSlip(slip)}
                style={{ cursor: 'pointer' }}
              >
                <div className="user-sal-card-header">
                  <span className="user-sal-card-period">{slip.month} {slip.year}</span>
                  <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>{slip.status}</span>
                </div>

                <div className="user-sal-card-grid">
                  <div className="user-sal-grid-item">
                    <span className="user-sal-grid-label">Paid Days</span>
                    <span className="user-sal-grid-value">{slip.presentDays || 0}/{slip.paidDays || 0}</span>
                  </div>
                  <div className="user-sal-grid-item">
                    <span className="user-sal-grid-label">Net Salary</span>
                    <span className="user-sal-grid-value" style={{ color: 'var(--success)' }}>₹{slip.netSalary?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="user-sal-card-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <button
                    style={{ width: '100%', padding: '12px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', pointerEvents: 'none' }}
                  >
                    <Eye size={18} /> View Slip
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Slip Modal View */}
      {selectedSlip && (
        <div 
          onClick={() => setSelectedSlip(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(24px)', display: 'flex', alignItems: isMobile ? 'center' : 'flex-start', justifyContent: 'center', zIndex: 1000, padding: isMobile ? '0' : '20px', paddingTop: isMobile ? '0' : '40px', overflowY: 'auto' }}
        >
          {/* Modal Container */}
          <div 
            className="animate-scale" 
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '850px', height: isMobile ? '100%' : 'auto', maxHeight: isMobile ? '100%' : 'max-content', minHeight: isMobile ? '100%' : 'auto', display: 'flex', flexDirection: 'column', padding: '0', borderRadius: isMobile ? '0' : '32px', backgroundColor: '#ffffff', border: isMobile ? 'none' : '1px solid #e5e7eb', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', position: 'relative', margin: isMobile ? '0' : '0 auto' }}
          >
            {/* 1. FIXED MODAL HEADER */}
            <div style={{ padding: isMobile ? '16px 20px' : '20px 32px', borderBottom: '1.5px solid #e5e7eb', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', backgroundColor: '#ffffff', zIndex: 100, flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', gap: isMobile ? '12px' : '12px' }}>
              <div>
                <h3 style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 800, color: 'var(--text-main)' }}>Salary Statement</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personal Payroll Record • {selectedSlip.month} {selectedSlip.year}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: isMobile ? '100%' : 'auto' }}>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  style={{
                    flex: isMobile ? 1 : 'none',
                    padding: '10px 24px',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 700,
                    cursor: isGeneratingPDF ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    fontSize: '13px',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isGeneratingPDF ? <div className="animate-spin" style={{ width: '14px', height: '14px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></div> : <Download size={18} />}
                  {isGeneratingPDF ? 'Exporting...' : 'Export PDF'}
                </button>
                <button 
                  onClick={() => setSelectedSlip(null)} 
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* 2. SCROLLABLE BODY */}
            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f3f4f6' }}>
              <div 
                ref={slipRef} 
                id="salary-slip-view" 
                style={{ 
                  padding: isMobile ? '30px 20px' : '60px', 
                  backgroundColor: '#ffffff', 
                  color: '#111827', 
                  fontFamily: "'Inter', sans-serif", 
                  width: '100%', 
                  minHeight: '100%',
                  margin: '0 auto',
                  maxWidth: '100%'
                }}
              >
                {/* Official Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', borderBottom: '3px solid #111827', paddingBottom: '24px' }}>
                  <div>
                    {logoUrl ? (
                      <img src={logoUrl} alt="CMS Logo" style={{ height: isMobile ? '24px' : '28px', backgroundColor: 'white', padding: '4px 8px', borderRadius: '4px', marginBottom: '8px', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ height: isMobile ? '24px' : '28px', width: '80px', backgroundColor: 'white', marginBottom: '8px', borderRadius: '4px' }} />
                    )}
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Payroll Management System</p>
                    <p style={{ fontSize: '10px', color: '#6b7280', marginTop: '6px', fontWeight: 500 }}>Confidential Official Remuneration Statement</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ border: '2.5px solid #111827', color: '#111827', padding: isMobile ? '6px 12px' : '10px 24px', borderRadius: '12px', display: 'inline-block', marginBottom: '10px' }}>
                      <h2 style={{ fontSize: isMobile ? '12px' : '16px', fontWeight: 900, margin: 0, letterSpacing: '0.1em' }}>PAYSLIP</h2>
                    </div>
                    <p style={{ fontSize: isMobile ? '10px' : '14px', fontWeight: 800, color: '#111827' }}>REF: #{selectedSlip._id.slice(-8).toUpperCase()}</p>
                  </div>
                </div>

                {/* Document Info Row */}
                <div 
                  className="responsive-pdf-target"
                  data-desktop-style='{"gridTemplateColumns": "repeat(4, 1fr)"}'
                  style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}
                >
                  <div style={{ borderLeft: '4px solid #f3f4f6', paddingLeft: '16px' }}>
                    <p style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 800, marginBottom: '6px' }}>Employee Name</p>
                    <p style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 700, color: '#111827' }}>{user?.name}</p>
                  </div>
                  <div style={{ borderLeft: '4px solid #f3f4f6', paddingLeft: '16px' }}>
                    <p style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 800, marginBottom: '6px' }}>Employee ID</p>
                    <p style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 700, color: '#111827' }}>{user?.employeeId}</p>
                  </div>
                  <div style={{ borderLeft: '4px solid #f3f4f6', paddingLeft: '16px' }}>
                    <p style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 800, marginBottom: '6px' }}>Pay Period</p>
                    <p style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 700, color: '#111827' }}>{selectedSlip.month} {selectedSlip.year}</p>
                  </div>
                  <div style={{ borderLeft: '4px solid #f3f4f6', paddingLeft: '16px' }}>
                    <p style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 800, marginBottom: '6px' }}>Status</p>
                    <p style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>{selectedSlip.status}</p>
                  </div>
                </div>

                {/* Roles & Department Grid */}
                <div 
                  className="responsive-pdf-target"
                  data-desktop-style='{"gridTemplateColumns": "repeat(2, 1fr)"}'
                  style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px', marginBottom: '48px', backgroundColor: '#f9fafb', padding: '28px', borderRadius: '20px', border: '1px solid #f3f4f6' }}
                >
                  <div>
                    <p style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 800, marginBottom: '6px' }}>Position & Grade</p>
                    <p style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: 700, color: '#111827' }}>{selectedSlip.designation || user?.designation || 'N/A'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 800, marginBottom: '6px' }}>Department</p>
                    <p style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: 700, color: '#111827' }}>{selectedSlip.department || user?.department || 'N/A'}</p>
                  </div>
                </div>

                {/* Financial Summary Table */}
                <div style={{ border: '1.5px solid #e5e7eb', borderRadius: '20px', overflow: 'hidden', marginBottom: '40px' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '450px' : 'auto' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1.5px solid #e5e7eb' }}>
                          <th style={{ textAlign: 'left', padding: '18px 28px', fontSize: '12px', fontWeight: 800, color: '#4b5563', textTransform: 'uppercase' }}>Components</th>
                          <th style={{ textAlign: 'right', padding: '18px 28px', fontSize: '12px', fontWeight: 800, color: '#4b5563', textTransform: 'uppercase' }}>Earnings</th>
                          <th style={{ textAlign: 'right', padding: '18px 28px', fontSize: '12px', fontWeight: 800, color: '#4b5563', textTransform: 'uppercase' }}>Deductions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: '16px 28px', fontSize: '14px', fontWeight: 600, color: '#374151' }}>Basic Remuneration</td>
                          <td style={{ padding: '16px 28px', fontSize: '14px', fontWeight: 700, textAlign: 'right', color: '#111827' }}>₹{selectedSlip.basicSalary?.toLocaleString() || 0}</td>
                          <td style={{ padding: '16px 28px', fontSize: '14px', textAlign: 'right', color: '#9ca3af' }}>-</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '16px 28px', fontSize: '14px', fontWeight: 600, color: '#374151' }}>House Rent Allowance</td>
                          <td style={{ padding: '16px 28px', fontSize: '14px', fontWeight: 700, textAlign: 'right', color: '#111827' }}>₹{selectedSlip.hra?.toLocaleString() || 0}</td>
                          <td style={{ padding: '16px 28px', fontSize: '14px', textAlign: 'right', color: '#9ca3af' }}>-</td>
                        </tr>
                        <tr style={{ borderTop: '2px solid #111827', backgroundColor: '#f9fafb' }}>
                          <td style={{ padding: '20px 28px', fontSize: '14px', fontWeight: 900, color: '#111827' }}>Gross Balances</td>
                          <td style={{ padding: '20px 28px', fontSize: '17px', fontWeight: 900, textAlign: 'right', color: '#10b981' }}>₹{selectedSlip.grossEarning?.toLocaleString() || 0}</td>
                          <td style={{ padding: '20px 28px', fontSize: '17px', fontWeight: 900, textAlign: 'right', color: '#dc2626' }}>₹{selectedSlip.totalDeduction?.toLocaleString() || 0}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Net Salary Highlight */}
                <div 
                  className="responsive-pdf-target"
                  data-desktop-style='{"flexDirection": "row", "padding": "32px 40px"}'
                  style={{ padding: isMobile ? '24px' : '32px 40px', backgroundColor: '#f8fafc', border: '2px solid #111827', borderRadius: '24px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '40px', gap: isMobile ? '16px' : '0' }}
                >
                  <div>
                    <p style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 900, color: '#111827', textTransform: 'uppercase' }}>Net Payable Component</p>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>Final amount transferred to account.</p>
                  </div>
                  <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                    <p style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: 900, color: '#1d4ed8', letterSpacing: '-0.02em', margin: 0 }}>₹{selectedSlip.netSalary?.toLocaleString() || 0}</p>
                  </div>
                </div>

                {/* Attendance Summary */}
                <div 
                  className="responsive-pdf-target"
                  data-desktop-style='{"flexDirection": "row", "gap": "60px"}'
                  style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '40px' : '60px', marginTop: '20px' }}
                >
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '11px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '18px' }}>Attendance Summary</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #dcfce7', padding: '14px', borderRadius: '16px', textAlign: 'center' }}>
                        <p style={{ fontSize: '18px', fontWeight: 900, color: '#16a34a', margin: 0 }}>{selectedSlip.presentDays}</p>
                        <p style={{ fontSize: '10px', color: '#166534', fontWeight: 800 }}>PRESENT</p>
                      </div>
                      <div style={{ backgroundColor: '#fef2f2', border: '1.5px solid #fee2e2', padding: '14px', borderRadius: '16px', textAlign: 'center' }}>
                        <p style={{ fontSize: '18px', fontWeight: 900, color: '#dc2626', margin: 0 }}>{selectedSlip.absentDays}</p>
                        <p style={{ fontSize: '10px', color: '#991b1b', fontWeight: 800 }}>ABSENT</p>
                      </div>
                      <div style={{ backgroundColor: '#eff6ff', border: '1.5px solid #dbeafe', padding: '14px', borderRadius: '16px', textAlign: 'center' }}>
                        <p style={{ fontSize: '18px', fontWeight: 900, color: '#2563eb', margin: 0 }}>{selectedSlip.paidDays}</p>
                        <p style={{ fontSize: '10px', color: '#1e40af', fontWeight: 800 }}>PAID</p>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: isMobile ? 'flex-start' : 'flex-end' }}>
                    <div style={{ borderTop: '2.5px solid #111827', width: '220px', paddingTop: '12px', textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', fontWeight: 900, color: '#111827', textTransform: 'uppercase' }}>Authorized Signatory</p>
                      <p style={{ fontSize: '10px', color: '#6b7280', marginTop: '6px' }}>Digitally Verified Record</p>
                    </div>
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

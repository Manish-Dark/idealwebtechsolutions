import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useLogo } from '../hooks/useLogo';
import { useSignature } from '../hooks/useSignature';
import {
  Plus, X, Eye, Download, Trash2, Receipt,
  FileText, IndianRupee, Calendar, TrendingUp
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// ── Number to Words (Indian rupees) ──────────────────────────────────────
const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
  'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN',
  'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

function inWords(n: number): string {
  if (n === 0) return 'ZERO';
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  if (n < 1000) return ones[Math.floor(n / 100)] + ' HUNDRED' + (n % 100 ? ' ' + inWords(n % 100) : '');
  if (n < 100000) return inWords(Math.floor(n / 1000)) + ' THOUSAND' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
  if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' LAKH' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
  return inWords(Math.floor(n / 10000000)) + ' CRORE' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
}

function amountToWords(amount: number): string {
  if (!amount || amount <= 0) return '';
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let result = inWords(rupees) + ' RUPEES';
  if (paise > 0) result += ' AND ' + inWords(paise) + ' PAISE';
  return result + ' ONLY';
}

function formatPhone(phone?: string): string {
  if (!phone) return '';
  const trimmed = phone.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('+')) return trimmed;
  if (trimmed.startsWith('91-')) return `+${trimmed}`;
  if (trimmed.startsWith('91') && trimmed.length >= 10) return `+91-${trimmed.slice(2)}`;
  return `+91-${trimmed}`;
}
// ─────────────────────────────────────────────────────────────────────────

const emptyItem = () => ({ name: '', hsnSac: '', qty: 1, rate: 0, taxableValue: 0, igstPercent: 18, igstAmount: 0, total: 0 });

const emptyForm = () => ({
  invoiceNo: '',
  invoiceDate: '',
  challanNo: '',
  challanDate: '',
  eWayBillNo: '',
  transport: '',
  transportId: '',
  customerName: '',
  customerAddress: '',
  customerPhone: '',
  customerGSTIN: '',
  placeOfSupply: '',
  items: [emptyItem()],
  totalQty: 0,
  totalTaxableValue: 0,
  totalIgst: 0,
  grandTotal: 0,
  totalInWords: ''
});

const InputField: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>
      {label}{required && ' *'}
    </label>
    {children}
  </div>
);

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  border: '1px solid var(--border)', background: 'var(--surface)',
  color: 'var(--text-main)', fontSize: '14px', outline: 'none',
};

const AdminInvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [formData, setFormData] = useState(emptyForm());
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const invoiceRef = useRef<HTMLDivElement>(null);
  const logoUrl = useLogo();
  const signatureUrl = useSignature();

  useEffect(() => { fetchInvoices(); fetchCustomers(); }, []);

  const handleOpenCreateModal = () => {
    let maxNum = 1124;
    invoices.forEach(inv => {
      if (inv.invoiceNo) {
        const match = inv.invoiceNo.match(/HRV(\d+)/i) || inv.invoiceNo.match(/(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
    });
    const nextInvoiceNo = `HRV${maxNum + 1}`;
    const todayStr = new Date().toISOString().split('T')[0];

    setFormData({
      ...emptyForm(),
      invoiceNo: nextInvoiceNo,
      invoiceDate: todayStr
    });
    setSelectedCustomerId('');
    setIsCreateModalOpen(true);
  };

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/api/admin/invoices');
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/api/admin/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    if (!customerId) {
      setFormData(f => ({ ...f, customerName: '', customerAddress: '', customerPhone: '', customerGSTIN: '', placeOfSupply: '' }));
      return;
    }
    const cust = customers.find(c => c._id === customerId);
    if (cust) {
      setFormData(f => ({
        ...f,
        customerName: cust.name || '',
        customerAddress: cust.address || '',
        customerPhone: formatPhone(cust.phone || ''),
        customerGSTIN: cust.gstin || '',
        placeOfSupply: cust.address || '',
      }));
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const items = formData.items.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      const qty = Number(field === 'qty' ? value : updated.qty) || 0;
      const rate = Number(field === 'rate' ? value : updated.rate) || 0;
      const igstPercent = Number(field === 'igstPercent' ? value : updated.igstPercent) || 0;
      updated.taxableValue = qty * rate;
      updated.igstAmount = (updated.taxableValue * igstPercent) / 100;
      updated.total = updated.taxableValue + updated.igstAmount;
      return updated;
    });
    const totalQty = items.reduce((s, it) => s + Number(it.qty), 0);
    const totalTaxableValue = items.reduce((s, it) => s + it.taxableValue, 0);
    const totalIgst = items.reduce((s, it) => s + it.igstAmount, 0);
    const grandTotal = items.reduce((s, it) => s + it.total, 0);
    const totalInWords = amountToWords(grandTotal);
    setFormData(f => ({ ...f, items, totalQty, totalTaxableValue, totalIgst, grandTotal, totalInWords }));
  };

  const addItem = () => setFormData(f => ({ ...f, items: [...f.items, emptyItem()] }));

  const removeItem = (index: number) => {
    const items = formData.items.filter((_, i) => i !== index);
    const totalQty = items.reduce((s, it) => s + Number(it.qty), 0);
    const totalTaxableValue = items.reduce((s, it) => s + it.taxableValue, 0);
    const totalIgst = items.reduce((s, it) => s + it.igstAmount, 0);
    const grandTotal = items.reduce((s, it) => s + it.total, 0);
    const totalInWords = amountToWords(grandTotal);
    setFormData(f => ({ ...f, items, totalQty, totalTaxableValue, totalIgst, grandTotal, totalInWords }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        customerPhone: formatPhone(formData.customerPhone),
        challanDate: formData.challanDate?.trim() || undefined,
        challanNo: formData.challanNo?.trim() || undefined,
        eWayBillNo: formData.eWayBillNo?.trim() || undefined,
        transport: formData.transport?.trim() || undefined,
        transportId: formData.transportId?.trim() || undefined,
        customerGSTIN: formData.customerGSTIN?.trim() || undefined,
      };
      await api.post('/api/admin/invoices', payload);
      setIsCreateModalOpen(false);
      setFormData(emptyForm());
      setSelectedCustomerId('');
      fetchInvoices();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to create invoice.';
      alert(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this invoice?')) return;
    try {
      await api.delete(`/api/admin/invoices/${id}`);
      fetchInvoices();
    } catch (err) {
      console.error(err);
    }
  };

  const downloadPDF = async () => {
    if (!invoiceRef.current) return;
    setIsGeneratingPDF(true);
    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        scrollY: -window.scrollY
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();

      let imgWidth = pdfWidth;
      let imgHeight = (canvas.height * pdfWidth) / canvas.width;

      if (imgHeight > pdfPageHeight) {
        const ratio = pdfPageHeight / imgHeight;
        imgWidth = pdfWidth * ratio;
        imgHeight = pdfPageHeight;
        const xOffset = (pdfWidth - imgWidth) / 2;
        pdf.addImage(imgData, 'PNG', xOffset, 0, imgWidth, imgHeight);
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }

      pdf.save(`Invoice_${selectedInvoice.invoiceNo}.pdf`);
    } catch (err) {
      alert('Failed to generate PDF.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Summary stats
  const totalRevenue = invoices.reduce((s, inv) => s + (inv.grandTotal || 0), 0);
  const thisMonth = invoices.filter(inv => {
    const d = new Date(inv.invoiceDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center' }}>
      <Receipt size={32} color="var(--primary)" style={{ marginBottom: '12px' }} />
      <p style={{ color: 'var(--text-muted)' }}>Loading invoices...</p>
    </div>
  );

  return (
    <div>
      {/* ─── Header ─── */}
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="responsive-h1" style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Invoice Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Create, manage and download tax invoices.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="status-pill status-pill--live">
            <div className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            LIVE
          </div>
          <button
            onClick={handleOpenCreateModal}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--primary)', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
          >
            <Plus size={18} /> New Invoice
          </button>
        </div>
      </header>

      {/* ─── Stats Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { icon: <FileText size={24} />, color: 'var(--primary)', bg: 'rgba(99,102,241,0.1)', label: 'Total Invoices', value: invoices.length },
          { icon: <IndianRupee size={24} />, color: 'var(--success)', bg: 'rgba(16,185,129,0.1)', label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}` },
          { icon: <Calendar size={24} />, color: '#F97316', bg: 'rgba(249,115,22,0.1)', label: 'This Month', value: thisMonth },
          { icon: <TrendingUp size={24} />, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', label: 'Avg. Invoice', value: invoices.length ? `₹${(totalRevenue / invoices.length).toFixed(0)}` : '₹0' },
        ].map((card, i) => (
          <div key={i} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, flexShrink: 0 }}>
              {card.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.label}</p>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', wordBreak: 'break-word' }}>{card.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Invoice Table ─── */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Receipt size={20} color="var(--primary)" />
          <h3 style={{ fontWeight: 700, fontSize: '18px' }}>All Invoices</h3>
          <span style={{ marginLeft: 'auto', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', fontWeight: 700, padding: '2px 10px', borderRadius: '999px', fontSize: '13px' }}>{invoices.length}</span>
        </div>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {['Invoice No', 'Date', 'Customer', 'Place of Supply', 'Grand Total', 'Actions'].map((h, i) => (
                  <th key={i} style={{ padding: '14px 20px', textAlign: i === 5 ? 'right' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv._id} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--primary)', fontSize: '14px' }}>{inv.invoiceNo}</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', whiteSpace: 'nowrap' }}>{new Date(inv.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>{inv.customerName}</div>
                    {inv.customerPhone && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{inv.customerPhone}</div>}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px' }}>{inv.placeOfSupply || '-'}</td>
                  <td style={{ padding: '14px 20px', fontWeight: 700, fontSize: '15px', color: 'var(--text-main)' }}>₹{Number(inv.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <button onClick={() => setSelectedInvoice(inv)}
                        style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(99,102,241,0.08)', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Eye size={14} /> View / Print
                      </button>
                      <button onClick={() => handleDelete(inv._id)}
                        style={{ padding: '6px 10px', borderRadius: '8px', border: 'none', background: 'rgba(239,68,68,0.1)', color: 'var(--error)', cursor: 'pointer' }}
                        title="Delete Invoice">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Receipt size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
                    <p style={{ fontSize: '14px' }}>No invoices created yet. Click "New Invoice" above to generate your first invoice.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Create Invoice Modal ─── */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}
          onClick={e => { if (e.target === e.currentTarget) setIsCreateModalOpen(false); }}>
          <div className="glass-card animate-scale" style={{ width: '100%', maxWidth: '820px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', background: 'var(--surface)', borderRadius: '24px', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(99,102,241,0.12)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Receipt size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Create New Tax Invoice</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Fill in invoice details, customer info, and line items</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ marginLeft: 'auto', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.07em', marginBottom: '14px' }}>Invoice Details</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '16px', marginBottom: '28px' }}>
                <InputField label="Invoice No" required>
                  <input type="text" required value={formData.invoiceNo} onChange={e => setFormData(f => ({...f, invoiceNo: e.target.value}))} style={inputStyle} placeholder="e.g. INV-001" />
                </InputField>
                <InputField label="Invoice Date" required>
                  <input type="date" required value={formData.invoiceDate} onChange={e => setFormData(f => ({...f, invoiceDate: e.target.value}))} style={inputStyle} />
                </InputField>
                <InputField label="Challan No">
                  <input type="text" value={formData.challanNo} onChange={e => setFormData(f => ({...f, challanNo: e.target.value}))} style={inputStyle} />
                </InputField>
                <InputField label="Challan Date">
                  <input type="date" value={formData.challanDate} onChange={e => setFormData(f => ({...f, challanDate: e.target.value}))} style={inputStyle} />
                </InputField>
                <InputField label="E-Way Bill No">
                  <input type="text" value={formData.eWayBillNo} onChange={e => setFormData(f => ({...f, eWayBillNo: e.target.value}))} style={inputStyle} />
                </InputField>
                <InputField label="Transport">
                  <input type="text" value={formData.transport} onChange={e => setFormData(f => ({...f, transport: e.target.value}))} style={inputStyle} />
                </InputField>
              </div>

              <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.07em', marginBottom: '14px' }}>Customer Details</p>

              <div style={{ marginBottom: '16px', padding: '16px', borderRadius: '10px', border: '2px solid var(--primary)', background: 'rgba(99,102,241,0.04)', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Select from Customer Directory</label>
                  <select
                    value={selectedCustomerId}
                    onChange={e => handleCustomerSelect(e.target.value)}
                    style={{ ...inputStyle, border: 'none', background: 'transparent', padding: '0', fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: selectedCustomerId ? 'var(--text-main)' : 'var(--text-muted)' }}
                  >
                    <option value="">— Choose a customer —</option>
                    {customers.map(c => (
                      <option key={c._id} value={c._id}>{c.name} — {c.company}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '16px', marginBottom: '28px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <InputField label="Customer Name" required>
                    <input type="text" required value={formData.customerName} onChange={e => setFormData(f => ({...f, customerName: e.target.value}))} style={inputStyle} placeholder="e.g. Shiv Engineering" />
                  </InputField>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <InputField label="Address" required>
                    <input type="text" required value={formData.customerAddress} onChange={e => setFormData(f => ({...f, customerAddress: e.target.value}))} style={inputStyle} placeholder="Full billing address" />
                  </InputField>
                </div>
                <InputField label="Phone" required>
                  <input type="text" required value={formData.customerPhone} onChange={e => setFormData(f => ({...f, customerPhone: e.target.value}))} style={inputStyle} />
                </InputField>
                <InputField label="GSTIN">
                  <input type="text" value={formData.customerGSTIN} onChange={e => setFormData(f => ({...f, customerGSTIN: e.target.value}))} style={inputStyle} />
                </InputField>
                <div style={{ gridColumn: '1 / -1' }}>
                  <InputField label="Place of Supply" required>
                    <input type="text" required value={formData.placeOfSupply} onChange={e => setFormData(f => ({...f, placeOfSupply: e.target.value}))} style={inputStyle} placeholder="e.g. Maharashtra (27)" />
                  </InputField>
                </div>
              </div>

              {/* Items */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.07em' }}>Line Items</p>
                <button type="button" onClick={addItem} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                  <Plus size={14} /> Add Item
                </button>
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--hover)', borderBottom: '1px solid var(--border)' }}>
                      {['Product / Service', 'Qty', 'Rate (₹)', 'IGST %', 'Total', ''].map((h, i) => (
                        <th key={i} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index} style={{ borderBottom: index < formData.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <td style={{ padding: '8px 12px', minWidth: '180px' }}>
                          <input type="text" required value={item.name} onChange={e => handleItemChange(index, 'name', e.target.value)} style={{ ...inputStyle, padding: '8px 10px' }} placeholder="Product name" />
                        </td>
                        <td style={{ padding: '8px 8px', minWidth: '70px' }}>
                          <input type="number" required min="1" value={item.qty} onChange={e => handleItemChange(index, 'qty', e.target.value)} style={{ ...inputStyle, padding: '8px 10px' }} />
                        </td>
                        <td style={{ padding: '8px 8px', minWidth: '100px' }}>
                          <input type="number" required min="0" value={item.rate} onChange={e => handleItemChange(index, 'rate', e.target.value)} style={{ ...inputStyle, padding: '8px 10px' }} />
                        </td>
                        <td style={{ padding: '8px 8px', minWidth: '80px' }}>
                          <input type="number" required min="0" value={item.igstPercent} onChange={e => handleItemChange(index, 'igstPercent', e.target.value)} style={{ ...inputStyle, padding: '8px 10px' }} />
                        </td>
                        <td style={{ padding: '8px 12px', minWidth: '100px', fontWeight: 700, color: 'var(--text-main)', fontSize: '14px', whiteSpace: 'nowrap' }}>
                          ₹{item.total.toFixed(2)}
                        </td>
                        <td style={{ padding: '8px 8px' }}>
                          <button type="button" onClick={() => removeItem(index)} style={{ padding: '6px', background: 'rgba(239,68,68,0.1)', color: 'var(--error)', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex' }}>
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Bar */}
              <div style={{ display: 'flex', gap: '24px', justifyContent: 'flex-end', flexWrap: 'wrap', padding: '16px 20px', background: 'var(--hover)', borderRadius: '10px', marginBottom: '20px' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Taxable</p>
                  <p style={{ fontWeight: 700, fontSize: '16px' }}>₹{formData.totalTaxableValue.toFixed(2)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>IGST</p>
                  <p style={{ fontWeight: 700, fontSize: '16px' }}>₹{formData.totalIgst.toFixed(2)}</p>
                </div>
                <div style={{ textAlign: 'right', borderLeft: '2px solid var(--border)', paddingLeft: '24px' }}>
                  <p style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase' }}>Grand Total</p>
                  <p style={{ fontWeight: 800, fontSize: '22px', color: 'var(--primary)' }}>₹{formData.grandTotal.toFixed(2)}</p>
                </div>
              </div>

              <InputField label="Total Amount in Words" required>
                <input type="text" required value={formData.totalInWords} onChange={e => setFormData(f => ({...f, totalInWords: e.target.value}))} style={inputStyle} placeholder="e.g. FOUR THOUSAND FOUR HUNDRED RUPEES ONLY" />
              </InputField>

              <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{ padding: '11px 24px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: 'var(--text-main)' }}>
                  Cancel
                </button>
                <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--primary)', color: 'white', padding: '11px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>
                  <Receipt size={16} /> Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════ VIEW / PRINT MODAL ═══════════════════ */}
      {selectedInvoice && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', overflowY: 'auto' }}>
          {/* Actions toolbar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', width: '100%', maxWidth: '820px', justifyContent: 'flex-end' }}>
            <button onClick={downloadPDF} disabled={isGeneratingPDF}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--primary)', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              {isGeneratingPDF
                ? <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                : <Download size={18} />}
              {isGeneratingPDF ? 'Generating…' : 'Download PDF'}
            </button>
            <button onClick={() => setSelectedInvoice(null)} style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* ── The actual printable invoice ── */}
          <div ref={invoiceRef} style={{
            fontFamily: 'Arial, sans-serif', backgroundColor: 'white', color: '#111',
            width: '210mm', minHeight: '280mm', padding: '8mm 10mm', boxSizing: 'border-box', fontSize: '11px',
          }}>
            {/* Invoice Header with Logo & Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '2px solid #2a265f', paddingBottom: '8px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#2a265f', margin: 0, letterSpacing: '0.5px' }}>TAX INVOICE</h1>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>ORIGINAL FOR RECIPIENT</span>
              </div>
              {logoUrl && <img src={logoUrl} alt="Logo" style={{ height: '56px', objectFit: 'contain' }} />}
            </div>

            {/* Invoice Meta Data Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', border: '1px solid black', fontSize: '10px' }}>
              <tbody>
                <tr style={{ background: '#f5f5f5', borderBottom: '1px solid black' }}>
                  <td style={{ padding: '5px 8px', fontWeight: 700, width: '13%' }}>Invoice No.:</td>
                  <td style={{ padding: '5px 8px', fontWeight: 600, width: '20%' }}>{selectedInvoice.invoiceNo}</td>
                  <td style={{ padding: '5px 8px', fontWeight: 700, width: '13%' }}>Invoice Date:</td>
                  <td style={{ padding: '5px 8px', width: '20%' }}>{new Date(selectedInvoice.invoiceDate).toLocaleDateString('en-IN')}</td>
                  <td style={{ padding: '5px 8px', fontWeight: 700, width: '14%' }}>E-Way Bill:</td>
                  <td style={{ padding: '5px 8px', width: '20%' }}>{selectedInvoice.eWayBillNo || '-'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '5px 8px', fontWeight: 700 }}>Challan No:</td>
                  <td style={{ padding: '5px 8px' }}>{selectedInvoice.challanNo || '-'}</td>
                  <td style={{ padding: '5px 8px', fontWeight: 700 }}>Challan Date:</td>
                  <td style={{ padding: '5px 8px' }}>{selectedInvoice.challanDate ? new Date(selectedInvoice.challanDate).toLocaleDateString('en-IN') : '-'}</td>
                  <td style={{ padding: '5px 8px', fontWeight: 700 }}>Transport / ID:</td>
                  <td style={{ padding: '5px 8px' }}>{selectedInvoice.transport || '-'} {selectedInvoice.transportId && selectedInvoice.transportId !== '-' ? `(${selectedInvoice.transportId})` : ''}</td>
                </tr>
              </tbody>
            </table>

            {/* Side-by-Side Shipping Address (Supplier) & Customer Detail (Delivery Address) */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', border: '1px solid black' }}>
              <tbody>
                <tr>
                  {/* Left Side: Shipping / Company Address */}
                  <td style={{ width: '50%', verticalAlign: 'top', padding: 0, borderRight: '1px solid black' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td colSpan={2} style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 700, background: '#e8e8e8', borderBottom: '1px solid black', fontSize: '11px' }}>
                            Shipping Address / Supplier Details
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #ddd' }}>
                          <td style={{ padding: '4px 8px', fontWeight: 700, width: '100px', whiteSpace: 'nowrap' }}>GSTIN</td>
                          <td style={{ padding: '4px 8px' }}>26CORPP3939N1</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #ddd' }}>
                          <td style={{ padding: '4px 8px', fontWeight: 700, whiteSpace: 'nowrap' }}>Address</td>
                          <td style={{ padding: '4px 8px' }}>
                            Capital High St, Phool Bagh, RIICO Industrial Area, Bhiwadi, 301019
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #ddd' }}>
                          <td style={{ padding: '4px 8px', fontWeight: 700, whiteSpace: 'nowrap' }}>Phone</td>
                          <td style={{ padding: '4px 8px' }}>+91-8199055470</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '4px 8px', fontWeight: 700, whiteSpace: 'nowrap' }}>Description</td>
                          <td style={{ padding: '4px 8px', fontSize: '10px', color: '#444' }}>
                            Manufacturing & Supply of Precision software
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>

                  {/* Right Side: Customer Detail / Delivery Address */}
                  <td style={{ width: '50%', verticalAlign: 'top', padding: 0 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td colSpan={2} style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 700, background: '#e8e8e8', borderBottom: '1px solid black', fontSize: '11px' }}>
                            Customer Detail / Delivery Address
                          </td>
                        </tr>
                        {[['Name', selectedInvoice.customerName], ['Address', selectedInvoice.customerAddress], ['Phone', formatPhone(selectedInvoice.customerPhone)], ['GSTIN', selectedInvoice.customerGSTIN], ['Place of Supply', selectedInvoice.placeOfSupply]].map(([k, v]) => (
                          <tr key={k} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '4px 8px', fontWeight: 700, width: '100px', whiteSpace: 'nowrap' }}>{k}</td>
                            <td style={{ padding: '4px 8px' }}>{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', marginBottom: '12px' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', height: '30px' }}>
                  <th style={{ border: '1px solid black', padding: '6px 4px', width: '5%', textAlign: 'center', verticalAlign: 'middle', fontSize: '10px', fontWeight: 700 }}>Sr.</th>
                  <th style={{ border: '1px solid black', padding: '6px 8px', textAlign: 'left', verticalAlign: 'middle', fontSize: '10px', fontWeight: 700 }}>Name of Product / Service</th>
                  <th style={{ border: '1px solid black', padding: '6px 4px', textAlign: 'center', width: '8%', verticalAlign: 'middle', fontSize: '10px', fontWeight: 700 }}>Qty</th>
                  <th style={{ border: '1px solid black', padding: '6px 8px', textAlign: 'right', width: '12%', verticalAlign: 'middle', fontSize: '10px', fontWeight: 700 }}>Rate</th>
                  <th style={{ border: '1px solid black', padding: '6px 8px', textAlign: 'right', width: '14%', verticalAlign: 'middle', fontSize: '10px', fontWeight: 700 }}>Taxable Value</th>
                  <th style={{ border: '1px solid black', padding: '6px 4px', textAlign: 'center', width: '8%', verticalAlign: 'middle', fontSize: '10px', fontWeight: 700 }}>IGST %</th>
                  <th style={{ border: '1px solid black', padding: '6px 8px', textAlign: 'right', width: '12%', verticalAlign: 'middle', fontSize: '10px', fontWeight: 700 }}>IGST Amount</th>
                  <th style={{ border: '1px solid black', padding: '6px 8px', textAlign: 'right', width: '14%', verticalAlign: 'middle', fontSize: '10px', fontWeight: 700 }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ border: '1px solid #ccc', padding: '5px', fontWeight: 600 }}>{item.name}</td>
                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>{item.qty} NOS</td>
                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right' }}>{Number(item.rate).toFixed(2)}</td>
                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right' }}>{Number(item.taxableValue).toFixed(2)}</td>
                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>{item.igstPercent}</td>
                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right' }}>{Number(item.igstAmount).toFixed(2)}</td>
                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right', fontWeight: 700 }}>{Number(item.total).toFixed(2)}</td>
                  </tr>
                ))}
                <tr style={{ height: '120px' }}><td colSpan={8} style={{ border: '1px solid #ccc' }}></td></tr>
                <tr style={{ background: '#f5f5f5', fontWeight: 700 }}>
                  <td colSpan={2} style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>Total</td>
                  <td style={{ border: '1px solid black', padding: '5px', textAlign: 'center' }}>{selectedInvoice.totalQty} NOS</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}></td>
                  <td style={{ border: '1px solid black', padding: '5px', textAlign: 'right' }}>{Number(selectedInvoice.totalTaxableValue).toFixed(2)}</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}></td>
                  <td style={{ border: '1px solid black', padding: '5px', textAlign: 'right' }}>{Number(selectedInvoice.totalIgst).toFixed(2)}</td>
                  <td style={{ border: '1px solid black', padding: '5px', textAlign: 'right' }}>{Number(selectedInvoice.grandTotal).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Footer */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black' }}>
              <tbody>
                <tr>
                  <td style={{ width: '55%', verticalAlign: 'top', padding: 0, borderRight: '1px solid black' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr><td style={{ padding: '5px 8px', textAlign: 'center', background: '#e8e8e8', fontWeight: 700, borderBottom: '1px solid black' }}>Total in Words</td></tr>
                        <tr><td style={{ padding: '8px', textAlign: 'center', minHeight: '40px', borderBottom: '1px solid black', fontStyle: 'italic' }}>{selectedInvoice.totalInWords}</td></tr>
                        <tr><td style={{ padding: '5px 8px', textAlign: 'center', background: '#e8e8e8', fontWeight: 700, borderBottom: '1px solid black' }}>Bank Details</td></tr>
                        <tr><td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=joyajay83@ptyes&pn=Supplier&am=${selectedInvoice.grandTotal || 0}&cu=INR`)}`}
                              alt="UPI QR Code"
                              crossOrigin="anonymous"
                              style={{ width: '90px', height: '90px', border: '1px solid #ccc', borderRadius: '6px', padding: '4px', background: '#fff', marginBottom: '6px' }}
                            />
                            <span style={{ fontWeight: 700, fontSize: '11px', color: '#222' }}>UPI ID: joyajay83@ptyes</span>
                            <span style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>Pay using GPay / PhonePe / Paytm</span>
                          </div>
                        </td></tr>
                        <tr><td style={{ borderTop: '1px solid black', padding: '8px', fontSize: '10px' }}>
                          <strong>Terms and Conditions</strong><br />
                          Subject to Rajasthan Jurisdiction. Our Responsibility Ceases as soon as goods leaves our Premises.<br />
                          Goods once sold will not taken back. Delivery Ex-Premises.
                        </td></tr>
                      </tbody>
                    </table>
                  </td>
                  <td style={{ width: '45%', verticalAlign: 'top', padding: 0 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', height: '100%' }}>
                      <tbody>
                        {[['Taxable Amount', Number(selectedInvoice.totalTaxableValue).toFixed(2)], ['Add : IGST', Number(selectedInvoice.totalIgst).toFixed(2)], ['Total Tax', Number(selectedInvoice.totalIgst).toFixed(2)]].map(([k, v]) => (
                          <tr key={k} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '5px 10px' }}>{k}</td>
                            <td style={{ padding: '5px 10px', textAlign: 'right' }}>{v}</td>
                          </tr>
                        ))}
                        <tr style={{ borderBottom: '1px solid black', background: '#f5f5f5' }}>
                          <td style={{ padding: '6px 10px', fontWeight: 700 }}>Total Amount After Tax</td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 900, fontSize: '14px' }}>₹{Number(selectedInvoice.grandTotal).toFixed(2)}</td>
                        </tr>
                        <tr><td colSpan={2} style={{ padding: '4px 10px', textAlign: 'right', fontSize: '9px', borderBottom: '1px solid #ddd' }}>(E & O.E.)</td></tr>
                        <tr><td colSpan={2} style={{ padding: '10px', textAlign: 'center', minHeight: '120px', verticalAlign: 'bottom' }}>
                          <div style={{ fontSize: '9px', marginBottom: '6px', color: '#555' }}>Certified that the particulars given above are true and correct.</div>
                          <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: signatureUrl ? '4px' : '20px' }}>Authorised Signatory</div>
                          {signatureUrl && (
                            <img
                              src={signatureUrl}
                              alt="Authorised Signature"
                              style={{
                                maxHeight: '70px',
                                maxWidth: '160px',
                                objectFit: 'contain',
                                margin: '4px auto 6px auto',
                                display: 'block',
                                backgroundColor: '#ffffff'
                              }}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          )}
                          <div style={{ borderTop: '1px solid black', width: '70%', margin: '0 auto', paddingTop: '4px', fontSize: '9px' }}>Authorised Signatory</div>
                        </td></tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvoicesPage;

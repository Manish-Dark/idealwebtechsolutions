import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AlertCircle, History, IndianRupee, LockKeyhole, LogOut, Printer, Receipt } from 'lucide-react';

const ledgerPassword = import.meta.env.VITE_INVOICE_LEDGER_PASSWORD || 'Ak@123';

const AdminInvoiceTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(() => sessionStorage.getItem('invoiceLedgerUnlocked') === 'true');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isUnlocked) {
      setLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      try {
        const response = await api.get('/api/admin/invoice-transactions');
        setTransactions(response.data);
      } catch (fetchError) {
        console.error(fetchError);
        setError('Unable to load invoice transactions.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [isUnlocked]);

  useEffect(() => {
    if (!isUnlocked) return;

    const timeoutId = window.setTimeout(() => {
      sessionStorage.removeItem('invoiceLedgerUnlocked');
      setIsUnlocked(false);
      setPassword('');
      setError('The ledger was locked automatically after 5 minutes.');
    }, 5 * 60 * 1000);

    return () => window.clearTimeout(timeoutId);
  }, [isUnlocked]);

  const handleUnlock = (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== ledgerPassword) {
      setError('Incorrect ledger password.');
      return;
    }
    sessionStorage.setItem('invoiceLedgerUnlocked', 'true');
    setError('');
    setIsUnlocked(true);
  };

  const handleLedgerLogout = () => {
    sessionStorage.removeItem('invoiceLedgerUnlocked');
    setIsUnlocked(false);
    setPassword('');
    navigate('/admin');
  };

  const totalValue = transactions.reduce((sum, transaction) => sum + Number(transaction.grandTotal || 0), 0);
  const deletedInvoiceCount = transactions.filter(transaction => !transaction.invoiceExists).length;

  if (!isUnlocked) return (
    <div style={{ maxWidth: '460px', margin: '80px auto', textAlign: 'center' }}>
      <div className="glass-card" style={{ padding: '36px 32px' }}>
        <div style={{ width: '56px', height: '56px', margin: '0 auto 18px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', background: 'rgba(99,102,241,0.12)' }}>
          <LockKeyhole size={28} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Invoice Ledger Locked</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Enter the password to view invoice generation transactions.</p>
        <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            placeholder="Ledger password"
            autoFocus
            required
            style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
          />
          {error && <p style={{ color: 'var(--error)', fontSize: '13px', margin: 0 }}>{error}</p>}
          <button type="submit" style={{ padding: '12px', border: 'none', borderRadius: '8px', background: 'var(--primary)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Unlock Ledger</button>
        </form>
      </div>
    </div>
  );

  if (loading) return <div style={{ padding: '40px' }}>Loading invoice transactions...</div>;

  return (
    <div className="invoice-ledger-page">
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
        <div>
          <h1 className="responsive-h1" style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Invoice Generation Ledger</h1>
          <p style={{ color: 'var(--text-muted)' }}>Permanent records of every invoice generated, including deleted invoices.</p>
        </div>
        <div className="invoice-ledger-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => window.print()} title="Print all invoice transactions" aria-label="Print all invoice transactions" style={{ width: '38px', height: '38px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)', color: 'var(--primary)', cursor: 'pointer' }}>
            <Printer size={18} />
          </button>
          <button onClick={handleLedgerLogout} title="Logout from invoice ledger" aria-label="Logout from invoice ledger" style={{ width: '38px', height: '38px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', color: 'var(--error)', cursor: 'pointer' }}>
            <LogOut size={18} />
          </button>
          <div className="status-pill status-pill--live">
            <div className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            AUDIT LOG
          </div>
        </div>
      </header>

      {error && (
        <div style={{ marginBottom: '20px', padding: '14px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="invoice-ledger-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { icon: <History size={22} />, label: 'Generated Records', value: transactions.length, color: 'var(--primary)' },
          { icon: <IndianRupee size={22} />, label: 'Recorded Value', value: `₹${totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: 'var(--success)' },
          { icon: <Receipt size={22} />, label: 'Invoice Deleted', value: deletedInvoiceCount, color: '#F97316' },
        ].map(card => (
          <div key={card.label} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--hover)', color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {card.icon}
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>{card.label}</p>
              <p style={{ color: 'var(--text-main)', fontSize: '20px', fontWeight: 800 }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <History size={20} color="var(--primary)" />
          <h3 style={{ fontWeight: 700, fontSize: '18px' }}>All Invoice Generation Transactions</h3>
          <span style={{ marginLeft: 'auto', color: 'var(--primary)', fontWeight: 700 }}>{transactions.length}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 20px' }}>Generated</th>
                <th style={{ padding: '14px 20px' }}>Invoice No.</th>
                <th style={{ padding: '14px 20px' }}>Customer</th>
                <th style={{ padding: '14px 20px' }}>Items</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Taxable</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>IGST</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Total</th>
                <th style={{ padding: '14px 20px' }}>Invoice Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 20px', fontSize: '13px', whiteSpace: 'nowrap' }}>{new Date(transaction.generatedAt || transaction.createdAt).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--primary)' }}>{transaction.invoiceNo}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 700 }}>{transaction.customerName}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{transaction.placeOfSupply || '-'}</div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>{transaction.items?.length || 0}</td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>₹{Number(transaction.totalTaxableValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>₹{Number(transaction.totalIgst || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 800 }}>₹{Number(transaction.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ display: 'inline-block', padding: '5px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, color: transaction.invoiceExists ? '#047857' : '#B45309', background: transaction.invoiceExists ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.14)' }}>
                      {transaction.invoiceExists ? 'Invoice exists' : 'Invoice deleted'}
                    </span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>No invoice transactions have been recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminInvoiceTransactionsPage;

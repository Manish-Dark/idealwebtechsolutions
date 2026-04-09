import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, LogIn, LogOut, Activity, Calendar, Clock, AlertCircle, Sun, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchAttendanceData = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const [attRes, leavesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/users/attendance?t=${Date.now()}`, config),
        axios.get(`http://localhost:5000/api/users/leaves?t=${Date.now()}`, config).catch(() => ({ data: [] }))
      ]);
      const historyData = attRes.data;
      const leavesData = leavesRes.data || [];
      setLeaves(leavesData);
      
      if (Array.isArray(historyData)) {
        let mergedHistory = [...historyData];

        const approvedLeaves = leavesData.filter((l: any) => l.status === 'Approved');
        approvedLeaves.forEach((l: any) => {
          let d = new Date(l.startDate);
          const end = new Date(l.endDate);
          while (d <= end) {
            const exists = mergedHistory.some(h => {
              const hDate = new Date(h.date);
              return hDate.getDate() === d.getDate() && hDate.getMonth() === d.getMonth() && hDate.getFullYear() === d.getFullYear();
            });
            if (!exists) {
              mergedHistory.push({
                _id: 'leave-' + Math.random().toString(),
                date: d.toISOString(),
                status: 'Absent / On Leave',
                checkIn: null,
                checkOut: null,
              });
            }
            d.setDate(d.getDate() + 1);
          }
        });

        // Ensure chronological order descending
        mergedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setHistory(mergedHistory);

        const today = new Date();
        const todayRecord = historyData.find((a: any) => {
          if (!a || !a.date) return false;
          const d = new Date(a.date);
          return d.getDate() === today.getDate() && 
                 d.getMonth() === today.getMonth() && 
                 d.getFullYear() === today.getFullYear();
        });
        setTodayAttendance(todayRecord);
      } else {
        setHistory([]);
        setTodayAttendance(null);
      }
    } catch (err) {
      console.error('Fetch Attendance Error:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchAttendanceData();
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [fetchAttendanceData]);

  const handleAttendance = async (type: 'check-in' | 'check-out') => {
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      
      let location = null;
      if (navigator.geolocation) {
        try {
          const pos: any = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
          location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } catch (e) {
          console.warn('Location access denied');
        }
      }

      await axios.post('http://localhost:5000/api/users/attendance', { type, location }, config);
      alert(`${type === 'check-in' ? 'Clocked In' : 'Clocked Out'} Successfully!`);
      fetchAttendanceData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update attendance');
    }
  };

  const calculateHours = (cin: string, cout: string) => {
    if (!cin || !cout) return '---';
    const diff = new Date(cout).getTime() - new Date(cin).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const filteredHistory = history.filter(record => {
    if (!fromDate && !toDate) return true;
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);
    const start = fromDate ? new Date(fromDate).getTime() : -Infinity;
    const end = toDate ? new Date(toDate).getTime() : Infinity;
    return recordDate.getTime() >= start && recordDate.getTime() <= end;
  });

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('My Attendance History', 14, 15);
    
    const tableData = filteredHistory.map((record: any) => [
      new Date(record.date).toLocaleDateString(),
      record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '---',
      record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--',
      record.status,
      calculateHours(record.checkIn, record.checkOut)
    ]);

    autoTable(doc, {
      head: [['Date', 'Check In', 'Check Out', 'Status', 'Hours']],
      body: tableData,
      startY: 20,
      theme: 'grid',
      headStyles: { fillColor: [0, 102, 255] }
    });

    doc.save('Attendance_History.pdf');
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const presentCount = history.filter(h => {
    const d = new Date(h.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && h.checkIn;
  }).length;

  const lateCount = history.filter(h => {
    const d = new Date(h.date);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear && h.checkIn) {
      const checkInTime = new Date(h.checkIn);
      const isAfter10am = checkInTime.getHours() > 10 || (checkInTime.getHours() === 10 && checkInTime.getMinutes() > 0);
      const isBefore12pm = checkInTime.getHours() < 12;
      return isAfter10am && isBefore12pm;
    }
    return false;
  }).length;

  const halfDayCount = history.filter(h => {
    const d = new Date(h.date);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear && h.checkIn) {
      const checkInTime = new Date(h.checkIn);
      const isAfter12pm = checkInTime.getHours() >= 12;
      
      let durationLessThan5 = false;
      if (h.checkOut) {
        const diff = new Date(h.checkOut).getTime() - new Date(h.checkIn).getTime();
        durationLessThan5 = (diff / (1000 * 60 * 60)) < 5;
      }
      
      return isAfter12pm || durationLessThan5;
    }
    return false;
  }).length;

  const absentCount = leaves.filter(l => l.status === 'Approved').reduce((acc, l) => {
    let count = 0;
    let d = new Date(l.startDate);
    const end = new Date(l.endDate);
    while (d <= end) {
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        count++;
      }
      d.setDate(d.getDate() + 1);
    }
    return acc + count;
  }, 0);

  return (
    <div style={{ padding: '40px' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Attendance Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>{currentTime.toLocaleTimeString()} | {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {!todayAttendance ? (
            <button 
              onClick={() => handleAttendance('check-in')}
              style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(0, 102, 255, 0.3)' }}
            >
              <LogIn size={20} />
              Check In
            </button>
          ) : !todayAttendance.checkOut ? (
            <button 
              onClick={() => handleAttendance('check-out')}
              style={{ backgroundColor: 'var(--error)', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}
            >
              <LogOut size={20} />
              Check Out
            </button>
          ) : (
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={20} />
              Day Completed
            </div>
          )}
        </div>
      </header>

      {/* 4 Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sun size={24} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Present</p>
            <h3 style={{ fontSize: '28px', fontWeight: 800 }}>{presentCount}</h3>
          </div>
        </div>
        
        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={24} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Absent / Leave</p>
            <h3 style={{ fontSize: '28px', fontWeight: 800 }}>{absentCount}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Late Marks</p>
            <h3 style={{ fontSize: '28px', fontWeight: 800 }}>{lateCount}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(0, 102, 255, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Half Days</p>
            <h3 style={{ fontSize: '28px', fontWeight: 800 }}>{halfDayCount}</h3>
          </div>
        </div>
      </div>

      {/* Status Detail Card */}
      <div className="glass-card" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '32px' }}>
        <div style={{ display: 'flex', gap: '40px' }}>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>My Status</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: todayAttendance && !todayAttendance.checkOut ? 'var(--success)' : 'var(--text-muted)' }}></div>
              <span style={{ fontWeight: 700, fontSize: '18px' }}>{todayAttendance && !todayAttendance.checkOut ? 'On Duty' : 'Off Duty'}</span>
            </div>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Check In</p>
            <p style={{ fontWeight: 700, fontSize: '18px' }}>{todayAttendance?.checkIn ? new Date(todayAttendance.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Check Out</p>
            <p style={{ fontWeight: 700, fontSize: '18px' }}>{todayAttendance?.checkOut ? new Date(todayAttendance.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Duration Today</p>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)' }}>{calculateHours(todayAttendance?.checkIn, todayAttendance?.checkOut)}</h2>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '0' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Attendance History</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>From:</label>
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '13px' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>To:</label>
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '13px' }}
              />
            </div>
            <button 
              onClick={exportPDF}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}
            >
              <Download size={16} />
              Export PDF
            </button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px 24px' }}>Date</th>
                <th style={{ padding: '16px 24px' }}>Check In</th>
                <th style={{ padding: '16px 24px' }}>Check Out</th>
                <th style={{ padding: '16px 24px' }}>Status</th>
                <th style={{ padding: '16px 24px' }}>Hours Worked</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((record: any) => (
                <tr key={record._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 600 }}>{new Date(record.date).toLocaleDateString()}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--success)' }}>{record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '---'}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--error)' }}>{record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ backgroundColor: 'rgba(0,0,0,0.05)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>{record.status}</span>
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 700 }}>{calculateHours(record.checkIn, record.checkOut)}</td>
                </tr>
              ))}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;

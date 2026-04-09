import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Calendar, Droplet, UserPlus, Lock, Key, CheckCircle, X } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/users/profile', config);
        setProfile(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [user]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      await axios.put('http://localhost:5000/api/users/profile/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }, config);
      alert('Password updated successfully!');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update password');
    }
  };

  if (!profile) return <div style={{ padding: '40px' }}>Loading...</div>;

  return (
    <div style={{ padding: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700 }}>My Profile</h1>
        <button 
           onClick={() => setShowPasswordModal(true)}
           style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', fontWeight: 600 }}
        >
          <Lock size={18} />
          Change Password
        </button>
      </div>
      
      <div className="glass-card" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px', paddingBottom: '32px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 700 }}>
            {profile.name.charAt(0)}
          </div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>{profile.name}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{profile.designation || 'Staff'} | {profile.department || 'General'} • {profile.role.toUpperCase()}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             <h3 style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Work Information</h3>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <Mail size={20} color="var(--primary)" />
               <div>
                 <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email Address</p>
                 <p style={{ fontWeight: 500 }}>{profile.email}</p>
               </div>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <UserPlus size={20} color="var(--primary)" />
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Joining Date</p>
                  <p style={{ fontWeight: 500 }}>{profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'Not provided'}</p>
                </div>
              </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <Phone size={20} color="var(--primary)" />
               <div>
                 <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Contact Number</p>
                 <p style={{ fontWeight: 500 }}>{profile.contactNumber || 'Not provided'}</p>
               </div>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <MapPin size={20} color="var(--primary)" />
               <div>
                 <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Residential Address</p>
                 <p style={{ fontWeight: 500 }}>{profile.address || 'Not provided'}</p>
               </div>
             </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '14px', color: 'var(--error)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personal Information</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <Calendar size={20} color="var(--primary)" />
               <div>
                 <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Date of Birth</p>
                 <p style={{ fontWeight: 500 }}>{profile.dob ? new Date(profile.dob).toLocaleDateString() : 'Not provided'}</p>
               </div>
             </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <User size={20} color="var(--primary)" />
               <div>
                 <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Father's Name</p>
                 <p style={{ fontWeight: 500 }}>{profile.fatherName || 'Not provided'}</p>
               </div>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <Droplet size={20} color="var(--error)" />
               <div>
                 <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Blood Group</p>
                 <p style={{ fontWeight: 500 }}>{profile.bloodGroup || 'Not provided'}</p>
               </div>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <Phone size={20} color="var(--error)" />
               <div>
                 <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Emergency Contact</p>
                 <p style={{ fontWeight: 500 }}>{profile.urgentContactNumber || 'Not provided'}</p>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', margin: '20px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Key size={24} color="var(--primary)" />
                <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Security Settings</h3>
              </div>
              <button onClick={() => setShowPasswordModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <form onSubmit={handlePasswordSubmit} style={{ display: 'grid', gap: '20px' }}>
               <div>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', fontWeight: 600 }}>Current Password</label>
                  <input 
                    type="password" 
                    required 
                    value={passwordForm.currentPassword} 
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})} 
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)' }} 
                  />
               </div>
               <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '10px 0' }}></div>
               <div>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', fontWeight: 600 }}>New Password</label>
                  <input 
                    type="password" 
                    required 
                    value={passwordForm.newPassword} 
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)' }} 
                  />
               </div>
               <div>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '8px', fontWeight: 600 }}>Confirm New Password</label>
                  <input 
                    type="password" 
                    required 
                    value={passwordForm.confirmPassword} 
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)' }} 
                  />
               </div>

               <button type="submit" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '14px', borderRadius: '10px', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                 <CheckCircle size={20} />
                 Update Password
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

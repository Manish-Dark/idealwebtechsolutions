import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Lock, User as UserIcon, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/api/users/login', { email: loginId, password });
      login(data);
      navigate(data.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(145deg, #EEF2FF 0%, #F5F3FF 50%, #EDE9FE 100%)',
      padding: '20px',
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'fixed', top: '-80px', left: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-60px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.07), transparent)', pointerEvents: 'none' }} />

      <div className="animate-scale" style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '28px',
        padding: '48px 44px',
        boxShadow: '0 12px 48px rgba(99,102,241,0.10), 0 2px 8px rgba(99,102,241,0.06)',
        border: '1px solid rgba(99,102,241,0.12)',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 28px rgba(99,102,241,0.38)',
          }}>
            <Lock size={24} color="white" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#000000', marginBottom: '6px', letterSpacing: '-0.5px' }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Sign in to your CMS account</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'var(--error-light)', color: 'var(--error)',
            padding: '12px 16px', borderRadius: '12px', marginBottom: '24px',
            fontSize: '14px', border: '1px solid rgba(220,38,38,0.18)', fontWeight: 500,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Employee ID */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#64748B', marginBottom: '8px' }}>
              EMPLOYEE ID
            </label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
              <input
                type="text"
                name="email"
                autoComplete="username"
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                placeholder="ADM001 or PI001"
                required
                style={{ 
                  width: '100%', 
                  paddingLeft: '44px', 
                  height: '52px', 
                  borderRadius: '16px', 
                  fontSize: '15px', 
                  border: '1.5px solid #E2E8F0', 
                  background: '#F8FAFF', 
                  color: '#1E293B',
                  transition: 'all 0.2s ease',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#64748B', marginBottom: '8px' }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ 
                  width: '100%', 
                  paddingLeft: '44px', 
                  paddingRight: '44px', 
                  height: '52px', 
                  borderRadius: '16px', 
                  fontSize: '15px', 
                  border: '1.5px solid #E2E8F0', 
                  background: '#F8FAFF', 
                  color: '#1E293B',
                  transition: 'all 0.2s ease',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px', display: 'flex', alignItems: 'center' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Sign in button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#A5B4FC' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: 'white',
              padding: '14px 20px',
              borderRadius: '13px',
              fontWeight: 700,
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(99,102,241,0.38)',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '6px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
          >
            {loading
              ? <><Loader2 className="animate-spin" size={19} /> Signing in...</>
              : <>Sign In <ArrowRight size={18} /></>
            }
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: 'var(--text-muted)' }}>
          Default password:&nbsp;
          <code style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 9px', borderRadius: '7px', fontWeight: 700 }}>
            Pitech@123
          </code>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

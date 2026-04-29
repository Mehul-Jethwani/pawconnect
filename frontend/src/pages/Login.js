import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { setToken, setUser } from '../utils/auth';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleQuickLogin = async (email, password) => {
    setFormData({ email, password });
    // We call a separate internal login function or use the same logic
    setLoading(true);
    setError('');
    try {
      const response = await API.post('/auth/login', { email, password });
      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      if (user.role === 'USER') navigate('/');
      else if (user.role === 'STORE_OWNER') navigate('/store-dashboard');
      else if (user.role === 'SERVICE_PROVIDER') navigate('/service-dashboard');
      else if (user.role === 'ADMIN') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await API.post('/auth/login', formData);
      const { token, user } = response.data;
      
      setToken(token);
      setUser(user);
      
      if (user.role === 'USER') navigate('/');
      else if (user.role === 'STORE_OWNER') navigate('/store-dashboard');
      else if (user.role === 'SERVICE_PROVIDER') navigate('/service-dashboard');
      else if (user.role === 'ADMIN') navigate('/admin');
      else navigate('/');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    console.log("Google Auth Clicked");
  };

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh' }}>
      <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Welcome Back</h2>
        <p className="mb-4" style={{ color: 'var(--muted-text)' }}>Log in to access your account.</p>
        
        <div style={{ border: '1px solid var(--border)', padding: '2.5rem', borderRadius: '12px', backgroundColor: 'var(--card)', textAlign: 'left', boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}>
          {error && (
            <div style={{ 
              backgroundColor: error === 'Account pending admin approval' ? 'rgba(74,222,128,0.10)' : 'rgba(248,113,113,0.14)', 
              color: error === 'Account pending admin approval' ? 'var(--accent)' : 'var(--danger)', 
              border: `1px solid ${error === 'Account pending admin approval' ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
              padding: '0.8rem', 
              borderRadius: '8px', 
              marginBottom: '1rem', 
              fontSize: '0.95rem',
              fontWeight: '500'
            }}>
              {error === 'Account pending admin approval' 
                ? 'Your account is pending admin approval. Please wait for an administrator to approve your account before logging in.'
                : error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--muted-text)' }}>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter your email" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1rem', background: 'var(--surface)', color: 'var(--text-color)' }} />
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--muted-text)' }}>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Enter your password" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1rem', background: 'var(--surface)', color: 'var(--text-color)' }} />
            </div>
            
            <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
              <a href="#forgot" onClick={(e) => e.preventDefault()} style={{ fontSize: '0.9rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '600' }}>Forgot Password?</a>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', fontSize: '1.1rem', marginBottom: '1rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            
            <button type="button" onClick={handleGoogleAuth} style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: '500', transition: 'background-color 0.2s', color: 'var(--text-color)' }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" style={{ width: '20px', marginRight: '10px' }} />
              Continue with Google
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.95rem' }}>
            <span style={{ color: 'var(--muted-text)' }}>Don't have an account? </span>
            <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>Sign up</Link>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--hint-text)', marginBottom: '1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Quick Login (Demo)</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
              <button onClick={() => handleQuickLogin('user@bangalore.com', 'password123')} style={quickBtnStyle}>👤 User</button>
              <button onClick={() => handleQuickLogin('owner_store1bangalore@pawconnect.com', 'password123')} style={quickBtnStyle}>🏪 Pet Store</button>
              <button onClick={() => handleQuickLogin('vet1@bangalore.com', 'password123')} style={quickBtnStyle}>🩺 Vet</button>
              <button onClick={() => handleQuickLogin('training1@bangalore.com', 'password123')} style={quickBtnStyle}>🦮 Training</button>
              <button onClick={() => handleQuickLogin('grooming1@bangalore.com', 'password123')} style={quickBtnStyle}>✂️ Grooming</button>
              <button onClick={() => handleQuickLogin('boarding1@bangalore.com', 'password123')} style={quickBtnStyle}>🏠 Boarding</button>
              <button onClick={() => handleQuickLogin('admin@pawconnect.com', 'password123')} style={{ ...quickBtnStyle, gridColumn: 'span 2', backgroundColor: 'rgba(255,255,255,0.06)' }}>🔒 Admin</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const quickBtnStyle = {
  padding: '0.6rem',
  fontSize: '0.85rem',
  backgroundColor: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  fontWeight: '500',
  color: 'var(--muted-text)'
};

export default Login;

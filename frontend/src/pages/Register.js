import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [storeData, setStoreData] = useState({ storeName: '', storeAddress: '', cityId: '' });
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalRole, setApprovalRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (formData.role === 'STORE_OWNER' || formData.role === 'SERVICE_PROVIDER') {
      API.get('/cities')
        .then(res => setCities(res.data))
        .catch(() => setCities([]));
    }
  }, [formData.role]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleStoreChange = (e) => setStoreData({ ...storeData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const payload = { ...formData };
    if (formData.role === 'STORE_OWNER' || formData.role === 'SERVICE_PROVIDER') {
      Object.assign(payload, storeData);
    }

    try {
      await API.post('/auth/signup', payload);
      if (formData.role === 'STORE_OWNER' || formData.role === 'SERVICE_PROVIDER') {
        setApprovalRole(formData.role);
        setShowApprovalModal(true);
      } else {
        setSuccess('Account created successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong during signup.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.8rem', borderRadius: '8px',
    border: '1px solid var(--border)', fontSize: '1rem',
    boxSizing: 'border-box', background: 'var(--surface)', color: 'var(--text-color)'
  };
  const labelStyle = { display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--muted-text)' };
  const groupStyle = { marginBottom: '1.2rem' };

  const roleLabel = approvalRole === 'STORE_OWNER' ? 'Pet Store Owner' : 'Service Provider';
  const roleIcon = approvalRole === 'STORE_OWNER' ? '🏪' : '🏥';

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh' }}>

      {/* ── Approval Pending Modal ── */}
      {showApprovalModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem'
        }}>
          <div style={{
            background: 'var(--card)', borderRadius: '28px', padding: '3rem', maxWidth: '480px', width: '100%',
            border: '1px solid var(--border)', boxShadow: '0 30px 80px rgba(0,0,0,0.5)', textAlign: 'center'
          }}>
            {/* Role icon */}
            <div style={{
              width: '90px', height: '90px', borderRadius: '50%',
              background: 'rgba(74,222,128,0.12)', border: '2px solid rgba(74,222,128,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem', fontSize: '3rem',
              boxShadow: '0 0 0 10px rgba(74,222,128,0.05), 0 10px 30px rgba(74,222,128,0.15)'
            }}>
              {roleIcon}
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-color)', margin: '0 0 0.5rem' }}>
              Registration Submitted! 🎉
            </h2>
            <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1rem', margin: '0 0 2rem' }}>
              {roleLabel} Account Created
            </p>

            <div style={{
              background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)',
              borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.2rem' }}>
                <span style={{ fontSize: '1.4rem', flexShrink: 0, lineHeight: 1 }}>📋</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-color)', marginBottom: '0.25rem', fontSize: '0.95rem' }}>
                    Request Sent to Admin
                  </p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted-text)', lineHeight: 1.5 }}>
                    Your {roleLabel.toLowerCase()} account is now under review. The admin team will verify your business details.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.2rem' }}>
                <span style={{ fontSize: '1.4rem', flexShrink: 0, lineHeight: 1 }}>🔔</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-color)', marginBottom: '0.25rem', fontSize: '0.95rem' }}>
                    You'll Be Notified Once Approved
                  </p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted-text)', lineHeight: 1.5 }}>
                    Once approved, a notification will appear and you'll be able to log in and access your dashboard.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <span style={{ fontSize: '1.4rem', flexShrink: 0, lineHeight: 1 }}>⏳</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-color)', marginBottom: '0.25rem', fontSize: '0.95rem' }}>
                    Login Only After Approval
                  </p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted-text)', lineHeight: 1.5 }}>
                    You <strong>cannot log in</strong> until the admin approves your account. Please check back after a short while.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem', marginBottom: '1rem' }}
            >
              Got it — Go to Login
            </button>
            <p style={{ fontSize: '0.8rem', color: 'var(--hint-text)', margin: 0 }}>
              Your account details have been saved. Come back after admin approval.
            </p>
          </div>
        </div>
      )}

      <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Create an Account</h2>
        <p className="mb-4" style={{ color: 'var(--muted-text)' }}>Join PawConnect today.</p>

        <div style={{
          border: '1px solid var(--border)', padding: '2.5rem', borderRadius: '16px',
          backgroundColor: 'var(--card)', textAlign: 'left', boxShadow: '0 8px 32px rgba(0,0,0,0.35)'
        }}>
          {error && (
            <div style={{
              backgroundColor: 'rgba(248,113,113,0.14)', color: 'var(--danger)',
              border: '1px solid rgba(248,113,113,0.25)', padding: '0.8rem',
              borderRadius: '8px', marginBottom: '1rem', fontSize: '0.95rem'
            }}>{error}</div>
          )}
          {success && (
            <div style={{
              backgroundColor: 'rgba(74,222,128,0.10)', color: 'var(--accent)',
              border: '1px solid rgba(74,222,128,0.25)', padding: '0.8rem',
              borderRadius: '8px', marginBottom: '1rem', fontSize: '0.95rem'
            }}>{success}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={groupStyle}>
              <label style={labelStyle}>Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter your full name" style={inputStyle} />
            </div>
            <div style={groupStyle}>
              <label style={labelStyle}>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter your email" style={inputStyle} />
            </div>
            <div style={groupStyle}>
              <label style={labelStyle}>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Create a password" style={inputStyle} />
            </div>
            <div style={{ ...groupStyle, marginBottom: '1.5rem' }}>
              <label style={labelStyle}>I am a...</label>
              <select name="role" value={formData.role} onChange={handleChange} style={inputStyle}>
                <option value="USER">Pet Lover / Adopter</option>
                <option value="STORE_OWNER">Store Owner</option>
                <option value="SERVICE_PROVIDER">Service Provider (Vet/Groomer)</option>
              </select>
            </div>

            {/* Admin approval pre-warning for business roles */}
            {(formData.role === 'STORE_OWNER' || formData.role === 'SERVICE_PROVIDER') && (
              <div style={{
                marginBottom: '1.5rem', padding: '1rem',
                backgroundColor: 'rgba(251,191,36,0.08)', borderRadius: '10px',
                border: '1px solid rgba(251,191,36,0.3)',
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start'
              }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>⚠️</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted-text)', lineHeight: 1.5 }}>
                  <strong style={{ color: '#fbbf24' }}>Admin Approval Required: </strong>
                  {formData.role === 'STORE_OWNER' ? 'Store Owner' : 'Service Provider'} accounts
                  require admin approval before you can log in. You'll get a notification once approved.
                </p>
              </div>
            )}

            {/* Extra fields for Store Owners */}
            {formData.role === 'STORE_OWNER' && (
              <div style={{ marginBottom: '1.5rem', padding: '1.2rem', backgroundColor: 'rgba(74,222,128,0.08)', borderRadius: '10px', border: '1px solid rgba(74,222,128,0.22)' }}>
                <p style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--accent)', fontSize: '0.95rem' }}>🏪 Store Details</p>
                <div style={groupStyle}>
                  <label style={labelStyle}>Store Name</label>
                  <input type="text" name="storeName" value={storeData.storeName} onChange={handleStoreChange} required placeholder="e.g. Happy Paws Pet Shop" style={inputStyle} />
                </div>
                <div style={groupStyle}>
                  <label style={labelStyle}>Store Address</label>
                  <input type="text" name="storeAddress" value={storeData.storeAddress} onChange={handleStoreChange} required placeholder="e.g. 12, MG Road, Sector 5" style={inputStyle} />
                </div>
                <div style={{ marginBottom: 0 }}>
                  <label style={labelStyle}>City</label>
                  <select name="cityId" value={storeData.cityId} onChange={handleStoreChange} required style={inputStyle}>
                    <option value="">Select your city</option>
                    {cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Extra fields for Service Providers */}
            {formData.role === 'SERVICE_PROVIDER' && (
              <div style={{ marginBottom: '1.5rem', padding: '1.2rem', backgroundColor: 'rgba(74,222,128,0.06)', borderRadius: '10px', border: '1px solid rgba(74,222,128,0.18)' }}>
                <p style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--accent)', fontSize: '0.95rem' }}>🏥 Service Provider Details</p>
                <div style={groupStyle}>
                  <label style={labelStyle}>Business / Clinic Name</label>
                  <input type="text" name="storeName" value={storeData.storeName} onChange={handleStoreChange} required placeholder="e.g. City Vet Clinic" style={inputStyle} />
                </div>
                <div style={groupStyle}>
                  <label style={labelStyle}>Service Type</label>
                  <select name="serviceType" onChange={(e) => setStoreData({ ...storeData, serviceType: e.target.value })} required style={inputStyle}>
                    <option value="">Select Service Type</option>
                    <option value="VET">Veterinary Clinic</option>
                    <option value="GROOMING">Grooming Center</option>
                    <option value="TRAINING">Pet Training</option>
                    <option value="BOARDING">Pet Boarding</option>
                  </select>
                </div>
                <div style={groupStyle}>
                  <label style={labelStyle}>Address</label>
                  <input type="text" name="storeAddress" value={storeData.storeAddress} onChange={handleStoreChange} required placeholder="e.g. 45, Park Avenue" style={inputStyle} />
                </div>
                <div style={{ marginBottom: 0 }}>
                  <label style={labelStyle}>City</label>
                  <select name="cityId" value={storeData.cityId} onChange={handleStoreChange} required style={inputStyle}>
                    <option value="">Select your city</option>
                    {cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', fontSize: '1.1rem', marginBottom: '1rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.95rem' }}>
            <span style={{ color: 'var(--muted-text)' }}>Already have an account? </span>
            <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' }}>Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

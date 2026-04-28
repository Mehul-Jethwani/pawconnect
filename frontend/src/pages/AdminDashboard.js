import React, { useState, useEffect } from 'react';
import API from '../services/api';

const roleLabel = {
  STORE_OWNER: 'Store Owner',
  SERVICE_PROVIDER: 'Service Provider',
  USER: 'Pet Lover'
};

const roleBadgeStyle = {
  STORE_OWNER: { backgroundColor: 'rgba(74,222,128,0.12)', color: 'var(--accent)', border: '1px solid rgba(74,222,128,0.25)' },
  SERVICE_PROVIDER: { backgroundColor: 'rgba(56,189,248,0.14)', color: '#7dd3fc', border: '1px solid rgba(56,189,248,0.25)' },
  USER: { backgroundColor: 'rgba(168,85,247,0.14)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.25)' }
};

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchPendingUsers(); }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await API.get('/admin/pending-users');
      setPendingUsers(response.data);
    } catch (err) {
      console.error('Error fetching pending users:', err);
      setError('Failed to load pending users.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await API.patch(`/admin/approve-user/${id}`);
      setPendingUsers(pendingUsers.filter(user => user.id !== id));
    } catch (err) {
      console.error('Error approving user:', err);
      alert('Failed to approve user.');
    }
  };

  const th = { padding: '0.85rem 1rem', textAlign: 'left', fontWeight: '600', whiteSpace: 'nowrap' };
  const td = { padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', color: 'var(--text-color)' };

  return (
    <div className="page-container" style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <h1>Admin Dashboard</h1>
      <p style={{ color: 'var(--muted-text)' }}>Review and approve pending Store Owner accounts.</p>

      <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        Pending Approvals
        {!loading && pendingUsers.length > 0 && (
          <span style={{ marginLeft: '0.75rem', backgroundColor: 'rgba(248,113,113,0.14)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '9999px', padding: '0.2rem 0.65rem', fontSize: '0.85rem', fontWeight: '700' }}>
            {pendingUsers.length}
          </span>
        )}
      </h2>

      {loading ? (
        <p>Loading pending users...</p>
      ) : error ? (
        <p style={{ color: 'var(--danger)' }}>{error}</p>
      ) : pendingUsers.length === 0 ? (
        <div style={{ padding: '2.5rem', backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'center' }}>
          <span style={{ fontSize: '2.5rem' }}>✅</span>
          <p style={{ fontSize: '1.1rem', color: 'var(--muted-text)', marginTop: '0.75rem' }}>All caught up — no pending approvals.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '12px', boxShadow: '0 10px 28px rgba(0,0,0,0.22)', border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--card)' }}>
            <thead style={{ backgroundColor: 'var(--surface)', color: 'var(--text-color)' }}>
              <tr>
                <th style={th}>#</th>
                <th style={th}>Full Name</th>
                <th style={th}>Email Address</th>
                <th style={th}>Role</th>
                <th style={th}>Store Name</th>
                <th style={th}>Store Address</th>
                <th style={th}>City</th>
                <th style={th}>Registered On</th>
                <th style={{ ...th, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((user, idx) => (
                <tr key={user.id} style={{ backgroundColor: idx % 2 === 0 ? 'var(--card)' : 'var(--surface)' }}>
                  <td style={{ ...td, color: 'var(--hint-text)', fontSize: '0.85rem' }}>{idx + 1}</td>
                  <td style={{ ...td, fontWeight: '600' }}>{user.name}</td>
                  <td style={{ ...td, color: 'var(--muted-text)' }}>{user.email}</td>
                  <td style={td}>
                    <span style={{
                      ...(roleBadgeStyle[user.role] || {}),
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.82rem',
                      fontWeight: '600'
                    }}>
                      {roleLabel[user.role] || user.role}
                    </span>
                  </td>
                  <td style={td}>{user.storeName || <span style={{ color: 'var(--hint-text)' }}>—</span>}</td>
                  <td style={{ ...td, fontSize: '0.9rem', color: 'var(--muted-text)' }}>{user.storeAddress || <span style={{ color: 'var(--hint-text)' }}>—</span>}</td>
                  <td style={td}>
                    {user.storeCity
                      ? <span style={{ backgroundColor: 'rgba(74,222,128,0.10)', color: 'var(--accent)', border: '1px solid rgba(74,222,128,0.25)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '500' }}>{user.storeCity}</span>
                      : <span style={{ color: 'var(--hint-text)' }}>—</span>
                    }
                  </td>
                  <td style={{ ...td, fontSize: '0.85rem', color: 'var(--hint-text)' }}>
                    {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <button
                      onClick={() => handleApprove(user.id)}
                      className="btn btn-primary"
                      style={{ padding: '0.45rem 1.1rem', fontSize: '0.9rem', borderRadius: '6px' }}
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

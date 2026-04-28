import React, { useState, useEffect } from 'react';
import API from '../services/api';
import './StoreDashboard.css'; 

const Appointments = () => {
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments', 'boarding', 'training'
  const [appointments, setAppointments] = useState([]);
  const [boarding, setBoarding] = useState([]);
  const [training, setTraining] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [appRes, boardRes, trainRes] = await Promise.all([
          API.get('/appointment/my'),
          API.get('/boarding/my'),
          API.get('/training/my')
        ]);
        setAppointments(appRes.data);
        setBoarding(boardRes.data);
        setTraining(trainRes.data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING': return <span className="sd-badge-status sd-status-pending">⏳ Pending</span>;
      case 'ACCEPTED': return <span className="sd-badge-status sd-status-accepted">✅ Confirmed</span>;
      case 'REJECTED': return <span className="sd-badge-status sd-status-rejected">❌ Declined</span>;
      default: return <span className="sd-badge-status">{status}</span>;
    }
  };

  if (loading) return <div className="page-container text-center" style={{padding: '5rem'}}>
    <div className="premium-spinner"></div>
    <p>Retrieving your booking history...</p>
  </div>;

  return (
    <div className="page-container" style={{padding: '2rem', maxWidth: '1100px'}}>
      <div style={{marginBottom: '3rem', textAlign: 'center'}}>
        <h1 style={{fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-color)', marginBottom: '0.5rem'}}>My Pet Bookings</h1>
        <p style={{color: 'var(--muted-text)'}}>Track all your appointments, stays, and training sessions in one place.</p>
      </div>

      {/* Modern Tabs */}
      <div style={{display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2.5rem', background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '16px', maxWidth: '600px', margin: '0 auto 2.5rem'}}>
        <button 
          onClick={() => setActiveTab('appointments')}
          style={{flex: 1, padding: '0.8rem', borderRadius: '12px', border: 'none', background: activeTab === 'appointments' ? 'var(--card)' : 'transparent', boxShadow: activeTab === 'appointments' ? '0 4px 18px rgba(0,0,0,0.25)' : 'none', color: activeTab === 'appointments' ? 'var(--accent)' : 'var(--muted-text)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'}}
        >
          🏥 Clinic & Spa
        </button>
        <button 
          onClick={() => setActiveTab('boarding')}
          style={{flex: 1, padding: '0.8rem', borderRadius: '12px', border: 'none', background: activeTab === 'boarding' ? 'var(--card)' : 'transparent', boxShadow: activeTab === 'boarding' ? '0 4px 18px rgba(0,0,0,0.25)' : 'none', color: activeTab === 'boarding' ? 'var(--accent)' : 'var(--muted-text)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'}}
        >
          🏠 Stays
        </button>
        <button 
          onClick={() => setActiveTab('training')}
          style={{flex: 1, padding: '0.8rem', borderRadius: '12px', border: 'none', background: activeTab === 'training' ? 'var(--card)' : 'transparent', boxShadow: activeTab === 'training' ? '0 4px 18px rgba(0,0,0,0.25)' : 'none', color: activeTab === 'training' ? 'var(--accent)' : 'var(--muted-text)', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'}}
        >
          🎓 Training
        </button>
      </div>

      <div className="bounce-in">
        {activeTab === 'appointments' && (
          <BookingTable 
            data={appointments} 
            type="Clinic" 
            columns={['Service', 'Provider', 'Date & Time', 'Status']} 
            renderRow={(app) => (
              <tr key={app.id}>
                <td style={{fontWeight: 700, color: 'var(--text-color)'}}>{app.service?.name}</td>
                <td>{app.provider?.name}</td>
                <td style={{fontSize: '0.9rem'}}>{new Date(app.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                <td>{getStatusBadge(app.status)}</td>
              </tr>
            )}
          />
        )}

        {activeTab === 'boarding' && (
          <BookingTable 
            data={boarding} 
            type="Boarding" 
            columns={['Pet', 'Facility', 'Check-in / Out', 'Price', 'Status']} 
            renderRow={(b) => (
              <tr key={b.id}>
                <td style={{fontWeight: 700, color: 'var(--text-color)'}}>🐾 {b.userPet?.name}</td>
                <td>{b.provider?.name}</td>
                <td style={{fontSize: '0.9rem'}}>
                  <div>{new Date(b.startDate).toLocaleDateString()}</div>
                  <div style={{color: 'var(--hint-text)', fontSize: '0.75rem'}}>to {new Date(b.endDate).toLocaleDateString()}</div>
                </td>
                <td style={{fontWeight: 600, color: 'var(--accent)'}}>₹{b.totalPrice}</td>
                <td>{getStatusBadge(b.status)}</td>
              </tr>
            )}
          />
        )}

        {activeTab === 'training' && (
          <BookingTable 
            data={training} 
            type="Training" 
            columns={['Pet', 'Academy', 'Session Date', 'Price', 'Status']} 
            renderRow={(t) => (
              <tr key={t.id}>
                <td style={{fontWeight: 700, color: 'var(--text-color)'}}>🐾 {t.userPet?.name}</td>
                <td>{t.provider?.name}</td>
                <td style={{fontSize: '0.9rem'}}>{new Date(t.sessionDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</td>
                <td style={{fontWeight: 600, color: 'var(--accent)'}}>₹{t.pricePerSession}</td>
                <td>{getStatusBadge(t.status)}</td>
              </tr>
            )}
          />
        )}
      </div>
    </div>
  );
};

const BookingTable = ({ data, type, columns, renderRow }) => {
  if (data.length === 0) return (
    <div style={{padding: '4rem 2rem', textAlign: 'center', background: 'var(--card)', borderRadius: '24px', border: '0.5px solid var(--border)', boxShadow: '0 10px 25px rgba(0,0,0,0.22)'}}>
      <div style={{fontSize: '3.5rem', marginBottom: '1.5rem'}}>Empty</div>
      <h3 style={{color: 'var(--text-color)', marginBottom: '0.5rem'}}>No {type} Bookings</h3>
      <p style={{color: 'var(--muted-text)', marginBottom: '2rem'}}>You haven't scheduled any {type.toLowerCase()} services yet.</p>
      <a href="/services" className="btn btn-primary" style={{padding: '0.8rem 2rem', borderRadius: '12px'}}>Find a Provider</a>
    </div>
  );

  return (
    <div className="sd-table-wrap" style={{background: 'var(--card)', borderRadius: '24px', border: '0.5px solid var(--border)', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.22)'}}>
      <table className="sd-table" style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
          <tr style={{background: 'rgba(30,37,53,0.6)', borderBottom: '1px solid var(--border)'}}>
            {columns.map(col => <th key={col} style={{padding: '1.2rem 1.5rem', textAlign: 'left', color: 'var(--muted-text)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px'}}>{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map(item => renderRow(item))}
        </tbody>
      </table>
    </div>
  );
};

export default Appointments;

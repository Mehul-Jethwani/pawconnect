import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import ServiceProviderSetup from '../components/ServiceProviderSetup';
import './StoreDashboard.css'; // Reusing some base styles but with blue accents in CSS
import '../components/ServiceProviderSetup.css';

const ServiceDashboard = () => {
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasProvider, setHasProvider] = useState(false);
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox', 'schedule', 'services', 'boarding', 'training'
  const [boardingBookings, setBoardingBookings] = useState([]);
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [masterSchedule, setMasterSchedule] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  // Modals / Form States
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceFormLoading, setServiceFormLoading] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({ name: '', price: '', description: '' });

  const fetchMyProvider = async () => {
    try {
      setLoading(true);
      const response = await api.get('/service-provider/my');
      setProvider(response.data);
      setHasProvider(true);
      fetchServices(response.data.id);
      fetchAppointments(response.data.id);
      fetchProviderSchedule(response.data.id);
      fetchProviderAvailability(response.data.id);
      if (response.data.type === 'BOARDING') fetchBoardingBookings(response.data.id);
      if (response.data.type === 'TRAINING') fetchTrainingSessions(response.data.id);
    } catch (error) {
      if (error.response?.status === 404) setHasProvider(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoardingBookings = async (providerId) => {
    try {
      const res = await api.get(`/boarding/provider/${providerId}`);
      setBoardingBookings(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchTrainingSessions = async (providerId) => {
    try {
      const res = await api.get(`/training/provider/${providerId}`);
      setTrainingSessions(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchServices = async (providerId) => {
    try {
      const res = await api.get(`/service?providerId=${providerId}`);
      setServices(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchProviderSchedule = async (providerId) => {
    try {
      const res = await api.get(`/service-provider/${providerId}/schedule`);
      setMasterSchedule(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchProviderAvailability = async (providerId) => {
    try {
      const res = await api.get(`/availability/${providerId}`);
      setAvailability(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchAppointments = async (providerId) => {
    try {
      const res = await api.get(`/appointment/provider/${providerId}`);
      setAppointments(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchMyProvider();
    // Mark notifications as seen when entering dashboard
    api.post('/notifications/seen').catch(err => console.error('Mark seen error', err));
  }, []);

  useEffect(() => {
    if (hasProvider && !initialDataLoaded && !loading) {
      // Need a slight delay to ensure states are populated correctly
      const timer = setTimeout(() => {
        const pendingCount = appointments.filter(a => a.status === 'PENDING').length +
                             boardingBookings.filter(b => b.status === 'PENDING').length +
                             trainingSessions.filter(t => t.status === 'PENDING').length;
        if (pendingCount > 0) {
          toast.info(`You have ${pendingCount} pending booking requests waiting for your action!`, { icon: '🔔' });
        }
        setInitialDataLoaded(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasProvider, initialDataLoaded, loading, appointments, boardingBookings, trainingSessions]);

  const handleUpdateAppointment = async (id, status) => {
    try {
      await api.patch(`/appointment/${id}`, { status });
      fetchAppointments(provider.id);
    } catch (err) { alert('Failed to update appointment'); }
  };

  const handleUpdateBoarding = async (id, status) => {
    try {
      await api.patch(`/boarding/${id}/status`, { status });
      fetchBoardingBookings(provider.id);
    } catch (err) { alert('Failed to update boarding status'); }
  };

  const handleUpdateTraining = async (id, status) => {
    try {
      await api.patch(`/training/${id}/status`, { status });
      fetchTrainingSessions(provider.id);
    } catch (err) { alert('Failed to update training status'); }
  };

  const openServiceModal = (service = null) => {
    setEditingService(service);
    if (service) {
      setServiceFormData({ name: service.name, price: service.price, description: service.description || '' });
    } else {
      setServiceFormData({ name: '', price: '', description: '' });
    }
    setIsServiceModalOpen(true);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setServiceFormLoading(true);
    try {
      if (editingService) {
        await api.patch(`/service/${editingService.id}`, serviceFormData);
      } else {
        await api.post('/service', { ...serviceFormData, providerId: provider.id });
      }
      fetchServices(provider.id);
      setIsServiceModalOpen(false);
    } catch (err) { alert('Failed to save service'); }
    finally { setServiceFormLoading(false); }
  };

  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };
  const weekDays = getNext7Days();
  const scheduleHours = [10, 11, 12, 13, 15, 16, 17, 18];

  const getSlotAppointment = (dateObj, hour) => {
    const formattedHour = `${hour}:00`;
    return masterSchedule.find(a => {
      if (a.type === 'boarding') return false; // Handled separately
      const appDate = new Date(a.date);
      return appDate.toDateString() === dateObj.toDateString() && a.time === formattedHour;
    });
  };

  if (loading) return <div className="sd-loading"><div className="premium-spinner"></div><p>Loading Service Center...</p></div>;

  if (!hasProvider) return (
    <div className="sd-no-store">
      <span>🏥</span>
      <h2>No Service Center Found</h2>
      <p>Your service provider profile was not setup correctly. Please contact support.</p>
    </div>
  );

  if (provider && !provider.isSetupComplete) {
    return <ServiceProviderSetup onComplete={fetchMyProvider} />;
  }

  return (
    <div className="sd-wrapper">
      
      {/* ── Premium Banner ── */}
      <div className="sd-banner" style={{background: 'linear-gradient(135deg, var(--bg), var(--card))', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.12, backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(240,244,255,0.5) 1px, transparent 0)', backgroundSize: '32px 32px'}}></div>
        <div className="sd-banner-inner" style={{position: 'relative', zIndex: 2}}>
          <div className="sd-banner-avatar" style={{boxShadow: '0 10px 30px rgba(0,0,0,0.45)', border: '2px solid var(--border)'}}>
            {provider.imageUrl ? <img src={provider.imageUrl} alt={provider.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <span>🏥</span>}
          </div>
          <div className="sd-banner-info">
            <h1 style={{textShadow: '0 2px 10px rgba(0,0,0,0.3)'}}>{provider.name}</h1>
            <div className="sd-banner-city">
              <span className="sd-city-pill" style={{background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.25)', backdropFilter: 'blur(10px)', color: 'var(--accent)'}}>Service Center</span>
              <span className="sd-addr" style={{opacity: 0.9, color: 'var(--muted-text)'}}>{provider.type?.replace('_', ' ')} • {provider.city?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Metric Stats Bar ── */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', padding: '0 2rem', marginBottom: '2.5rem', marginTop: '-3rem', position: 'relative', zIndex: 10}}>
        <div className="stat-card-premium" style={{background: 'var(--card)', padding: '1.5rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.28)', border: '0.5px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.4rem', transition: 'all 0.3s'}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span style={{color: 'var(--muted-text)', fontSize: '0.9rem', fontWeight: 600}}>Pending Requests</span>
            <span style={{fontSize: '1.2rem'}}>🔔</span>
          </div>
          <span style={{color: 'var(--text-color)', fontSize: '2rem', fontWeight: 900}}>{appointments.filter(a => a.status === 'PENDING').length + boardingBookings.filter(b => b.status === 'PENDING').length + trainingSessions.filter(t => t.status === 'PENDING').length}</span>
          <span style={{fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700}}>Pending Action</span>
        </div>
        <div className="stat-card-premium" style={{background: 'var(--card)', padding: '1.5rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.28)', border: '0.5px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.4rem', transition: 'all 0.3s'}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span style={{color: 'var(--muted-text)', fontSize: '0.9rem', fontWeight: 600}}>Upcoming Sessions</span>
            <span style={{fontSize: '1.2rem'}}>📅</span>
          </div>
          <span style={{color: 'var(--text-color)', fontSize: '2rem', fontWeight: 900}}>{masterSchedule.length}</span>
          <span style={{fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700}}>Next 7 Days</span>
        </div>
        <div className="stat-card-premium" style={{background: 'var(--card)', padding: '1.5rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.28)', border: '0.5px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.4rem', transition: 'all 0.3s'}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span style={{color: 'var(--muted-text)', fontSize: '0.9rem', fontWeight: 600}}>Active Services</span>
            <span style={{fontSize: '1.2rem'}}>🛠️</span>
          </div>
          <span style={{color: 'var(--text-color)', fontSize: '2rem', fontWeight: 900}}>{services.length}</span>
          <span style={{fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700}}>Online Ready</span>
        </div>
        <div className="stat-card-premium" style={{background: 'var(--card)', padding: '1.5rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.28)', border: '0.5px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.4rem', transition: 'all 0.3s'}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span style={{color: 'var(--muted-text)', fontSize: '0.9rem', fontWeight: 600}}>System Status</span>
            <span style={{fontSize: '1.2rem'}}>🛡️</span>
          </div>
          <span style={{color: 'var(--accent)', fontSize: '1.5rem', fontWeight: 900, marginTop: '0.5rem'}}>Operational</span>
          <span style={{fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700}}>All systems go</span>
        </div>
      </div>

      {/* ── Modern Tabs Navigation ── */}
      <div style={{display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', padding: '0 2rem', marginBottom: '2rem'}}>
        <button onClick={() => setActiveTab('inbox')} style={{padding: '1rem 0.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'inbox' ? '3px solid var(--accent)' : '3px solid transparent', color: activeTab === 'inbox' ? 'var(--accent)' : 'var(--muted-text)', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'}}>
          📥 Action Inbox
          {(appointments.filter(a => a.status === 'PENDING').length + boardingBookings.filter(b => b.status === 'PENDING').length + trainingSessions.filter(t => t.status === 'PENDING').length) > 0 && 
            <span style={{background: 'rgba(248,113,113,0.14)', border: '1px solid rgba(248,113,113,0.25)', color: 'var(--danger)', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px'}}>
              {appointments.filter(a => a.status === 'PENDING').length + boardingBookings.filter(b => b.status === 'PENDING').length + trainingSessions.filter(t => t.status === 'PENDING').length}
            </span>
          }
        </button>
        <button onClick={() => setActiveTab('schedule')} style={{padding: '1rem 0.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'schedule' ? '3px solid var(--accent)' : '3px solid transparent', color: activeTab === 'schedule' ? 'var(--accent)' : 'var(--muted-text)', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'}}>
          📅 Weekly Schedule
        </button>
        <button onClick={() => setActiveTab('services')} style={{padding: '1rem 0.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'services' ? '3px solid var(--accent)' : '3px solid transparent', color: activeTab === 'services' ? 'var(--accent)' : 'var(--muted-text)', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'}}>
          🛠️ Service Matrix
        </button>
        <button onClick={() => setActiveTab('availability')} style={{padding: '1rem 0.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'availability' ? '3px solid var(--accent)' : '3px solid transparent', color: activeTab === 'availability' ? 'var(--accent)' : 'var(--muted-text)', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'}}>
          ⏳ Availability
        </button>
        {provider.type === 'BOARDING' && (
          <button onClick={() => setActiveTab('boarding')} style={{padding: '1rem 0.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'boarding' ? '3px solid var(--accent)' : '3px solid transparent', color: activeTab === 'boarding' ? 'var(--accent)' : 'var(--muted-text)', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'}}>
            🏠 Boarding Bookings
          </button>
        )}
        {provider.type === 'TRAINING' && (
          <button onClick={() => setActiveTab('training')} style={{padding: '1rem 0.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'training' ? '3px solid var(--accent)' : '3px solid transparent', color: activeTab === 'training' ? 'var(--accent)' : 'var(--muted-text)', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'}}>
            🎓 Training Sessions
          </button>
        )}
      </div>

      <div style={{padding: '0 2rem', paddingBottom: '4rem'}}>
        
        {/* ── TAB: AVAILABILITY ── */}
        {activeTab === 'availability' && (
          <div className="bounce-in">
             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
               <h2 style={{fontSize: '1.5rem', color: 'var(--text-color)'}}>⏳ Availability & Blocked Slots</h2>
               <p style={{color: 'var(--muted-text)', margin: 0}}>Toggle slots to block/unblock your working hours.</p>
             </div>
             <div style={{background: 'var(--card)', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.22)', overflowX: 'auto', padding: '1rem'}}>
               {/* Availability Grid Mockup (Will connect to API) */}
               <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem'}}>
                 {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => (
                   <div key={day} style={{flex: '1', minWidth: '150px', background: 'var(--surface)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)'}}>
                      <h4 style={{margin: '0 0 1rem 0', textAlign: 'center', color: 'var(--text-color)'}}>{day}</h4>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                        {[10, 11, 12, 13, 15, 16, 17, 18].map(h => {
                          const time = `${h}:00`;
                          const isBlocked = availability.find(a => a.dayOfWeek === i && a.startTime === time && a.isBlocked);
                          return (
                            <button key={h} 
                              onClick={async () => {
                                try {
                                  await api.post('/availability', { dayOfWeek: i, startTime: time, endTime: `${h+1}:00`, isBlocked: !isBlocked });
                                  fetchProviderAvailability(provider.id);
                                } catch (e) { toast.error('Failed to update availability'); }
                              }}
                              style={{
                              padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', border: '1px solid',
                              background: isBlocked ? 'var(--bg)' : 'rgba(74,222,128,0.12)', 
                              color: isBlocked ? 'var(--hint-text)' : 'var(--accent)',
                              borderColor: isBlocked ? 'var(--border)' : 'rgba(74,222,128,0.25)',
                              fontWeight: isBlocked ? 'normal' : '600'
                            }}>
                              {time} {isBlocked ? '(Blocked)' : ''}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                 ))}
               </div>
             </div>
          </div>
        )}

        {/* ── TAB: INBOX (PENDING REQUESTS) ── */}
        {activeTab === 'inbox' && (
          <div className="bounce-in">
            {appointments.filter(a => a.status === 'PENDING').length > 0 ? (
              <div style={{background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.25)', borderLeft: '3px solid var(--accent)', padding: '1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'flex-start', gap: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.18)', marginBottom: '2rem'}}>
                <span style={{fontSize: '2rem', animation: 'bounce 2s infinite'}}>🔔</span>
                <div>
                  <h4 style={{margin: 0, color: 'var(--text-color)', fontSize: '1.2rem', fontWeight: 800}}>Urgent Action Required</h4>
                  <p style={{margin: '0.4rem 0 0', color: 'var(--muted-text)', fontSize: '1rem'}}>
                    You have <strong>{appointments.filter(a => a.status === 'PENDING').length + boardingBookings.filter(b => b.status === 'PENDING').length + trainingSessions.filter(t => t.status === 'PENDING').length}</strong> unconfirmed requests waiting!
                  </p>
                </div>
              </div>
            ) : (
                <div style={{background: 'var(--card)', padding: '3rem', borderRadius: '16px', textAlign: 'center', border: '2px dashed var(--border)', marginBottom: '2rem'}}>
                   <span style={{fontSize: '3rem', opacity: 0.5}}>📭</span>
                   <h3 style={{color: 'var(--text-color)', marginTop: '1rem'}}>Inbox Zero!</h3>
                   <p style={{color: 'var(--muted-text)'}}>No pending requests right now. Time to grab a coffee.</p>
                </div>
            )}

            <div style={{display: 'grid', gap: '1rem'}}>
              {/* Appointments */}
              {appointments.filter(a => a.status === 'PENDING').map(app => (
                 <div key={app.id} style={{background: 'var(--card)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 10px rgba(0,0,0,0.18)'}}>
                    <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
                      <div style={{width: '60px', height: '60px', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--accent)'}}>⌛</div>
                      <div>
                        <h3 style={{margin: '0 0 0.3rem 0', fontSize: '1.2rem', color: 'var(--text-color)'}}>{app.service.name} <span style={{fontSize: '0.9rem', color: 'var(--muted-text)', fontWeight: 500}}>for</span> {app.userPet?.name || 'Unknown Pet'}</h3>
                        <p style={{margin: '0 0 0.3rem 0', color: 'var(--muted-text)', fontWeight: 600}}>Requested by: {app.user.name}</p>
                        <p style={{margin: 0, color: '#fbbf24', fontSize: '0.9rem', fontWeight: 700}}>📅 {new Date(app.date).toLocaleDateString('en-IN', {weekday: 'long', month: 'short', day: 'numeric'})} at {new Date(app.date).toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}</p>
                      </div>
                    </div>
                    <div style={{display: 'flex', gap: '1rem', flexDirection: 'column'}}>
                      <button onClick={() => handleUpdateAppointment(app.id, 'ACCEPTED')} style={{background: 'var(--accent)', color: '#0a1a10', border: 'none', padding: '0.8rem 2rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 10px rgba(74,222,128,0.12)', transition: 'transform 0.2s'}}>✅ Approve</button>
                      <button onClick={() => handleUpdateAppointment(app.id, 'REJECTED')} style={{background: 'var(--surface)', color: 'var(--muted-text)', border: '1px solid var(--border)', padding: '0.5rem 2rem', borderRadius: '12px', fontWeight: 600, cursor: 'pointer'}}>❌ Decline</button>
                    </div>
                 </div>
              ))}

              {/* Boarding Bookings */}
              {boardingBookings.filter(b => b.status === 'PENDING').map(bb => (
                 <div key={bb.id} style={{background: 'var(--card)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 10px rgba(0,0,0,0.18)'}}>
                    <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
                      <div style={{width: '60px', height: '60px', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#38bdf8'}}>🏠</div>
                      <div>
                        <h3 style={{margin: '0 0 0.3rem 0', fontSize: '1.2rem', color: 'var(--text-color)'}}>Boarding Stay <span style={{fontSize: '0.9rem', color: 'var(--muted-text)', fontWeight: 500}}>for</span> {bb.userPet?.name}</h3>
                        <p style={{margin: '0 0 0.3rem 0', color: 'var(--muted-text)', fontWeight: 600}}>Requested by: {bb.user?.name}</p>
                        <p style={{margin: 0, color: '#38bdf8', fontSize: '0.9rem', fontWeight: 700}}>📅 {new Date(bb.startDate).toLocaleDateString()} to {new Date(bb.endDate).toLocaleDateString()} ({bb.totalDays} Days)</p>
                      </div>
                    </div>
                    <div style={{display: 'flex', gap: '1rem', flexDirection: 'column'}}>
                      <button onClick={() => handleUpdateBoarding(bb.id, 'ACCEPTED')} style={{background: 'var(--accent)', color: '#0a1a10', border: 'none', padding: '0.8rem 2rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 10px rgba(74,222,128,0.12)'}}>✅ Approve</button>
                      <button onClick={() => handleUpdateBoarding(bb.id, 'REJECTED')} style={{background: 'var(--surface)', color: 'var(--muted-text)', border: '1px solid var(--border)', padding: '0.5rem 2rem', borderRadius: '12px', fontWeight: 600, cursor: 'pointer'}}>❌ Decline</button>
                    </div>
                 </div>
              ))}

              {/* Training Sessions */}
              {trainingSessions.filter(t => t.status === 'PENDING').map(ts => (
                 <div key={ts.id} style={{background: 'var(--card)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 10px rgba(0,0,0,0.18)'}}>
                    <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
                      <div style={{width: '60px', height: '60px', background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#fbbf24'}}>🎓</div>
                      <div>
                        <h3 style={{margin: '0 0 0.3rem 0', fontSize: '1.2rem', color: 'var(--text-color)'}}>Training Session <span style={{fontSize: '0.9rem', color: 'var(--muted-text)', fontWeight: 500}}>for</span> {ts.userPet?.name}</h3>
                        <p style={{margin: '0 0 0.3rem 0', color: 'var(--muted-text)', fontWeight: 600}}>Requested by: {ts.user?.name}</p>
                        <p style={{margin: 0, color: '#fbbf24', fontSize: '0.9rem', fontWeight: 700}}>📅 {new Date(ts.sessionDate).toLocaleDateString()} at {ts.sessionTime || 'TBD'}</p>
                      </div>
                    </div>
                    <div style={{display: 'flex', gap: '1rem', flexDirection: 'column'}}>
                      <button onClick={() => handleUpdateTraining(ts.id, 'ACCEPTED')} style={{background: 'var(--accent)', color: '#0a1a10', border: 'none', padding: '0.8rem 2rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 10px rgba(74,222,128,0.12)'}}>✅ Approve</button>
                      <button onClick={() => handleUpdateTraining(ts.id, 'REJECTED')} style={{background: 'var(--surface)', color: 'var(--muted-text)', border: '1px solid var(--border)', padding: '0.5rem 2rem', borderRadius: '12px', fontWeight: 600, cursor: 'pointer'}}>❌ Decline</button>
                    </div>
                 </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: SCHEDULE (CALENDAR VIEW) ── */}
        {activeTab === 'schedule' && (
          <div className="bounce-in">
            <h2 style={{fontSize: '1.5rem', color: 'var(--text-color)', marginBottom: '1.5rem'}}>7-Day Master Schedule</h2>
            <div style={{background: 'var(--card)', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.22)', overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', minWidth: '900px'}}>
                <thead>
                  <tr>
                    <th style={{background: 'var(--surface)', padding: '1.5rem', borderBottom: '2px solid var(--border)', width: '100px', textAlign: 'center', color: 'var(--muted-text)', fontWeight: 600}}>Time</th>
                    {weekDays.map(day => (
                      <th key={day.toISOString()} style={{background: 'var(--surface)', padding: '1.5rem 1rem', borderBottom: '2px solid var(--border)', textAlign: 'center', borderLeft: '1px solid var(--border)'}}>
                        <div style={{fontSize: '0.8rem', color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.3rem'}}>{day.toLocaleDateString('en-IN', {weekday: 'short'})}</div>
                        <div style={{fontSize: '1.2rem', color: 'var(--text-color)', fontWeight: 800}}>{day.getDate()} {day.toLocaleDateString('en-IN', {month: 'short'})}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Boarding Multi-Day Spans */}
                  {provider.type === 'BOARDING' && (
                    <tr style={{borderBottom: '2px solid var(--border)', background: 'var(--surface)'}}>
                      <td style={{padding: '1rem', textAlign: 'center', fontWeight: 700, color: 'var(--muted-text)', fontSize: '0.85rem'}}>Boarding</td>
                      {weekDays.map(day => {
                        const activeBoarding = masterSchedule.find(b => b.type === 'boarding' && new Date(b.startDate) <= day && new Date(b.endDate) >= day);
                        return (
                          <td key={`board-${day}`} style={{borderLeft: '1px solid var(--border)', padding: '0.5rem', verticalAlign: 'middle'}}>
                            {activeBoarding ? (
                              <div style={{background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.25)', color: '#38bdf8', padding: '0.5rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                🏠 {activeBoarding.petName} ({activeBoarding.ownerName})
                              </div>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  )}
                  {scheduleHours.map(hour => {
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                    
                    return (
                      <React.Fragment key={`hour-${hour}`}>
                        <tr style={{borderBottom: '1px solid var(--border)'}}>
                          <td style={{padding: '1.5rem 1rem', textAlign: 'center', fontWeight: 700, color: 'var(--muted-text)', fontSize: '0.9rem', background: 'var(--surface)'}}>{hour12}:00 {ampm}</td>
                          {weekDays.map(day => {
                            const activeApp = getSlotAppointment(day, hour);
                            return (
                              <td key={`cell-${day}-${hour}`} style={{borderLeft: '1px solid var(--border)', padding: '0.5rem', verticalAlign: 'top', background: activeApp ? 'var(--card)' : 'var(--surface)', transition: 'background 0.2s'}}>
                                {activeApp ? (
                                  <div style={{background: activeApp.type === 'training' ? 'rgba(251,191,36,0.12)' : 'rgba(74,222,128,0.12)', border: '1px solid', borderColor: activeApp.type === 'training' ? 'rgba(251,191,36,0.25)' : 'rgba(74,222,128,0.25)', borderLeft: '4px solid', borderLeftColor: activeApp.type === 'training' ? '#fbbf24' : 'var(--accent)', borderRadius: '12px', padding: '1rem', height: '100%', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0, 0.12)'}}>
                                    <strong style={{display: 'block', fontSize: '0.95rem', color: activeApp.type === 'training' ? '#fbbf24' : 'var(--accent)', marginBottom: '0.4rem'}}>{activeApp.serviceName}</strong>
                                    <div style={{fontSize: '0.8rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem'}}><span>🐾</span> {activeApp.petName}</div>
                                    <div style={{fontSize: '0.75rem', color: 'var(--muted-text)'}}>👤 {activeApp.ownerName}</div>
                                  </div>
                                ) : (
                                  <div style={{height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--hint-text)', fontSize: '0.8rem', fontWeight: 600, border: '2px dashed transparent'}}>
                                    Free Slot
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                        {hour === 13 && (
                           <tr>
                              <td style={{padding: '1rem', textAlign: 'center', fontWeight: 700, color: 'var(--hint-text)', fontSize: '0.85rem', background: 'var(--surface)', textTransform: 'uppercase', letterSpacing: '2px'}}>2:00 PM</td>
                              <td colSpan="7" style={{background: 'repeating-linear-gradient(45deg, var(--surface), var(--surface) 10px, var(--card) 10px, var(--card) 20px)', padding: '1rem', textAlign: 'center', color: 'var(--muted-text)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem'}}>— Lunch Break —</td>
                           </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* ── TAB: SERVICES (MANAGEMENT) ── */}
        {activeTab === 'services' && (
          <div className="bounce-in">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <h2 style={{fontSize: '1.5rem', color: 'var(--text-color)'}}>🛠️ Service Matrix Configuration</h2>
              <button className="sd-add-btn-sm" onClick={() => openServiceModal()}>+ New Service</button>
            </div>
            <div style={{background: 'var(--card)', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.22)', overflow: 'hidden'}}>
              <table className="sd-table" style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{background: 'var(--surface)'}}>
                    <th style={{padding: '1.5rem', textAlign: 'left', color: 'var(--muted-text)'}}>Service Configuration</th>
                    <th style={{padding: '1.5rem', textAlign: 'left', color: 'var(--muted-text)'}}>Rate</th>
                    <th style={{padding: '1.5rem', textAlign: 'left', color: 'var(--muted-text)'}}>Status</th>
                    <th style={{padding: '1.5rem', textAlign: 'left', color: 'var(--muted-text)'}}>Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map(s => (
                    <tr key={s.id} style={{borderBottom: '1px solid var(--border)'}}>
                      <td style={{padding: '1.5rem'}}>
                        <strong style={{display: 'block', fontSize: '1.1rem', color: 'var(--text-color)', marginBottom: '0.3rem'}}>{s.name}</strong>
                        <span style={{fontSize: '0.85rem', color: 'var(--muted-text)'}}>{s.description || 'No specific parameters provided.'}</span>
                      </td>
                      <td style={{padding: '1.5rem', fontWeight: 800, color: 'var(--accent)', fontSize: '1.2rem'}}>₹{s.price}</td>
                      <td style={{padding: '1.5rem'}}><span style={{background: 'rgba(74,222,128,0.12)', color: 'var(--accent)', border: '1px solid rgba(74,222,128,0.25)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700}}>Live</span></td>
                      <td style={{padding: '1.5rem'}}>
                        <button style={{background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.6rem 1.2rem', borderRadius: '8px', color: 'var(--muted-text)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'}} onClick={() => openServiceModal(s)}>✏️ Modify</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: BOARDING ── */}
        {activeTab === 'boarding' && (
          <div className="bounce-in">
            <h2 style={{fontSize: '1.5rem', color: 'var(--text-color)', marginBottom: '1.5rem'}}>🏠 Boarding Management</h2>
            <div style={{display: 'grid', gap: '1rem'}}>
              {boardingBookings.length > 0 ? boardingBookings.map(b => (
                <div key={b.id} style={{background: 'var(--card)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
                    <div style={{width: '60px', height: '60px', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'}}>🏠</div>
                    <div>
                      <h3 style={{margin: '0 0 0.3rem 0', color: 'var(--text-color)'}}>{b.userPet.name} ({b.userPet.type})</h3>
                      <p style={{margin: '0 0 0.3rem 0', color: 'var(--muted-text)'}}>Owner: {b.user.name}</p>
                      <p style={{margin: 0, fontWeight: 700, color: '#38bdf8'}}>
                        {new Date(b.startDate).toLocaleDateString()} to {new Date(b.endDate).toLocaleDateString()}
                      </p>
                      <p style={{margin: '0.3rem 0 0', fontSize: '0.9rem'}}>Price: ₹{b.totalPrice} ({b.totalDays} days)</p>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{marginBottom: '0.5rem'}}>
                      <span style={{
                        padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700,
                        background: b.status === 'PENDING' ? 'rgba(251,191,36,0.15)' : b.status === 'ACCEPTED' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.14)',
                        color: b.status === 'PENDING' ? '#fbbf24' : b.status === 'ACCEPTED' ? 'var(--accent)' : 'var(--danger)'
                      }}>
                        {b.status}
                      </span>
                    </div>
                    {b.status === 'PENDING' && (
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button onClick={() => handleUpdateBoarding(b.id, 'ACCEPTED')} style={{background: 'var(--accent)', color: '#0a1a10', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer'}}>Accept</button>
                        <button onClick={() => handleUpdateBoarding(b.id, 'REJECTED')} style={{background: 'rgba(248,113,113,0.14)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.25)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer'}}>Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              )) : <p>No boarding bookings found.</p>}
            </div>
          </div>
        )}

        {/* ── TAB: TRAINING ── */}
        {activeTab === 'training' && (
          <div className="bounce-in">
            <h2 style={{fontSize: '1.5rem', color: 'var(--text-color)', marginBottom: '1.5rem'}}>🎓 Training Schedule</h2>
            <div style={{display: 'grid', gap: '1rem'}}>
              {trainingSessions.length > 0 ? trainingSessions.map(t => (
                <div key={t.id} style={{background: 'var(--card)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                   <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
                    <div style={{width: '60px', height: '60px', background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'}}>🎓</div>
                    <div>
                      <h3 style={{margin: '0 0 0.3rem 0', color: 'var(--text-color)'}}>{t.userPet.name}</h3>
                      <p style={{margin: '0 0 0.3rem 0', color: 'var(--muted-text)'}}>Owner: {t.user.name}</p>
                      <p style={{margin: 0, fontWeight: 700, color: '#fbbf24'}}>
                        {new Date(t.sessionDate).toLocaleDateString('en-IN', {weekday: 'long', month: 'short', day: 'numeric'})}
                      </p>
                    </div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{marginBottom: '0.5rem'}}>
                      <span style={{
                        padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700,
                        background: t.status === 'PENDING' ? 'rgba(251,191,36,0.15)' : t.status === 'ACCEPTED' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.14)',
                        color: t.status === 'PENDING' ? '#fbbf24' : t.status === 'ACCEPTED' ? 'var(--accent)' : 'var(--danger)'
                      }}>
                        {t.status}
                      </span>
                    </div>
                    {t.status === 'PENDING' && (
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button onClick={() => handleUpdateTraining(t.id, 'ACCEPTED')} style={{background: 'var(--accent)', color: '#0a1a10', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer'}}>Accept</button>
                        <button onClick={() => handleUpdateTraining(t.id, 'REJECTED')} style={{background: 'rgba(248,113,113,0.14)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.25)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer'}}>Decline</button>
                      </div>
                    )}
                  </div>
                </div>
              )) : <p>No training sessions scheduled.</p>}
            </div>
          </div>
        )}


      </div>

      {/* Modal Overlay */}
      {isServiceModalOpen && (
        <div className="sd-modal-overlay">
          <div className="sd-modal-box">
            <div className="sd-modal-head">
              <div>
                <h2>{editingService ? '✏️ Modify Service' : '✨ New Service'}</h2>
                <p>Define your service offering and pricing.</p>
              </div>
              <button className="sd-modal-close" onClick={() => setIsServiceModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleServiceSubmit} className="sd-form">
              <div className="sd-form-group">
                <label>Service Name</label>
                <input type="text" value={serviceFormData.name} onChange={e => setServiceFormData({...serviceFormData, name: e.target.value})} required placeholder="e.g. Premium Grooming" />
              </div>
              <div className="sd-form-group">
                <label>Pricing Phase (₹)</label>
                <input type="number" value={serviceFormData.price} onChange={e => setServiceFormData({...serviceFormData, price: e.target.value})} required placeholder="Amount in INR" />
              </div>
              <div className="sd-form-group">
                <label>Service Narrative</label>
                <textarea value={serviceFormData.description} onChange={e => setServiceFormData({...serviceFormData, description: e.target.value})} rows="4" placeholder="Briefly explain what's included..." />
              </div>
              <div className="sd-form-actions">
                <button type="submit" className="sd-btn-save" style={{background: 'var(--accent)', color: '#0a1a10', padding: '0.8rem 2.5rem'}} disabled={serviceFormLoading}>
                  {serviceFormLoading ? 'Updating...' : '✅ Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ServiceDashboard;

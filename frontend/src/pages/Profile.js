import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import './StoreDashboard.css'; 

const Profile = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  // Pet Modal State
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [petFormLoading, setPetFormLoading] = useState(false);
  const [petFormData, setPetFormData] = useState({
    name: '', type: 'DOG', breed: '', gender: 'MALE', dateOfBirth: '', imageUrl: '',
    vaccinated: false, neutered: false, weight: '', emergencyContact: '', healthNotes: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // Reschedule State
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [reschedulingApp, setReschedulingApp] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:00');

  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileFormLoading, setProfileFormLoading] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: user.name || '',
    phone: user.phone || ''
  });

  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [petsRes, appsRes, trainRes, boardRes] = await Promise.all([
        API.get('/user-pet/my'),
        API.get('/appointment/my'),
        API.get('/training/my'),
        API.get('/boarding/my')
      ]);
      
      const mappedTraining = trainRes.data.map(t => ({
         id: t.id, status: t.status, date: t.sessionDate,
         service: { name: 'Training Session' },
         provider: t.provider, userPet: t.userPet
      }));
      
      const mappedBoarding = boardRes.data.map(b => ({
         id: b.id, status: b.status, date: b.startDate,
         service: { name: `Boarding (${b.totalDays} days)` },
         provider: b.provider, userPet: b.userPet
      }));

      const combined = [...appsRes.data, ...mappedTraining, ...mappedBoarding].sort((a, b) => new Date(b.date) - new Date(a.date));
      setPets(petsRes.data);
      setAppointments(combined);
    } catch (err) {
      console.error('Error fetching profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Mark notifications as seen when entering profile
    API.post('/notifications/seen').catch(err => console.error('Mark seen error', err));
  }, []);

  useEffect(() => {
     if (!loading && !initialLoadDone) {
        const normalizedRole = String(user?.role || '').toUpperCase();
        const isRegularUser = normalizedRole === 'USER';
        const hasShownWelcomeToast = sessionStorage.getItem('welcomeToastShown') === 'true';
        const upcoming = appointments.filter(a => a.status === 'ACCEPTED' && new Date(a.date) >= new Date());
        if (isRegularUser && !hasShownWelcomeToast && upcoming.length > 0) {
           toast.success(`Welcome back! You have ${upcoming.length} upcoming confirmed appointments!`, {
             icon: '✅',
             autoClose: 5000,
           });
           sessionStorage.setItem('welcomeToastShown', 'true');
        }
        setInitialLoadDone(true);
     }
  }, [loading, appointments, initialLoadDone, user]);

  // Pet Handlers
  const handlePetChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPetFormData({ ...petFormData, [name]: type === 'checkbox' ? checked : value });
  };
  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);
  
  const handlePetSubmit = async (e) => {
    e.preventDefault();
    setPetFormLoading(true);
    setError('');

    const formData = new FormData();
    Object.keys(petFormData).forEach(key => {
      formData.append(key, petFormData[key]);
    });
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    try {
      if (editingPet) {
        await API.patch(`/user-pet/${editingPet.id}`, formData);
      } else {
        await API.post('/user-pet', formData);
      }
      await fetchData();
      setIsPetModalOpen(false);
      setEditingPet(null);
      setSelectedFile(null);
      setPetFormData({ name: '', type: 'DOG', breed: '', gender: 'MALE', dateOfBirth: '', imageUrl: '', vaccinated: false, neutered: false, weight: '', emergencyContact: '', healthNotes: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save pet');
    } finally {
      setPetFormLoading(false);
    }
  };

  const openEditPet = (pet) => {
    setEditingPet(pet);
    setPetFormData({
      name: pet.name, type: pet.type, breed: pet.breed, gender: pet.gender,
      dateOfBirth: new Date(pet.dateOfBirth).toISOString().split('T')[0],
      imageUrl: pet.imageUrl || '',
      vaccinated: pet.vaccinated || false,
      neutered: pet.neutered || false,
      weight: pet.weight || '',
      emergencyContact: pet.emergencyContact || '',
      healthNotes: pet.healthNotes || ''
    });
    setIsPetModalOpen(true);
  };

  const handleDeletePet = async (id) => {
    if (!window.confirm('Are you sure you want to remove this pet?')) return;
    try {
      await API.delete(`/user-pet/${id}`);
      fetchData();
    } catch (err) { alert('Failed to delete pet'); }
  };

  // Profile Handlers
  const handleProfileChange = (e) => setProfileFormData({ ...profileFormData, [e.target.name]: e.target.value });

  const handleCancelAppointment = async (app) => {
    const appDate = new Date(app.date);
    const diffHours = (appDate - new Date()) / (1000 * 60 * 60);
    if (diffHours < 2) return toast.error('Cancellation only allowed at least 2 hours before session.');
    
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const type = app.service.name.includes('Training') ? 'training' : app.service.name.includes('Boarding') ? 'boarding' : 'appointment';
      await API.delete(`/${type}/${app.id}`);
      toast.success('Booking cancelled');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to cancel'); }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const type = reschedulingApp.service.name.includes('Training') ? 'training' : reschedulingApp.service.name.includes('Boarding') ? 'boarding' : 'appointment';
      await API.patch(`/${type}/${reschedulingApp.id}/reschedule`, { date: newDate, time: newTime });
      toast.success('Reschedule request sent!');
      setIsRescheduleModalOpen(false);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to reschedule'); }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileFormLoading(true);
    setError('');
    try {
      const res = await API.patch('/auth/profile', profileFormData);
      const updatedUser = res.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsProfileModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileFormLoading(false);
    }
  };

  if (loading) return <div className="sd-loading"><div className="premium-spinner"></div><p>Loading Dashboard...</p></div>;

  const upcomingApps = appointments.filter(a => a.status === 'PENDING' || a.status === 'ACCEPTED');

  const getCountdown = (dateString, status) => {
    if (status === 'PENDING') return '⏳ Awaiting Confirmation';
    if (status === 'REJECTED') return '❌ Declined';
    if (status !== 'ACCEPTED') return '';
    
    const now = new Date();
    const appDate = new Date(dateString);
    if (appDate < now) return '✅ Completed';
    
    const diffMs = appDate - now;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHrs / 24);
    
    if (diffDays > 0) return `⏳ In ${diffDays} Day${diffDays > 1 ? 's' : ''}`;
    if (diffHrs > 0) return `⏳ In ${diffHrs} Hour${diffHrs > 1 ? 's' : ''}`;
    return `⏳ Less than an hour!`;
  };

  // Sort upcoming apps to find the very next one
  const sortedUpcoming = [...upcomingApps].sort((a, b) => new Date(a.date) - new Date(b.date));
  const nextAppointment = sortedUpcoming.length > 0 ? sortedUpcoming[0] : null;

  return (
    <div className="sd-wrapper" style={{background: 'var(--bg)', minHeight: '100vh', paddingBottom: '4rem'}}>
      {/* ── Premium Banner ── */}
      <div className="sd-banner" style={{background: 'linear-gradient(135deg, var(--bg), var(--card))', height: '220px', borderRadius: '0 0 2rem 2rem', position: 'relative'}}>
        <div className="sd-banner-inner" style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem'}}>
          <div className="sd-banner-avatar" style={{fontSize: '3.5rem', background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.25)', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.35)'}}>🐾</div>
          <div className="sd-banner-info">
            <h1 style={{color: 'var(--text-color)', fontSize: '2.5rem', fontWeight: 800, textShadow: '0 2px 10px rgba(0,0,0,0.35)', margin: 0}}>Welcome, {user.name}!</h1>
            <div className="sd-banner-city" style={{marginTop: '0.5rem'}}>
              <span className="sd-city-pill" style={{background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.25)', color: 'var(--accent)'}}>Pet Parent Passport</span>
              <span className="sd-addr" style={{color: 'var(--muted-text)'}}>{user.email}</span>
            </div>
          </div>
          <div style={{marginLeft: 'auto'}}>
             <button className="sd-add-btn bounce-in" style={{background: 'rgba(74,222,128,0.12)', backdropFilter: 'blur(10px)', border: '1px solid rgba(74,222,128,0.25)', padding: '0.75rem 1.5rem', fontSize: '0.95rem', color: 'var(--accent)'}} onClick={() => setIsProfileModalOpen(true)}>⚙️ Edit Account</button>
          </div>
        </div>
      </div>

      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', marginTop: '-60px', position: 'relative', zIndex: 10}}>
        
        {/* ── Urgent Action Hero Card (The Next Appointment) ── */}
        {nextAppointment ? (
           <div className="bounce-in" style={{background: 'var(--card)', borderRadius: '24px', padding: '2rem', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', marginBottom: '3rem', border: '0.5px solid var(--border)', borderLeft: '3px solid var(--accent)'}}>
              <div>
                <p style={{color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '1px'}}>Next Upcoming Priority</p>
                <h2 style={{fontSize: '1.8rem', color: 'var(--text-color)', margin: '0 0 0.5rem 0', fontWeight: 800}}>{nextAppointment.service.name} for {nextAppointment.userPet?.name || 'Pet'}</h2>
                <div style={{display: 'flex', gap: '1.5rem', fontSize: '0.95rem', color: 'var(--muted-text)', alignItems: 'center'}}>
                  <span style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}>🏥 <strong>{nextAppointment.provider.name}</strong></span>
                  <span style={{display: 'flex', alignItems: 'center', gap: '0.4rem'}}>📅 {new Date(nextAppointment.date).toLocaleDateString('en-IN', {weekday: 'long', month: 'long', day: 'numeric'})} at {new Date(nextAppointment.date).toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}</span>
                </div>
              </div>
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '0.5rem'}}>{getCountdown(nextAppointment.date, nextAppointment.status)}</div>
                <span className={`status-pill ${nextAppointment.status.toLowerCase()}`} style={{fontSize: '0.8rem', padding: '6px 16px', borderRadius: '20px'}}>{nextAppointment.status}</span>
              </div>
           </div>
        ) : (
           <div className="bounce-in" style={{background: 'var(--card)', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 20px rgba(0,0,0,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem', border: '0.5px solid var(--border)'}}>
              <div>
                <h2 style={{fontSize: '1.5rem', color: 'var(--text-color)', margin: '0 0 0.5rem 0'}}>No Immediate Appointments.</h2>
                <p style={{color: 'var(--muted-text)', margin: 0}}>Your schedule is clear! Enjoy the downtime with your pets.</p>
              </div>
              <span style={{fontSize: '3rem', opacity: 0.5}}>🌿</span>
           </div>
        )}

        <div style={{display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem'}}>
          
          {/* ── Left Column: Pet Family Cards ── */}
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <h2 style={{fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-color)'}}>The Family Library</h2>
              <button className="sd-add-btn-sm" style={{background: 'var(--accent)', color: '#0a1a10'}} onClick={() => { setIsPetModalOpen(true); setEditingPet(null); }}>+ Add Pet</button>
            </div>

            {pets.length === 0 ? (
                <div style={{background: 'var(--card)', borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center', border: '1.5px dashed var(--border)'}}>
                  <span style={{fontSize: '4rem'}}>🐶</span>
                  <h3 style={{fontSize: '1.5rem', color: 'var(--text-color)', marginTop: '1rem'}}>It's quiet here...</h3>
                  <p style={{color: 'var(--muted-text)', marginBottom: '2rem'}}>Build your digital pet family to easily book services and track their health.</p>
                  <button className="btn btn-primary" onClick={() => setIsPetModalOpen(true)}>Add Your First Pet</button>
                </div>
            ) : (
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem'}}>
                  {pets.map((pet, idx) => (
                    <div key={pet.id} className="bounce-in" style={{background: 'var(--card)', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.22)', border: '0.5px solid var(--border)', position: 'relative', transition: 'transform 0.2s', cursor: 'default', animationDelay: `${idx * 0.1}s`}}>
                      <div style={{display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1rem'}}>
                        <div style={{width: '70px', height: '70px', borderRadius: '20px', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.25)', border: '1px solid var(--border)'}}>
                          {pet.imageUrl ? <img src={pet.imageUrl} alt={pet.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <span style={{fontSize: '2rem'}}>🐾</span>}
                        </div>
                        <div>
                          <h3 style={{margin: '0 0 0.2rem 0', fontSize: '1.35rem', color: 'var(--text-color)', fontWeight: 800}}>{pet.name}</h3>
                          <div style={{display: 'flex', gap: '5px', flexWrap: 'wrap'}}>
                            <span style={{background: 'rgba(74,222,128,0.12)', color: 'var(--accent)', border: '1px solid rgba(74,222,128,0.25)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 700}}>{pet.type}</span>
                            {pet.vaccinated && <span style={{background: 'rgba(74,222,128,0.12)', color: 'var(--accent)', border: '1px solid rgba(74,222,128,0.25)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 700}}>🛡️ Vaccinated</span>}
                          </div>
                        </div>
                      </div>
                      <div style={{background: 'var(--surface)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem'}}>
                        <div>
                          <p style={{fontSize: '0.65rem', color: 'var(--hint-text)', margin: '0 0 0.1rem 0', textTransform: 'uppercase', fontWeight: 700}}>Breed</p>
                          <p style={{fontSize: '0.8rem', color: 'var(--text-color)', margin: 0, fontWeight: 600}}>{pet.breed || 'Unknown'}</p>
                        </div>
                        <div>
                          <p style={{fontSize: '0.65rem', color: 'var(--hint-text)', margin: '0 0 0.1rem 0', textTransform: 'uppercase', fontWeight: 700}}>Weight</p>
                          <p style={{fontSize: '0.8rem', color: 'var(--text-color)', margin: 0, fontWeight: 600}}>{pet.weight ? `${pet.weight} kg` : '--'}</p>
                        </div>
                      </div>
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button style={{flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.6rem', borderRadius: '12px', color: 'var(--muted-text)', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', fontSize: '0.8rem'}} onClick={() => openEditPet(pet)}>Edit Family Member</button>
                        <button style={{background: 'rgba(248,113,113,0.14)', border: '1px solid rgba(248,113,113,0.25)', padding: '0.6rem', borderRadius: '12px', color: 'var(--danger)', fontWeight: 600, cursor: 'pointer'}} onClick={() => handleDeletePet(pet.id)}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
            )}
          </div>

          {/* ── Right Column: Timeline History ── */}
          <div>
             <h2 style={{fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-color)', marginBottom: '1.5rem'}}>Service History</h2>
             <div style={{background: 'var(--card)', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.22)', border: '0.5px solid var(--border)'}}>
              {appointments.length === 0 ? (
                  <p style={{textAlign: 'center', color: 'var(--muted-text)', margin: 0}}>Timeline is completely empty.</p>
              ) : (
                  <div style={{position: 'relative'}}>
                    {/* Vertical Line */}
                    <div style={{position: 'absolute', top: '10px', bottom: '10px', left: '15px', width: '2px', background: 'var(--border)', zIndex: 1}}></div>
                    
                    {appointments.map((app, idx) => {
                        const canCancel = (new Date(app.date) - new Date()) / (1000 * 60 * 60) > 2;
                        const isUpcoming = new Date(app.date) > new Date() && (app.status === 'ACCEPTED' || app.status === 'PENDING');
                        
                        return (
                          <div key={app.id} style={{display: 'flex', gap: '1.5rem', marginBottom: idx !== appointments.length - 1 ? '2rem' : 0, position: 'relative', zIndex: 2}}>
                              {/* Dot Icon */}
                              <div style={{width: '32px', height: '32px', borderRadius: '50%', background: app.status === 'ACCEPTED' ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)', border: `3px solid ${app.status === 'ACCEPTED' ? 'rgba(74,222,128,0.40)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 0 4px var(--card)'}}>
                                  <span style={{fontSize: '0.7rem'}}>{app.status === 'ACCEPTED' ? '✓' : app.status === 'PENDING' ? '⏳' : '•'}</span>
                              </div>
                              {/* Content */}
                              <div style={{paddingTop: '4px', flex: 1}}>
                                  <p style={{fontSize: '0.75rem', color: 'var(--muted-text)', margin: '0 0 0.3rem 0', fontWeight: 700}}>{new Date(app.date).toLocaleDateString('en-IN', {month: 'short', day: 'numeric', year: 'numeric'})}</p>
                                  <strong style={{display: 'block', fontSize: '1.05rem', color: 'var(--text-color)', marginBottom: '0.3rem'}}>{app.service.name}</strong>
                                  <p style={{fontSize: '0.85rem', margin: '0 0 0.5rem 0', color: 'var(--muted-text)'}}>For <strong>{app.userPet?.name || 'Pet'}</strong> at {app.provider.name}</p>
                                  
                                  {isUpcoming ? (
                                    <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                                       <span style={{padding: '2px 8px', background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.22)', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700}}>{getCountdown(app.date, app.status)}</span>
                                       {canCancel && (
                                         <>
                                           <button onClick={() => { setReschedulingApp(app); setIsRescheduleModalOpen(true); }} style={{background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', padding: 0}}>Reschedule</button>
                                           <span style={{color: 'var(--border)'}}>•</span>
                                           <button onClick={() => handleCancelAppointment(app)} style={{background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', padding: 0}}>Cancel</button>
                                         </>
                                       )}
                                    </div>
                                  ) : (
                                     <span style={{fontSize: '0.75rem', color: 'var(--hint-text)'}}>{app.status === 'COMPLETED' ? 'Completed' : app.status === 'REJECTED' ? 'Cancelled/Rejected' : 'Past Event'}</span>
                                  )}
                              </div>
                          </div>
                        );
                    })}
                  </div>
              )}
             </div>
          </div>

        </div>
      </div>

      {/* Pet Modal */}
      {isPetModalOpen && (
        <div className="sd-modal-overlay">
          <div className="sd-modal-box">
            <div className="sd-modal-head">
              <div>
                <h2>{editingPet ? 'Update Pet Info' : 'Add a New Pet'}</h2>
                <p>High-quality details help providers prepare.</p>
              </div>
              <button className="sd-modal-close" onClick={() => { setIsPetModalOpen(false); setEditingPet(null); }}>✕</button>
            </div>
            {error && <div className="sd-form-error">{error}</div>}
            <form className="sd-form" onSubmit={handlePetSubmit}>
              <div className="sd-form-row">
                <div className="sd-form-group">
                  <label>Pet Name <span className="sd-req">*</span></label>
                  <input type="text" name="name" value={petFormData.name} onChange={handlePetChange} required placeholder="Buddy" />
                </div>
                <div className="sd-form-group">
                  <label>Type <span className="sd-req">*</span></label>
                  <select name="type" value={petFormData.type} onChange={handlePetChange}>
                    <option value="DOG">Dog</option>
                    <option value="CAT">Cat</option>
                    <option value="BIRD">Bird</option>
                    <option value="HAMSTER">Hamster</option>
                    <option value="RABBIT">Rabbit</option>
                    <option value="GUINEA_PIG">Guinea Pig</option>
                  </select>
                </div>
              </div>
              <div className="sd-form-row">
                <div className="sd-form-group">
                  <label>Breed</label>
                  <input type="text" name="breed" value={petFormData.breed} onChange={handlePetChange} placeholder="Golden Retriever" />
                </div>
                <div className="sd-form-group">
                  <label>Gender <span className="sd-req">*</span></label>
                  <select name="gender" value={petFormData.gender} onChange={handlePetChange}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>
              <div className="sd-form-row">
                <div className="sd-form-group">
                  <label>Date of Birth <span className="sd-req">*</span></label>
                  <input type="date" name="dateOfBirth" value={petFormData.dateOfBirth} onChange={handlePetChange} required />
                </div>
                <div className="sd-form-group">
                  <label>Weight (kg)</label>
                  <input type="number" name="weight" value={petFormData.weight} onChange={handlePetChange} placeholder="e.g. 12.5" />
                </div>
              </div>
              
              <div className="sd-form-row" style={{alignItems: 'center', margin: '1rem 0'}}>
                <div className="sd-form-group" style={{flexDirection: 'row', alignItems: 'center', gap: '0.5rem'}}>
                  <input type="checkbox" name="vaccinated" checked={petFormData.vaccinated} onChange={handlePetChange} id="prof-vac" style={{width: 'auto'}} />
                  <label htmlFor="prof-vac" style={{margin: 0}}>Vaccinated</label>
                </div>
                <div className="sd-form-group" style={{flexDirection: 'row', alignItems: 'center', gap: '0.5rem'}}>
                  <input type="checkbox" name="neutered" checked={petFormData.neutered} onChange={handlePetChange} id="prof-neu" style={{width: 'auto'}} />
                  <label htmlFor="prof-neu" style={{margin: 0}}>Neutered / Spayed</label>
                </div>
              </div>

              <div className="sd-form-group">
                <label>Emergency Contact Info</label>
                <input type="text" name="emergencyContact" value={petFormData.emergencyContact} onChange={handlePetChange} placeholder="Name & Phone Number" />
              </div>

              <div className="sd-form-group">
                <label>Health Notes / Allergies</label>
                <textarea name="healthNotes" value={petFormData.healthNotes} onChange={handlePetChange} rows="2" placeholder="Any specific medical requirements..."></textarea>
              </div>
              <div className="sd-form-group">
                <label>Pet Photo</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {selectedFile ? <img src={URL.createObjectURL(selectedFile)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : petFormData.imageUrl ? <img src={petFormData.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🐾'}
                  </div>
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: '0.8rem' }} />
                </div>
                <label>Or Image URL</label>
                <input type="text" name="imageUrl" value={petFormData.imageUrl} onChange={handlePetChange} placeholder="https://..." />
              </div>
              <div className="sd-form-actions">
                <button type="button" className="sd-btn-cancel" onClick={() => { setIsPetModalOpen(false); setEditingPet(null); }}>Cancel</button>
                <button type="submit" className="sd-btn-save" disabled={petFormLoading}>{petFormLoading ? 'Working...' : editingPet ? 'Update Pet' : 'Add Pet'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleModalOpen && (
        <div className="sd-modal-overlay">
          <div className="sd-modal-box" style={{maxWidth: '400px'}}>
            <div className="sd-modal-head">
              <h2>Reschedule Booking</h2>
              <button className="sd-modal-close" onClick={() => setIsRescheduleModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleRescheduleSubmit} className="sd-form">
               <p style={{fontSize: '0.9rem', color: 'var(--muted-text)', marginBottom: '1.5rem'}}>Choose a new date for your <strong>{reschedulingApp?.service.name}</strong>.</p>
               <div className="sd-form-group">
                  <label>New Date</label>
                  <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} />
               </div>
               {!reschedulingApp?.service.name.includes('Boarding') && (
                 <div className="sd-form-group">
                    <label>New Time</label>
                    <select value={newTime} onChange={e => setNewTime(e.target.value)}>
                       {[10,11,12,13,15,16,17,18].map(h => (
                         <option key={h} value={`${h}:00`}>{h}:00 {h >= 12 ? 'PM' : 'AM'}</option>
                       ))}
                    </select>
                 </div>
               )}
               <div className="sd-form-actions" style={{marginTop: '2rem'}}>
                  <button type="button" className="sd-btn-cancel" onClick={() => setIsRescheduleModalOpen(false)}>Back</button>
                  <button type="submit" className="sd-btn-save">Submit Request</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {isProfileModalOpen && (
        <div className="sd-modal-overlay">
          <div className="sd-modal-box">
            <div className="sd-modal-head">
              <div>
                <h2>Account Settings</h2>
                <p>Update your personal information.</p>
              </div>
              <button className="sd-modal-close" onClick={() => setIsProfileModalOpen(false)}>✕</button>
            </div>
            {error && <div className="sd-form-error">{error}</div>}
            <form className="sd-form" onSubmit={handleProfileSubmit}>
              <div className="sd-form-group">
                <label>Full Name <span className="sd-req">*</span></label>
                <input type="text" name="name" value={profileFormData.name} onChange={handleProfileChange} required />
              </div>
              <div className="sd-form-group">
                <label>Email Address</label>
                <input type="email" value={user.email} disabled style={{background: 'rgba(255,255,255,0.06)', color: 'var(--hint-text)', border: '1px solid var(--border)', cursor: 'not-allowed'}} />
                <span style={{fontSize: '0.7rem', color: 'var(--muted-text)'}}>Email cannot be changed.</span>
              </div>
              <div className="sd-form-group">
                <label>Phone Number</label>
                <input type="text" name="phone" value={profileFormData.phone} onChange={handleProfileChange} placeholder="e.g. +91 98765-43210" />
              </div>
              {/* Password change removed as per user request */}
              <div className="sd-form-actions">
                <button type="button" className="sd-btn-cancel" onClick={() => setIsProfileModalOpen(false)}>Cancel</button>
                <button type="submit" className="sd-btn-save" disabled={profileFormLoading}>{profileFormLoading ? 'Updating...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

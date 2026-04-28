import React, { useState, useEffect } from 'react';
import API from '../services/api';

// Helper to create FormData for all flows
const createBookingFormData = (payload, file) => {
  const formData = new FormData();
  Object.keys(payload).forEach(key => {
    if (payload[key] !== undefined && payload[key] !== null) {
      if (typeof payload[key] === 'object') {
        formData.append(key, JSON.stringify(payload[key]));
      } else {
        formData.append(key, payload[key]);
      }
    }
  });
  if (file) {
    formData.append('petImage', file);
  }
  return formData;
};

// 1. BOARDING FLOW
const BoardingFlow = ({ provider, service, selectedPetId, showNewPetForm, newPetData, petFile, onComplete, setError, setLoading, loading, renderPetSelector }) => {
  const [dates, setDates] = useState({ start: '', end: '' });
  const [times, setTimes] = useState({ checkIn: '10:00', checkOut: '10:00' });
  const [dayTypes, setDayTypes] = useState({});

  const handleDateChange = (e) => {
    const newDates = { ...dates, [e.target.name]: e.target.value };
    setDates(newDates);
    if (newDates.start && newDates.end) {
      const start = new Date(newDates.start);
      const end = new Date(newDates.end);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return;
      if (start > end) {
        setDayTypes({});
        return;
      }
      
      const types = {};
      let current = new Date(start);
      let safety = 0;
      while (current <= end && safety < 60) {
        const dateStr = current.toISOString().split('T')[0];
        types[dateStr] = 1.0;
        current.setDate(current.getDate() + 1);
        safety++;
      }
      setDayTypes(types);
    }
  };

  const totalDays = Object.values(dayTypes).reduce((a, b) => a + b, 0);
  const pricePerDay = service?.price || provider.pricePerDay || 0;
  const totalPrice = totalDays * pricePerDay;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const startDateTime = `${dates.start}T${times.checkIn}:00`;
      const endDateTime = `${dates.end}T${times.checkOut}:00`;

      const payload = {
        providerId: provider.id,
        userPetId: showNewPetForm ? '' : selectedPetId,
        startDate: startDateTime,
        endDate: endDateTime,
        dayTypes,
        totalDays,
        pricePerDay: pricePerDay,
        totalPrice,
        newPet: showNewPetForm ? newPetData : null
      };
      const formData = createBookingFormData(payload, petFile);
      await API.post('/boarding', formData);
      onComplete();
    } catch (err) { 
      const msg = err.response?.data?.details || err.response?.data?.message || err.response?.data?.error || 'Booking failed';
      setError(msg); 
    }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Check-in Date</label>
          <input type="date" name="start" value={dates.start} onChange={handleDateChange} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-color)' }} />
          <input type="time" value={times.checkIn} onChange={e => setTimes({...times, checkIn: e.target.value})} style={{ width: '100%', marginTop: '0.5rem', padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.8rem', background: 'var(--surface)', color: 'var(--text-color)' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Check-out Date</label>
          <input type="date" name="end" value={dates.end} onChange={handleDateChange} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-color)' }} />
          <input type="time" value={times.checkOut} onChange={e => setTimes({...times, checkOut: e.target.value})} style={{ width: '100%', marginTop: '0.5rem', padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.8rem', background: 'var(--surface)', color: 'var(--text-color)' }} />
        </div>
      </div>
      <div style={{ background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.25)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center' }}>
        <p style={{ margin: 0, fontWeight: 700, color: 'var(--accent)' }}>Total: ₹{totalPrice.toLocaleString('en-IN')} ({totalDays} days × ₹{pricePerDay}/day)</p>
      </div>
      {renderPetSelector()}
      <button onClick={handleSubmit} disabled={loading || totalDays === 0 || !dates.start || !dates.end} className="setup-submit-btn">{loading ? 'Processing...' : 'Confirm Boarding'}</button>
    </div>
  );
};

// 2. GROOMING / VET FLOW
const SlotFlow = ({ provider, service, selectedPetId, showNewPetForm, newPetData, petFile, onComplete, setError, setLoading, loading, renderPetSelector, providerAvailability = [] }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    if (selectedDate) API.get(`/appointment/slots/${provider.id}/${selectedDate}`).then(res => setBookedSlots(res.data));
  }, [selectedDate, provider.id]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const appointmentDate = new Date(selectedDate);
      const [h, m] = selectedSlot.split(':');
      appointmentDate.setHours(parseInt(h), parseInt(m), 0, 0);
      const payload = {
        providerId: provider.id,
        serviceId: service.id,
        date: appointmentDate.toISOString(),
        userPetId: showNewPetForm ? '' : selectedPetId,
        newPet: showNewPetForm ? newPetData : null
      };
      const formData = createBookingFormData(payload, petFile);
      await API.post('/appointment', formData);
      onComplete();
    } catch (err) { 
      const msg = err.response?.data?.details || err.response?.data?.message || err.response?.data?.error || 'Booking failed';
      setError(msg); 
    }
    finally { setLoading(false); }
  };

  const dayOfWeek = selectedDate ? new Date(selectedDate).getDay() : -1;
  
  // Generate slots from availability or use defaults if none set
  const availableSlots = providerAvailability
    .filter(a => a.dayOfWeek === dayOfWeek && !a.isBlocked)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const slotsToRender = availableSlots.length > 0 
    ? availableSlots 
    : [10, 11, 12, 13, 15, 16, 17, 18].map(h => ({ startTime: `${h}:00`, id: h }));

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const currentHour = new Date().getHours();

  return (
    <div>
      <div style={{ marginBottom: '1.2rem' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Select Date</label>
        <input type="date" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(null); }} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-color)' }} min={new Date().toISOString().split('T')[0]} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.8rem', marginBottom: '1.5rem' }}>
        {slotsToRender.map(slot => {
          const timeLabel = slot.startTime;
          const hour = parseInt(timeLabel.split(':')[0]);
          const isBooked = bookedSlots.includes(hour) || bookedSlots.includes(timeLabel);
          const isPast = isToday && hour <= currentHour;
          
          return (
            <button key={slot.id || timeLabel} disabled={isBooked || isPast || dayOfWeek === -1} onClick={() => setSelectedSlot(timeLabel)}
              style={{ padding: '0.8rem', borderRadius: '10px', fontSize: '0.8rem', border: '1px solid var(--border)', fontWeight: 600,
                backgroundColor: (isBooked || isPast) ? 'rgba(255,255,255,0.05)' : selectedSlot === timeLabel ? 'rgba(74,222,128,0.15)' : 'var(--surface)',
                color: (isBooked || isPast) ? 'var(--danger)' : selectedSlot === timeLabel ? 'var(--accent)' : 'var(--muted-text)',
                opacity: isPast ? 0.6 : 1,
                cursor: (isBooked || isPast) ? 'not-allowed' : 'pointer'
              }}>
              {isBooked ? '🚫 Booked' : isPast ? '⌛ Expired' : `${timeLabel} ${hour < 12 ? 'AM' : 'PM'}`}
            </button>
          );
        })}
      </div>
      {dayOfWeek !== -1 && slotsToRender.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--danger)', textAlign: 'center', marginBottom: '1rem' }}>No availability set for this day by the provider.</p>}
      {renderPetSelector()}
      <button onClick={handleSubmit} disabled={loading || !selectedSlot || !selectedDate} className="setup-submit-btn">{loading ? 'Processing...' : 'Confirm Appointment'}</button>
    </div>
  );
};

// 3. TRAINING FLOW
const TrainingFlow = ({ provider, service, selectedPetId, showNewPetForm, newPetData, petFile, onComplete, setError, setLoading, loading, renderPetSelector }) => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [sessionTime, setSessionTime] = useState('10:00');
  
  const days = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(); d.setDate(new Date().getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        providerId: provider.id,
        userPetId: showNewPetForm ? '' : selectedPetId,
        dates: selectedDates,
        sessionTime,
        pricePerSession: service?.price || provider.pricePerSession,
        newPet: showNewPetForm ? newPetData : null
      };
      const formData = createBookingFormData(payload, petFile);
      await API.post('/training', formData);
      onComplete();
    } catch (err) { 
      const msg = err.response?.data?.details || err.response?.data?.message || err.response?.data?.error || 'Booking failed';
      setError(msg); 
    }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', background: 'rgba(74,222,128,0.08)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(74,222,128,0.20)' }}>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.5rem' }}>🕒 1. Select Training Time</label>
        <select value={sessionTime} onChange={(e) => setSessionTime(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1.5px solid rgba(74,222,128,0.25)', background: 'var(--surface)', color: 'var(--text-color)', fontSize: '1rem', fontWeight: 600, outline: 'none' }}>
          {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(h => (
            <option key={h} value={`${h < 10 ? '0' + h : h}:00`}>{h}:00 {h < 12 ? 'AM' : 'PM'}</option>
          ))}
        </select>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--muted-text)' }}>This time will be applied to all selected dates below.</p>
      </div>

      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '0.5rem' }}>📅 2. Pick Your Dates</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '1.5rem', maxHeight: '180px', overflowY: 'auto', padding: '0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
        {days.map(date => {
          const d = new Date(date);
          const isSelected = selectedDates.includes(date);
          const isToday = date === new Date().toISOString().split('T')[0];
          
          return (
            <button key={date} onClick={() => setSelectedDates(prev => isSelected ? prev.filter(d => d !== date) : [...prev, date])}
              style={{ padding: '0.6rem 0.4rem', borderRadius: '8px', fontSize: '0.75rem', border: '1px solid var(--border)', fontWeight: 700, transition: 'all 0.2s',
                backgroundColor: isSelected ? 'rgba(74,222,128,0.15)' : isToday ? 'rgba(74,222,128,0.10)' : 'var(--surface)', 
                color: isSelected ? 'var(--accent)' : 'var(--muted-text)',
                boxShadow: isSelected ? '0 4px 18px rgba(74,222,128,0.12)' : 'none',
                borderBottom: isToday ? '3px solid var(--accent)' : '1px solid var(--border)'
              }}>
              <span style={{ display: 'block', fontSize: '0.6rem', opacity: 0.7 }}>{d.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
              {d.getDate()} {d.toLocaleDateString('en-IN', { month: 'short' })}
              {isToday && <span style={{display: 'block', fontSize: '0.5rem', color: 'var(--accent)'}}>Today</span>}
            </button>
          );
        })}
      </div>

      {selectedDates.length > 0 && (
        <div style={{ background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.25)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center' }}>
          <p style={{ margin: 0, fontWeight: 700, color: 'var(--accent)' }}>
            Total: ₹{((service?.price || 0) * selectedDates.length).toLocaleString('en-IN')} ({selectedDates.length} session{selectedDates.length > 1 ? 's' : ''} × ₹{service?.price || 0}/session)
          </p>
        </div>
      )}
      {renderPetSelector()}
      <button onClick={handleSubmit} disabled={loading || selectedDates.length === 0} className="setup-submit-btn" style={{ background: 'var(--accent)', color: '#0a1a10', padding: '1rem', fontSize: '1rem' }}>
        {loading ? 'Processing...' : `Confirm ${selectedDates.length} Session${selectedDates.length > 1 ? 's' : ''} at ${sessionTime}`}
      </button>
    </div>
  );
};

const BookingManager = ({ provider, service, userPets, onComplete, onClose }) => {
  const [selectedPetId, setSelectedPetId] = useState(userPets.length > 0 ? userPets[0].id : '');
  const [showNewPetForm, setShowNewPetForm] = useState(userPets.length === 0);
  const [newPetData, setNewPetData] = useState({ 
    name: '', type: 'DOG', breed: '', gender: 'MALE', dateOfBirth: '', 
    vaccinated: false, neutered: false, weight: '', healthNotes: '', emergencyContact: '' 
  });
  const [petFile, setPetFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [providerAvailability, setProviderAvailability] = useState([]);

  useEffect(() => {
    API.get(`/availability/${provider.id}`).then(res => setProviderAvailability(res.data)).catch(console.error);
  }, [provider.id]);

  const renderPetSelector = () => {
    const selectedPet = userPets.find(p => p.id === selectedPetId);
    const requiresVaccination = provider.type === 'VET' || provider.type === 'BOARDING';
    const showVaccinationWarning = !showNewPetForm && selectedPet && !selectedPet.vaccinated;

    return (
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.8rem', fontSize: '0.85rem' }}>
          <label><input type="radio" checked={!showNewPetForm} onChange={() => setShowNewPetForm(false)} /> Existing</label>
          <label><input type="radio" checked={showNewPetForm} onChange={() => setShowNewPetForm(true)} /> + New</label>
        </div>
        {!showNewPetForm ? (
          <>
            <select value={selectedPetId} onChange={(e) => setSelectedPetId(e.target.value)} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #ddd' }}>
              {userPets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.breed || p.type})</option>)}
            </select>
            {requiresVaccination && showVaccinationWarning && (
              <div style={{ marginTop: '0.5rem', padding: '0.8rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.7rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <span style={{fontSize: '1.2rem'}}>⚠️</span> 
                <div>
                  <strong style={{display: 'block'}}>Pet Not Vaccinated</strong>
                  <p style={{margin: 0, opacity: 0.9}}>This service usually requires up-to-date vaccinations. The provider may reject your booking. You can update this in your <strong>Profile</strong>.</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input type="text" placeholder="Pet Name" required value={newPetData.name} onChange={e => setNewPetData({...newPetData, name: e.target.value})} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.8rem' }} />
              <select value={newPetData.type} onChange={e => setNewPetData({...newPetData, type: e.target.value})} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.8rem' }}>
                <option value="DOG">Dog</option><option value="CAT">Cat</option><option value="BIRD">Bird</option><option value="HAMSTER">Hamster</option><option value="RABBIT">Rabbit</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input type="text" placeholder="Breed" value={newPetData.breed} onChange={e => setNewPetData({...newPetData, breed: e.target.value})} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-color)', fontSize: '0.8rem' }} />
              <select value={newPetData.gender} onChange={e => setNewPetData({...newPetData, gender: e.target.value})} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-color)', fontSize: '0.8rem' }}>
                <option value="MALE">Male</option><option value="FEMALE">Female</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <input type="date" required value={newPetData.dateOfBirth} onChange={e => setNewPetData({...newPetData, dateOfBirth: e.target.value})} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-color)', fontSize: '0.8rem' }} />
              <input type="number" placeholder="Weight (kg)" value={newPetData.weight} onChange={e => setNewPetData({...newPetData, weight: e.target.value})} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-color)', fontSize: '0.8rem' }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.8rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-text)' }}>
               <label style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}><input type="checkbox" checked={newPetData.vaccinated} onChange={e => setNewPetData({...newPetData, vaccinated: e.target.checked})} /> Vaccinated</label>
               <label style={{display: 'flex', alignItems: 'center', gap: '0.3rem'}}><input type="checkbox" checked={newPetData.neutered} onChange={e => setNewPetData({...newPetData, neutered: e.target.checked})} /> Neutered</label>
            </div>

            <div style={{ marginBottom: '0.8rem' }}>
               <textarea placeholder="Health Notes / Allergies" value={newPetData.healthNotes} onChange={e => setNewPetData({...newPetData, healthNotes: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-color)', fontSize: '0.8rem', height: '50px', outline: 'none' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <button style={{ width: '100%', height: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.75rem', textAlign: 'left', color: petFile ? 'var(--accent)' : 'var(--muted-text)' }}>
                  {petFile ? '✅ Image Selected' : '📁 Upload Photo'}
                </button>
                <input type="file" accept="image/*" onChange={e => setPetFile(e.target.files[0])} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
              </div>
              <input type="text" placeholder="Emergency Contact" value={newPetData.emergencyContact} onChange={e => setNewPetData({...newPetData, emergencyContact: e.target.value})} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-color)', fontSize: '0.8rem' }} />
            </div>
          </div>
        )}
      </div>
    );
  };

  const sharedProps = { provider, service, selectedPetId, showNewPetForm, newPetData, petFile, onComplete, setError, setLoading, loading, renderPetSelector, providerAvailability };

  return (
    <div style={{ animation: 'slideUp 0.3s ease-out' }}>
      {error && <div style={{ color: 'var(--danger)', background: 'rgba(248,113,113,0.14)', border: '1px solid rgba(248,113,113,0.25)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
      {provider.type === 'BOARDING' ? <BoardingFlow {...sharedProps} /> : provider.type === 'TRAINING' ? <TrainingFlow {...sharedProps} /> : <SlotFlow {...sharedProps} isVet={provider.type === 'VET'} />}
    </div>
  );
};

export default BookingManager;

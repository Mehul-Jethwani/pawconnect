import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { getToken } from '../utils/auth';
import { formatImageUrl } from '../utils/imageUtils';
import BookingManager from '../components/BookingManager';
import './PetDetails.css'; 
import '../components/ServiceProviderSetup.css';
const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingService, setBookingService] = useState(null); // Service being booked
  const [bookingDate, setBookingDate] = useState(null); // Selected Date object
  const [bookingSlot, setBookingSlot] = useState(null); // Selected Hour (Number)
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [userPets, setUserPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [showNewPetForm, setShowNewPetForm] = useState(false);
  const [newPetData, setNewPetData] = useState({ name: '', type: 'DOG', breed: '', gender: 'MALE', dateOfBirth: '' });
  const [bookedSlots, setBookedSlots] = useState([]);

  // Fetch booked slots whenever date changes
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!bookingDate || !provider) {
        setBookedSlots([]);
        return;
      }
      try {
        // Safe local date formatting
        const dateObj = new Date(bookingDate.getTime() - (bookingDate.getTimezoneOffset() * 60000));
        const dateStr = dateObj.toISOString().split('T')[0];
        const res = await API.get(`/appointment/booked-slots?providerId=${provider.id}&date=${dateStr}`);
        setBookedSlots(res.data);
      } catch (err) { console.error('Error fetching slots:', err); }
    };
    fetchBookedSlots();
  }, [bookingDate, provider]);

  // Generate 7 days from today
  const getNextSevenDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        days.push(d);
    }
    return days;
  };

  const slots = [10, 11, 12, 13, 15, 16, 17, 18]; // 10 AM to 6 PM (skipping 14 = 2 PM)

  const fetchProvider = async () => {
    try {
      const res = await API.get(`/service-provider/${id}`);
      setProvider(res.data);
    } catch (error) {
      console.error('Error fetching provider details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    const fetchUserPets = async () => {
      if (!getToken()) return;
      try {
        const res = await API.get('/user-pet/my');
        setUserPets(res.data);
        if (res.data.length > 0) setSelectedPetId(res.data[0].id);
        else setShowNewPetForm(true);
      } catch (err) { console.error('Error fetching pets:', err); }
    };
    fetchUserPets();
    fetchProvider(); 
  }, [id]);

  const handleBookingComplete = () => {
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setBookingService(null);
    }, 3000);
  };

  if (loading) return <div className="page-container text-center mt-4"><h2>Loading...</h2></div>;
  if (!provider) return <div className="page-container text-center mt-4"><h2>Provider not found</h2><Link to="/services" className="btn btn-primary mt-4">Back to Services</Link></div>;

  return (
    <div className="pet-details-page">
      <div className="pet-details-header">
        <Link to="/services" className="back-link">← Back to Services</Link>
      </div>
      
      <div className="pet-details-container">
        <div className="pet-image-section">
          <img src={formatImageUrl(provider.imageUrl) || 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=800'} alt={provider.name} className="pet-main-image" />
        </div>
        
        <div className="pet-info-section">
          <div className="pet-title-row">
            <h1>{provider.name}</h1>
            <span className="pet-badge" style={{backgroundColor: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.25)', color: 'var(--accent)'}}>{provider.type?.replace('_', ' ')}</span>
          </div>
          
          <div className="pet-meta">
            <span className="pet-location">📍 {provider.city?.name}</span>
            <span className="pet-listed-date">{provider.address}</span>
          </div>
          
          <div className="pet-description-section">
            <h3>About Us</h3>
            <p className="pet-description">{provider.description || 'Welcome to our clinic! We provide professional pet care services with a focus on empathy and efficiency.'}</p>
          </div>

          <div className="services-list-section" style={{marginTop: '2rem'}}>
            <h3>Available Services</h3>
            <div className="services-grid" style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem', width: '100%'}}>
              {/* Specialized Primary Service Card */}
              {(provider.type === 'BOARDING' || provider.type === 'TRAINING') && (() => {
                const specialService = provider.services?.[0];
                return (
                  <div style={{padding: '1.25rem', border: '1px solid rgba(74,222,128,0.25)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(74,222,128,0.08)', transition: '0.2s', width: '100%', boxSizing: 'border-box'}}>
                    <div style={{flex: 1, minWidth: 0, paddingRight: '1.5rem'}}>
                      <h4 style={{margin: 0, color: 'var(--text-color)', fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{provider.type === 'BOARDING' ? '🏠 Pet Boarding' : '🎓 Pet Training'}</h4>
                      <p style={{margin: '0.3rem 0', color: 'var(--muted-text)', fontSize: '0.85rem', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical'}}>{specialService?.description || provider.description || `Professional ${provider.type.toLowerCase()} services.`}</p>
                      <span style={{fontWeight: '800', color: 'var(--accent)', fontSize: '1.1rem'}}>
                        {specialService ? `₹${specialService.price}` : 'Contact for pricing'}
                        {specialService && <span style={{fontSize: '0.8rem', fontWeight: 500, opacity: 0.8}}> / {provider.type === 'BOARDING' ? 'day' : 'session'}</span>}
                      </span>
                    </div>
                    <button className="btn btn-primary" style={{padding: '0.7rem 1.5rem', whiteSpace: 'nowrap', flexShrink: 0}} onClick={() => setBookingService(specialService || { name: provider.type, id: 'specialized', price: 0 })}>Book Now</button>
                  </div>
                );
              })()}

              {provider.services?.length === 0 && provider.type !== 'BOARDING' && provider.type !== 'TRAINING' ? (
                <div style={{textAlign: 'center', padding: '2rem', background: 'var(--card)', borderRadius: '12px', border: '1px dashed var(--border)', width: '100%'}}>
                  <p style={{margin: 0, color: 'var(--muted-text)'}}>No specific services listed yet. Contact the provider for details.</p>
                </div>
              ) : (
                provider.services?.map(service => (
                  <div key={service.id} style={{padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--card)', boxShadow: '0 2px 12px rgba(0,0,0,0.18)', width: '100%', boxSizing: 'border-box'}}>
                    <div style={{flex: 1, minWidth: 0, paddingRight: '1.5rem'}}>
                      <h4 style={{margin: 0, color: 'var(--text-color)', fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{service.name}</h4>
                      <p style={{margin: '0.3rem 0', color: 'var(--muted-text)', fontSize: '0.85rem', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical'}}>{service.description}</p>
                      <span style={{fontWeight: '800', color: 'var(--accent)', fontSize: '1.1rem'}}>₹{service.price}</span>
                    </div>
                    <button className="btn btn-primary" style={{padding: '0.7rem 1.5rem', whiteSpace: 'nowrap', flexShrink: 0}} onClick={() => setBookingService(service)}>Book Now</button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pet-contact-card">
            <h3>Contact Information</h3>
            <p><strong>Phone:</strong> {provider.contactPhone || 'Contact store for details'}</p>
            <p className="contact-note">All appointments are subject to provider confirmation.</p>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingService && (
        <div className="sd-modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
          <div className="sd-modal-box" style={{background: 'var(--card)', padding: '2.5rem', borderRadius: '24px', width: '90%', maxWidth: '500px', position: 'relative', border: '1px solid var(--border)'}}>
            <button style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: '10px', width: '36px', height: '36px', fontSize: '1rem', cursor: 'pointer', color: 'var(--text-color)' }} onClick={() => setBookingService(null)}>✕</button>
            
            <h2 style={{ marginBottom: bookingSuccess ? '0' : '0.5rem', textAlign: 'center' }}>{bookingSuccess ? '✅ Success!' : `Book ${bookingService.name}`}</h2>
            
            {bookingSuccess ? (
              <div className="booking-success-anim" style={{textAlign: 'center', padding: '1rem 0'}}>
                <div style={{fontSize: '4rem', marginBottom: '1rem'}}>✨</div>
                <h3 style={{color: 'var(--accent)', marginBottom: '0.5rem'}}>Booking Confirmed!</h3>
                <p style={{color: 'var(--muted-text)', fontSize: '0.95rem'}}>Your request has been sent to <strong>{provider.name}</strong>.</p>
                <p style={{fontSize: '0.85rem', color: 'var(--hint-text)', marginTop: '1rem'}}>Closing window in a moment...</p>
              </div>
            ) : (
              <BookingManager 
                provider={provider} 
                service={bookingService} 
                userPets={userPets} 
                onComplete={handleBookingComplete}
                onClose={() => setBookingService(null)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetails;

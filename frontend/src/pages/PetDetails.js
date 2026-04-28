import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { getUser } from '../utils/auth';
import { formatImageUrl, getPlaceholderImage } from '../utils/imageUtils';
import './PetDetails.css';

const getAge = (dob) => {
  const birth = new Date(dob);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  return `${years === 0 ? '' : years + (years === 1 ? ' year ' : ' years ')}${months === 0 ? '' : months + (months === 1 ? ' month' : ' months')}`.trim() || 'Less than a month';
};

const PetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState('');
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquiryThread, setEnquiryThread] = useState(null); 
  const [messages, setMessages] = useState([]);
  const [followUpText, setFollowUpText] = useState('');
  const currentUser = getUser();

  const formatWeight = (w) => {
    if (!w) return "Not specified";
    const val = parseFloat(w);
    if (isNaN(val)) return w;
    if (val < 1) return `${Math.round(val * 1000)} g`;
    return `${Math.round(val)} kg`;
  };

  const handleAdopt = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setSubmittingEnquiry(true);
    setEnquiryMessage('');
    try {
      await API.post(`/pet/${id}/enquiry`, { question: `🐾 ADOPTION INTEREST: I am interested in adopting ${pet.name}! Please let me know the next steps.` });
      setEnquiryMessage('Your adoption interest has been sent! The store will reply soon.');
      fetchEnquiryThread();
    } catch (err) {
      setEnquiryMessage('Failed to send adoption request. Please try again.');
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  const fetchEnquiryThread = async () => {
    if (!currentUser) return;
    try {
      const res = await API.get(`/pet/${id}/enquiries`);
      const myEnq = res.data.find(e => e.userId === currentUser.id);
      if (myEnq) {
        setEnquiryThread(myEnq);
        fetchMessages(myEnq.id);
      }
    } catch (err) { console.error('Error fetching enquiries:', err); }
  };

  const fetchMessages = async (enquiryId) => {
    try {
      const res = await API.get(`/enquiry/${enquiryId}/messages`);
      setMessages(res.data);
    } catch (err) { console.error('Error fetching messages:', err); }
  };

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const res = await API.get(`/pet/${id}`);
        setPet(res.data);
      } catch (error) {
        console.error('Error fetching pet details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
    fetchEnquiryThread();
  }, [id]);

  useEffect(() => {
    let interval;
    if (enquiryThread) {
      interval = setInterval(() => fetchMessages(enquiryThread.id), 15000);
    }
    return () => clearInterval(interval);
  }, [enquiryThread]);

  const handleFollowUpSubmit = async (e) => {
    e.preventDefault();
    if (!followUpText.trim() || !enquiryThread) return;
    try {
      await API.post(`/enquiry/${enquiryThread.id}/messages`, { text: followUpText });
      setFollowUpText('');
      fetchMessages(enquiryThread.id);
    } catch (err) { alert('Failed to send message'); }
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setSubmittingEnquiry(true);
    setEnquiryMessage('');
    try {
      await API.post(`/pet/${id}/enquiry`, { question: newQuestion });
      setEnquiryMessage('Your question has been sent! The store will reply soon.');
      setNewQuestion('');
      fetchEnquiryThread();
    } catch (err) {
      setEnquiryMessage('Failed to send question. Please try again.');
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  if (loading) return <div className="page-container text-center mt-4"><h2>Loading...</h2></div>;
  if (!pet) return <div className="page-container text-center mt-4"><h2>Pet not found</h2><Link to="/pets" className="btn btn-primary mt-4">Back to Pets</Link></div>;

  return (
    <div className="pet-details-page">
      <div className="pet-details-header">
        <Link to="/pets" className="back-link">← Back to Browse Pets</Link>
      </div>
      
      <div className="pet-details-container">
        <div className="pet-image-section">
          <img 
            src={formatImageUrl(pet.imageUrl, pet.type, pet.id)} 
            alt={pet.name} 
            className="pet-main-image" 
            onError={e => { e.target.onerror = null; e.target.src = getPlaceholderImage(pet.type, pet.id); }}
          />
        </div>
        
        <div className="pet-info-section">
          <div className="pet-title-row">
            <h1>{pet.name}</h1>
            <div className="pet-badges" style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
              <span className="pet-badge status-badge" style={{
                backgroundColor: pet.status === 'AVAILABLE' ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)',
                border: pet.status === 'AVAILABLE' ? '1px solid rgba(74,222,128,0.25)' : '1px solid var(--border)',
                color: pet.status === 'AVAILABLE' ? 'var(--accent)' : 'var(--muted-text)'
              }}>{pet.status}</span>
              <span className="pet-badge">{pet.type}</span>
              {pet.vaccinated && <span className="pet-badge" style={{backgroundColor: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.25)', color: 'var(--accent)'}}>🛡️ Vaccinated</span>}
              {pet.neutered && <span className="pet-badge" style={{backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--muted-text)'}}>✂️ Neutered</span>}
            </div>
          </div>
          
          <div className="pet-meta">
            <span className="pet-location">📍 {pet.locationCity || pet.city?.name || pet.city}</span>
            <span className="pet-listed-date">🕒 Listed On: {new Date(pet.createdAt).toLocaleDateString()}</span>
          </div>
          
          <div className="pet-stats-grid">
            <div className="info-box">
              <span className="info-label">Breed</span>
              <span className="info-value">{pet.breed}</span>
            </div>
            <div className="info-box">
              <span className="info-label">Age</span>
              <span className="info-value">{getAge(pet.dateOfBirth)}</span>
            </div>
            <div className="info-box">
              <span className="info-label">Date of Birth</span>
              <span className="info-value">{new Date(pet.dateOfBirth).toLocaleDateString()}</span>
            </div>
            <div className="info-box">
              <span className="info-label">Gender</span>
              <span className="info-value">{pet.gender}</span>
            </div>
            <div className="info-box">
              <span className="info-label">Weight:</span>
              <span className="info-value" style={{ marginLeft: '4px' }}>{formatWeight(pet.weight)}</span>
            </div>
            {pet.adoptionFee && (
              <div className="info-box" style={{background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.25)'}}>
                <span className="info-label" style={{color: 'var(--muted-text)'}}>Adoption Fee</span>
                <span className="info-value" style={{color: 'var(--accent)', fontWeight: 800}}>₹{pet.adoptionFee}</span>
              </div>
            )}
            {pet.color && (
              <div className="info-box">
                <span className="info-label">Color</span>
                <span className="info-value">{pet.color}</span>
              </div>
            )}
          </div>

          <div className="pet-description-section">
            <h3>About {pet.name}</h3>
            <p className="pet-description">{pet.description}</p>
            {pet.healthNotes && (
              <div style={{marginTop: '1.5rem', padding: '1rem', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '2.5px solid var(--accent)'}}>
                <h4 style={{margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--muted-text)', textTransform: 'uppercase'}}>Medical & Health Notes</h4>
                <p style={{margin: 0, fontSize: '0.95rem', color: 'var(--muted-text)'}}>{pet.healthNotes}</p>
              </div>
            )}
          </div>

          {/* Combined Adoption & Enquiry Card */}
          <div className="pet-contact-card" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(74,222,128,0.08)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>💬</span> {enquiryThread ? `Conversation about ${pet.name}` : `Ask About ${pet.name}`}
            </h3>
            
            <div className="contact-details" style={{ marginBottom: '1rem' }}>
              <p><strong>Store Name:</strong> {pet.store?.name}</p>
              <p><strong>City:</strong> {pet.locationCity || pet.city?.name || pet.city}</p>
            </div>

            {enquiryThread ? (
              <div style={{ background: 'var(--bg)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                 <div style={{ padding: '1rem', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                   <p style={{ margin: 0, fontWeight: 700, color: 'var(--hint-text)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Initial Question</p>
                   <p style={{ margin: '0.3rem 0 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-color)' }}>{enquiryThread.question}</p>
                 </div>
                 
                 <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', minHeight: '100px', maxHeight: '300px', overflowY: 'auto' }}>
                    {messages.length === 0 && !enquiryThread.answer && (
                      <p style={{ textAlign: 'center', color: 'var(--muted-text)', fontStyle: 'italic', fontSize: '0.9rem' }}>Awaiting response from the store...</p>
                    )}
                    {enquiryThread.answer && messages.length === 0 && (
                      <div style={{ alignSelf: 'flex-start', maxWidth: '85%', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.25)', padding: '0.8rem', borderRadius: '12px 12px 12px 0' }}>
                         <p style={{ margin: 0, fontWeight: 700, color: 'var(--accent)', fontSize: '0.7rem' }}>STORE OWNER</p>
                         <p style={{ margin: '0.2rem 0 0', fontSize: '0.95rem', color: 'var(--accent)' }}>{enquiryThread.answer}</p>
                      </div>
                    )}
                    {messages.map(msg => {
                      const isMe = msg.senderRole === 'USER';
                      return (
                        <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%', background: isMe ? 'var(--card)' : 'rgba(74,222,128,0.15)', border: isMe ? '1px solid var(--border)' : '1px solid rgba(74,222,128,0.25)', color: isMe ? 'var(--text-color)' : 'var(--accent)', padding: '0.7rem 1rem', borderRadius: isMe ? '12px 12px 0 12px' : '12px 12px 12px 0' }}>
                          <p style={{ margin: 0, fontSize: '0.95rem' }}>{msg.message}</p>
                          <span style={{ fontSize: '0.6rem', color: 'var(--hint-text)', display: 'block', marginTop: '0.2rem', textAlign: isMe ? 'right' : 'left' }}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      );
                    })}
                 </div>

                 {/* Reply input for continuing the conversation */}
                 <div style={{ padding: '0.8rem 1rem', borderTop: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', gap: '0.5rem' }}>
                   <input
                     type="text"
                     value={followUpText}
                     onChange={(e) => setFollowUpText(e.target.value)}
                     onKeyDown={(e) => { if (e.key === 'Enter') handleFollowUpSubmit(e); }}
                     placeholder="Continue the conversation..."
                     style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-color)', fontSize: '0.9rem', outline: 'none' }}
                   />
                   <button onClick={handleFollowUpSubmit} disabled={!followUpText.trim()} className="btn btn-primary" style={{ borderRadius: '20px', padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>Send</button>
                 </div>

              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p className="contact-note" style={{ margin: 0, fontSize: '0.85rem' }}>Your enquiry goes directly to the store owner. They will reply as soon as possible.</p>
                
                {currentUser?.role === 'USER' ? (
                  <>
                    {enquiryMessage && (
                      <div style={{ padding: '0.8rem', borderRadius: '8px', border: `1px solid ${enquiryMessage.includes('sent') ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`, background: enquiryMessage.includes('sent') ? 'rgba(74,222,128,0.10)' : 'rgba(248,113,113,0.14)', color: enquiryMessage.includes('sent') ? 'var(--accent)' : 'var(--danger)', fontSize: '0.85rem' }}>
                        {enquiryMessage}
                      </div>
                    )}
                    <textarea 
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder={`Ask anything about ${pet.name}... e.g. Is it vaccinated?`}
                      style={{ width: '100%', height: '80px', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-color)', outline: 'none', fontSize: '0.9rem' }}
                    />
                    <div style={{ display: 'block', marginTop: '0.8rem' }}>
                      <button onClick={handleEnquirySubmit} disabled={submittingEnquiry} className="btn btn-outline" style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem' }}>
                        {submittingEnquiry ? 'Sending...' : 'Send Enquiry'}
                      </button>
                    </div>
                  </>
                ) : !currentUser ? (
                  <div style={{ padding: '1.5rem', background: 'var(--surface)', borderRadius: '12px', textAlign: 'center', border: '1px dashed var(--border)' }}>
                    <p style={{ color: 'var(--muted-text)', marginBottom: '1rem', fontSize: '0.9rem' }}>Login to enquire or adopt</p>
                    <Link to="/login" className="btn btn-primary" style={{ fontSize: '0.9rem' }}>Login Now</Link>
                  </div>
                ) : (
                   <p style={{ color: 'var(--muted-text)', textAlign: 'center', fontSize: '0.9rem' }}>Only registered users can send enquiries or adopt.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Section about Enquiry Process */}
      {!enquiryThread && (
        <div className="pet-details-container" style={{ marginTop: '2rem', display: 'block', padding: '1.5rem', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-color)' }}>Enquiry Process</h4>
          <ul style={{ color: 'var(--muted-text)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1.2rem' }}>
            <li>Your question goes directly to the store owner.</li>
            <li>You will be notified once they respond.</li>
            <li>You can have a full conversation right here.</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PetDetails;

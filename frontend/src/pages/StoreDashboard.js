import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import './StoreDashboard.css';

const StoreDashboard = () => {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasStore, setHasStore] = useState(false);
  const [pets, setPets] = useState([]);
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [petFormError, setPetFormError] = useState('');
  const [petFormLoading, setPetFormLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [petFormData, setPetFormData] = useState({
    name: '', breed: '', type: 'DOG', gender: 'MALE',
    dateOfBirth: '', weight: '', status: 'AVAILABLE', description: '', imageUrl: '',
    vaccinated: false, neutered: false, healthNotes: '', adoptionFee: '', color: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // Store setup state (for users who registered before auto-store-creation)
  const [cities, setCities] = useState([]);
  const [storeSetupData, setStoreSetupData] = useState({ name: '', address: '', cityId: '' });
  const [storeSetupError, setStoreSetupError] = useState('');
  const [storeSetupLoading, setStoreSetupLoading] = useState(false);

  // Enquiry state
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'enquiries'
  const [enquiries, setEnquiries] = useState([]);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState({}); // { enquiryId: 'text' }
  const [replyLoading, setReplyLoading] = useState(false);
  const [initialEnquiriesLoaded, setInitialEnquiriesLoaded] = useState(false);
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState('ALL');
  const fetchCities = async () => {
    try {
      const response = await api.get('/city');
      setCities(response.data);
    } catch (error) {
      console.error('Failed to fetch cities:', error);
    }
  };

  const fetchMyStore = async () => {
    try {
      setLoading(true);
      const response = await api.get('/store/my');
      setStore(response.data);
      setHasStore(true);
    } catch (error) {
      if (error.response?.status === 404) {
        setHasStore(false);
        fetchCities(); // Load cities if store needs setup
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStoreSetupChange = (e) => {
    setStoreSetupData({ ...storeSetupData, [e.target.name]: e.target.value });
  };

  const handleStoreSetupSubmit = async (e) => {
    e.preventDefault();
    if (!storeSetupData.cityId) {
      setStoreSetupError('Please select a city.');
      return;
    }
    setStoreSetupLoading(true);
    setStoreSetupError('');
    try {
      const response = await api.post('/store', {
        ...storeSetupData,
        cityId: parseInt(storeSetupData.cityId)
      });
      setStore(response.data);
      setHasStore(true);
      await fetchStorePets();
    } catch (error) {
      setStoreSetupError(error.response?.data?.message || 'Failed to create store.');
    } finally {
      setStoreSetupLoading(false);
    }
  };

  const fetchStorePets = async () => {
    try {
      const response = await api.get('/pet/my-store');
      setPets(response.data);
    } catch (error) {
      console.error('Failed to fetch store pets:', error);
    }
  };

  const fetchStoreEnquiries = async () => {
    try {
      const res = await api.get('/enquiry/store');
      setEnquiries(res.data);
      if (!initialEnquiriesLoaded) {
        if (res.data.length > 0) {
          toast.info(`You have ${res.data.length} pending pet enquiries waiting for a reply!`, { icon: '💬' });
        }
        setInitialEnquiriesLoaded(true);
      }
    } catch (err) { console.error('Error fetching enquiries:', err); }
  };

  const handleReplyChange = (enquiryId, text) => {
    setReplyText({ ...replyText, [enquiryId]: text });
  };

  const handleReplySubmit = async (enquiryId) => {
    const text = replyText[enquiryId];
    if (!text?.trim()) return;
    setReplyLoading(true);
    try {
      await api.post(`/enquiry/${enquiryId}/messages`, { message: text });
      fetchEnquiryMessages(enquiryId);
      setReplyText({ ...replyText, [enquiryId]: '' });
    } catch (err) { alert('Failed to send reply'); }
    finally { setReplyLoading(false); }
  };

  const fetchEnquiryMessages = async (enquiryId) => {
    try {
      const res = await api.get(`/enquiry/${enquiryId}/messages`);
      setMessages(res.data);
    } catch (err) { console.error('Error fetching messages:', err); }
  };

  useEffect(() => {
    let interval;
    if (activeTab === 'enquiries' && selectedEnquiryId) {
      fetchEnquiryMessages(selectedEnquiryId);
      interval = setInterval(() => fetchEnquiryMessages(selectedEnquiryId), 5000);
    }
    return () => clearInterval(interval);
  }, [activeTab, selectedEnquiryId]);

  useEffect(() => {
    fetchMyStore();
    // Mark notifications as seen when entering dashboard
    api.post('/notifications/seen').catch(err => console.error('Mark seen error', err));
  }, []);
  useEffect(() => { 
    if (hasStore) {
      fetchStorePets();
      fetchStoreEnquiries();
    } 
  }, [hasStore]);

  const handlePetChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPetFormData({ ...petFormData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const openAddPetModal = () => {
    setEditingPet(null);
    setPetFormData({ name: '', breed: '', type: 'DOG', gender: 'MALE', dateOfBirth: '', weight: '', status: 'AVAILABLE', description: '', imageUrl: '', vaccinated: false, neutered: false, healthNotes: '', adoptionFee: '', color: '' });
    setPetFormError('');
    setIsPetModalOpen(true);
  };

  const openEditPetModal = (pet) => {
    setEditingPet(pet);
    const dob = pet.dateOfBirth ? new Date(pet.dateOfBirth).toISOString().split('T')[0] : '';
    setPetFormData({
      name: pet.name, breed: pet.breed, type: pet.type, gender: pet.gender,
      dateOfBirth: dob, weight: pet.weight || '', status: pet.status,
      description: pet.description || '', imageUrl: pet.imageUrl || '',
      vaccinated: pet.vaccinated || false, neutered: pet.neutered || false,
      healthNotes: pet.healthNotes || '', adoptionFee: pet.adoptionFee || '', color: pet.color || ''
    });
    setPetFormError('');
    setIsPetModalOpen(true);
  };

  const closePetModal = () => { setIsPetModalOpen(false); setEditingPet(null); };

  const handlePetSubmit = async (e) => {
    e.preventDefault();
    setPetFormLoading(true);
    setPetFormError('');

    const formData = new FormData();
    Object.keys(petFormData).forEach(key => {
      formData.append(key, petFormData[key]);
    });
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    try {
      if (editingPet) {
        await api.patch(`/pet/${editingPet.id}`, formData);
      } else {
        await api.post('/pet', formData);
      }
      await fetchStorePets();
      closePetModal();
    } catch (error) {
      setPetFormError(error.response?.data?.error || 'Failed to save pet.');
    } finally {
      setPetFormLoading(false);
    }
  };

  const handleDeletePet = async (id) => {
    try {
      await api.delete(`/pet/${id}`);
      setDeleteConfirmId(null);
      await fetchStorePets();
    } catch (error) {
      alert('Failed to delete pet');
    }
  };

  const handleQuickStatusChange = async (petId, newStatus) => {
    try {
      const fd = new FormData();
      fd.append('status', newStatus);
      await api.patch(`/pet/${petId}`, fd);
      await fetchStorePets();
    } catch (error) {
      console.error(error);
      alert('Failed to update status quickly. Please edit via the modal.');
    }
  };

  const calculateAge = (dobString) => {
    if (!dobString) return 'N/A';
    const dob = new Date(dobString);
    const now = new Date();
    const months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    if (months < 12) return `${months}mo`;
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    return `${years}y${remMonths > 0 ? ` ${remMonths}mo` : ''}`;
  };

  const typeLabel = (t) => ({ DOG: 'Dog', CAT: 'Cat', BIRD: 'Bird', HAMSTER: 'Hamster', RABBIT: 'Rabbit', GUINEA_PIG: 'Guinea Pig' }[t] || t);

  // statusCounts was here but removed as it was unused in new tabs layout

  if (loading) {
    return (
      <div className="sd-loading">
      <div className="premium-spinner"></div>
      <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!hasStore) {
    return (
      <div className="sd-setup-container">
        <div className="sd-setup-card">
          <div className="sd-setup-icon">🏪</div>
          <h2>Set Up Your Store</h2>
          <p>Initial setup is required before you can manage your pets.</p>

          {storeSetupError && <div className="sd-form-error">{storeSetupError}</div>}

          <form onSubmit={handleStoreSetupSubmit} className="sd-setup-form">
            <div className="sd-form-group">
              <label>Store Name</label>
              <input 
                type="text" 
                name="name" 
                value={storeSetupData.name} 
                onChange={handleStoreSetupChange} 
                required 
                placeholder="e.g. Paw Paradise" 
              />
            </div>

            <div className="sd-form-group">
              <label>Store Address</label>
              <input 
                type="text" 
                name="address" 
                value={storeSetupData.address} 
                onChange={handleStoreSetupChange} 
                required 
                placeholder="e.g. 12 MG Road, Connaught Place" 
              />
            </div>

            <div className="sd-form-group">
              <label>City</label>
              <select 
                name="cityId" 
                value={storeSetupData.cityId} 
                onChange={handleStoreSetupChange} 
                required
              >
                <option value="">Select your city</option>
                {cities.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="sd-btn-save" disabled={storeSetupLoading} style={{width: '100%', marginTop: '1rem'}}>
              {storeSetupLoading ? 'Setting up...' : '🚀 Create My Store'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="sd-wrapper">

      {/* ── Premium Banner ── */}
      <div className="sd-banner" style={{background: 'linear-gradient(135deg, var(--bg), var(--card))', position: 'relative', overflow: 'hidden'}}>
        <div className="sd-banner-pattern" style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.12, backgroundImage: 'radial-gradient(rgba(240,244,255,0.5) 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
        <div className="sd-banner-inner" style={{position: 'relative', zIndex: 2}}>
          <div className="sd-banner-avatar" style={{boxShadow: '0 10px 30px rgba(0,0,0,0.45)', border: '2px solid var(--border)'}}>
            {store.imageUrl ? <img src={store.imageUrl} alt={store.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <span>🏪</span>}
          </div>
          <div className="sd-banner-info">
            <h1 style={{textShadow: '0 2px 10px rgba(0,0,0,0.3)'}}>{store.name}</h1>
            <div className="sd-banner-city">
              <span className="sd-city-pill" style={{background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.25)', backdropFilter: 'blur(10px)', color: 'var(--accent)'}}>Pet Store Dashboard</span>
              <span className="sd-addr" style={{opacity: 0.85, color: 'var(--muted-text)'}}>{store.address} • {store.city?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Metric Stats Bar ── */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', padding: '0 2rem', marginBottom: '2.5rem', marginTop: '-3rem', position: 'relative', zIndex: 10}}>
        <div className="stat-card-premium" style={{background: 'var(--card)', padding: '1.5rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.28)', border: '0.5px solid var(--border)', transition: 'all 0.3s ease'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{color: 'var(--muted-text)', fontSize: '0.95rem', fontWeight: 600}}>Total Pets</span>
            <span style={{fontSize: '1.5rem'}}>🐾</span>
          </div>
          <span style={{color: 'var(--text-color)', fontSize: '2.2rem', fontWeight: 900, display: 'block', marginTop: '0.5rem'}}>{pets.length}</span>
          <div style={{marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700}}>Active in Inventory</div>
        </div>
        <div className="stat-card-premium" style={{background: 'var(--card)', padding: '1.5rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.28)', border: '0.5px solid var(--border)', transition: 'all 0.3s ease'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{color: 'var(--muted-text)', fontSize: '0.95rem', fontWeight: 600}}>Open Enquiries</span>
            <span style={{fontSize: '1.5rem'}}>💬</span>
          </div>
          <span style={{color: 'var(--text-color)', fontSize: '2.2rem', fontWeight: 900, display: 'block', marginTop: '0.5rem'}}>{enquiries.length}</span>
          <div style={{marginTop: '0.5rem', fontSize: '0.8rem', color: enquiries.length > 0 ? 'var(--accent)' : 'var(--muted-text)', fontWeight: 700}}>{enquiries.length > 0 ? 'Action Needed' : 'All caught up'}</div>
        </div>
        <div className="stat-card-premium" style={{background: 'var(--card)', padding: '1.5rem', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.28)', border: '0.5px solid var(--border)', transition: 'all 0.3s ease'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{color: 'var(--muted-text)', fontSize: '0.95rem', fontWeight: 600}}>Success Rate</span>
            <span style={{fontSize: '1.5rem'}}>✨</span>
          </div>
          <span style={{color: 'var(--accent)', fontSize: '2.2rem', fontWeight: 900, display: 'block', marginTop: '0.5rem'}}>94%</span>
          <div style={{marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700}}>Monthly Growth</div>
        </div>
      </div>

      {/* ── Modern Tabs Navigation ── */}
      <div style={{display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', padding: '0 2rem', marginBottom: '2rem'}}>
        <button onClick={() => setActiveTab('inventory')} style={{padding: '1rem 0.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'inventory' ? '3px solid var(--accent)' : '3px solid transparent', color: activeTab === 'inventory' ? 'var(--accent)' : 'var(--muted-text)', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'}}>
          📦 Inventory
        </button>
        <button onClick={() => setActiveTab('enquiries')} style={{padding: '1rem 0.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'enquiries' ? '3px solid var(--accent)' : '3px solid transparent', color: activeTab === 'enquiries' ? 'var(--accent)' : 'var(--muted-text)', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'}}>
          💬 Enquiries
          {enquiries.length > 0 && <span style={{background: 'rgba(248,113,113,0.14)', border: '1px solid rgba(248,113,113,0.25)', color: 'var(--danger)', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px'}}>{enquiries.length}</span>}
        </button>
      </div>

      {/* --- Inventory Board --- */}
      {activeTab === 'inventory' && (
        <div style={{padding: '0 2rem 4rem 2rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
          <div>
            <h2 style={{fontSize: '1.8rem', color: 'var(--text-color)', margin: '0 0 0.3rem 0', fontWeight: 800}}>Adoption Inventory Board</h2>
            <p style={{margin: 0, color: 'var(--muted-text)'}}>Manage your current residents and update their adoption status instantly.</p>
          </div>
          <button className="sd-add-btn bounce-in" style={{background: 'var(--accent)', color: '#0a1a10', padding: '0.8rem 1.5rem', boxShadow: '0 10px 20px rgba(74,222,128,0.12)', borderColor: 'var(--accent)'}} onClick={openAddPetModal}>+ Add New Resident</button>
        </div>

        {/* Search and Filter */}
        <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem'}}>
          <input 
            type="text" 
            placeholder="Search by name or breed..." 
            value={inventorySearch}
            onChange={(e) => setInventorySearch(e.target.value)}
            style={{flex: 1, padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', background: 'var(--surface)', color: 'var(--text-color)'}}
          />
          <select 
            value={inventoryFilter} 
            onChange={(e) => setInventoryFilter(e.target.value)}
            style={{padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', background: 'var(--surface)', color: 'var(--text-color)'}}
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="RESERVED">Reserved</option>
            <option value="ADOPTED">Adopted</option>
          </select>
        </div>

        {pets.filter(p => {
          const matchesSearch = (p.name?.toLowerCase() || '').includes(inventorySearch.toLowerCase()) || 
                                (p.breed?.toLowerCase() || '').includes(inventorySearch.toLowerCase());
          const matchesFilter = inventoryFilter === 'ALL' || p.status === inventoryFilter;
          return matchesSearch && matchesFilter;
        }).length === 0 ? (
          <div style={{background: 'var(--card)', borderRadius: '24px', padding: '5rem 2rem', textAlign: 'center', border: '1.5px dashed var(--border)'}}>
            <span style={{fontSize: '4rem'}}>🐾</span>
            <h3 style={{fontSize: '1.5rem', color: 'var(--text-color)', marginTop: '1rem'}}>{pets.length === 0 ? 'Inventory is empty' : 'No matches found'}</h3>
            <p style={{color: 'var(--muted-text)', marginBottom: '2rem'}}>{pets.length === 0 ? 'List your first pet to start receiving adoption inquiries.' : 'Try adjusting your search or filters.'}</p>
            {pets.length === 0 && <button className="btn btn-primary" onClick={openAddPetModal}>Register First Pet</button>}
          </div>
        ) : (
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem'}}>
             {pets.filter(p => {
               const matchesSearch = (p.name?.toLowerCase() || '').includes(inventorySearch.toLowerCase()) || 
                                     (p.breed?.toLowerCase() || '').includes(inventorySearch.toLowerCase());
               const matchesFilter = inventoryFilter === 'ALL' || p.status === inventoryFilter;
               return matchesSearch && matchesFilter;
               }).map((pet, idx) => (
                <div key={pet.id} className="bounce-in" style={{background: 'var(--card)', borderRadius: '24px', overflow: 'hidden', border: '0.5px solid var(--border)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.22)', position: 'relative', display: 'flex', flexDirection: 'column', animationDelay: `${idx * 0.05}s`}}>
                   {/* Pet Image Header */}
                   <div style={{height: '220px', background: 'var(--surface)', position: 'relative'}}>
                      {pet.imageUrl ? (
                         <img src={pet.imageUrl} alt={pet.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      ) : (
                         <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', opacity: 0.2}}>🐾</div>
                      )}
                      
                      {/* Status Badge Overlaid on Image */}
                      <div style={{position: 'absolute', top: '15px', right: '15px', background: 'rgba(30,37,53,0.85)', border: '1px solid var(--border)', backdropFilter: 'blur(5px)', padding: '6px 14px', borderRadius: '20px', boxShadow: '0 4px 14px rgba(0,0,0,0.25)'}}>
                        <select 
                          value={pet.status} 
                          onChange={(e) => handleQuickStatusChange(pet.id, e.target.value)}
                          style={{border: 'none', background: 'transparent', fontWeight: 800, fontSize: '0.8rem', color: pet.status === 'AVAILABLE' ? 'var(--accent)' : 'var(--muted-text)', cursor: 'pointer', outline: 'none'}}
                        >
                           <option value="AVAILABLE" style={{color: '#0f1117'}}>✅ Available</option>
                           <option value="RESERVED" style={{color: '#0f1117'}}>🔒 Reserved</option>
                           <option value="ADOPTED" style={{color: '#0f1117'}}>🏠 Adopted</option>
                        </select>
                      </div>
                   </div>

                   {/* Card Details */}
                   <div style={{padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
                         <div>
                            <h3 style={{margin: '0 0 0.2rem 0', fontSize: '1.5rem', color: 'var(--text-color)', fontWeight: 800}}>{pet.name}</h3>
                            <span style={{fontSize: '0.85rem', color: 'var(--muted-text)', fontWeight: 600}}>{pet.breed || typeLabel(pet.type)}</span>
                         </div>
                         <div style={{fontSize: '1.2rem'}}>{pet.gender === 'MALE' ? '♂️' : '♀️'}</div>
                      </div>

                      <div style={{background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem'}}>
                         <div>
                            <span style={{display: 'block', fontSize: '0.7rem', color: 'var(--hint-text)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '0.2rem'}}>Age</span>
                            <strong style={{color: 'var(--text-color)'}}>{calculateAge(pet.dateOfBirth)}</strong>
                         </div>
                         <div>
                            <span style={{display: 'block', fontSize: '0.7rem', color: 'var(--hint-text)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '0.2rem'}}>Weight:</span>
                            <strong style={{color: 'var(--text-color)'}}>{pet.weight ? (pet.weight < 1 ? `${Math.round(pet.weight * 1000)} g` : `${Math.round(pet.weight)} kg`) : '--'}</strong>
                         </div>
                      </div>

                      <div style={{marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem'}}>
                         <button onClick={() => openEditPetModal(pet)} style={{background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.8rem', borderRadius: '12px', color: 'var(--muted-text)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', width: '100%'}}>✏️ Edit Profile</button>
                         <button onClick={() => setDeleteConfirmId(pet.id)} style={{background: 'rgba(248,113,113,0.14)', border: '1px solid rgba(248,113,113,0.25)', padding: '0.8rem', borderRadius: '12px', color: 'var(--danger)', cursor: 'pointer', transition: 'all 0.2s'}}>🗑️</button>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- Enquiries Board (Split-Pane Chat) --- */}
      {activeTab === 'enquiries' && (
        <div style={{ padding: '0 2rem 4rem 2rem', height: 'calc(100vh - 250px)' }} className="bounce-in">
          <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1rem', background: 'var(--card)', borderRadius: '24px', border: '0.5px solid var(--border)', height: '100%', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.22)' }}>
            
            {/* Sidebar: Enquiry List */}
            <div style={{ borderRight: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-color)' }}>Enquiries</h3>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {enquiries.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-text)' }}>No enquiries found</div>
                ) : (
                  enquiries.map(enq => (
                    <div 
                      key={enq.id} 
                      onClick={() => setSelectedEnquiryId(enq.id)}
                      style={{ 
                        padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                        background: selectedEnquiryId === enq.id ? 'rgba(74,222,128,0.10)' : 'transparent',
                        borderLeft: selectedEnquiryId === enq.id ? '3px solid var(--accent)' : '3px solid transparent',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <img src={enq.pet.imageUrl || 'https://via.placeholder.com/40'} alt={enq.pet.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-color)' }}>{enq.pet.name}</h4>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted-text)' }}>{enq.user.name}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Pane */}
            <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
              {selectedEnquiryId ? (
                <>
                  {/* Chat Header */}
                  <div style={{ padding: '1rem 1.5rem', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0, color: 'var(--text-color)' }}>{enquiries.find(e => e.id === selectedEnquiryId)?.pet.name}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>Discussion with {enquiries.find(e => e.id === selectedEnquiryId)?.user.name}</span>
                    </div>
                  </div>

                  {/* Message Thread */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* The original question */}
                    <div style={{ alignSelf: 'flex-start', maxWidth: '80%', background: 'var(--card)', padding: '1rem', borderRadius: '12px 12px 12px 0', border: '1px solid var(--border)', borderLeft: '2.5px solid var(--accent)', boxShadow: '0 2px 12px rgba(0,0,0,0.20)' }}>
                      <p style={{ margin: 0, fontWeight: 600, color: 'var(--muted-text)', marginBottom: '0.3rem' }}>Original Question:</p>
                      <p style={{ margin: 0, color: 'var(--muted-text)' }}>{enquiries.find(e => e.id === selectedEnquiryId)?.question}</p>
                    </div>

                    {messages.map(msg => {
                      const isMe = msg.senderRole === 'STORE_OWNER';
                      return (
                        <div key={msg.id} style={{ 
                          alignSelf: isMe ? 'flex-end' : 'flex-start', 
                          maxWidth: '80%', 
                          background: isMe ? 'var(--accent)' : 'var(--card)', 
                          color: isMe ? '#0a1a10' : 'var(--text-color)', 
                          padding: '0.8rem 1.2rem', 
                          borderRadius: isMe ? '12px 12px 0 12px' : '12px 12px 12px 0', 
                          border: isMe ? '1px solid var(--accent)' : '1px solid var(--border)', 
                          boxShadow: '0 2px 12px rgba(0,0,0,0.20)' 
                        }}>
                          <p style={{ margin: 0, fontWeight: isMe ? 600 : 400 }}>{msg.message}</p>
                          <span style={{ fontSize: '0.65rem', color: isMe ? 'rgba(10,26,16,0.6)' : 'var(--hint-text)', display: 'block', marginTop: '0.3rem', textAlign: isMe ? 'right' : 'left' }}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Chat Input */}
                  <div style={{ padding: '1.5rem', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <textarea 
                        placeholder="Type your response..."
                        value={replyText[selectedEnquiryId] || ''}
                        onChange={(e) => handleReplyChange(selectedEnquiryId, e.target.value)}
                        style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-color)', minHeight: '50px', outline: 'none', resize: 'none' }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleReplySubmit(selectedEnquiryId);
                          }
                        }}
                      />
                      <button 
                        onClick={() => handleReplySubmit(selectedEnquiryId)}
                        disabled={replyLoading || !replyText[selectedEnquiryId]?.trim()}
                        className="btn btn-primary"
                        style={{ alignSelf: 'flex-end', padding: '0.8rem 1.5rem' }}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-text)' }}>
                  <span style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</span>
                  <p>Select an enquiry to start chatting</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirmId && (
        <div className="sd-modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="sd-modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem' }}>🗑️</span>
            <h3 style={{ margin: '1rem 0 0.5rem' }}>Delete this pet?</h3>
            <p style={{ color: 'var(--muted-text)', marginBottom: '1.5rem' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="sd-btn-cancel" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button className="sd-btn-confirm-delete" onClick={() => handleDeletePet(deleteConfirmId)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Pet Modal ── */}
      {isPetModalOpen && (
        <div className="sd-modal-overlay" onClick={closePetModal}>
          <div className="sd-modal-box sd-modal-large" onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="sd-modal-head">
              <div>
                <h2>{editingPet ? '✏️ Edit Pet Details' : '🐾 Add New Pet'}</h2>
                <p>{editingPet ? `Updating info for ${editingPet.name}` : 'Fill in the details to list a new pet for adoption'}</p>
              </div>
              <button className="sd-modal-close" onClick={closePetModal}>✕</button>
            </div>

            {petFormError && (
              <div className="sd-form-error">{petFormError}</div>
            )}

            <form onSubmit={handlePetSubmit} className="sd-form">

              {/* Pet Image Preview */}
              <div className="sd-img-preview-wrap">
                <div className="sd-img-preview">
                  {selectedFile 
                    ? <img src={URL.createObjectURL(selectedFile)} alt="Preview" />
                    : petFormData.imageUrl
                    ? <img src={petFormData.imageUrl} alt="Preview" onError={e => e.target.style.display = 'none'} />
                    : <span>🐾</span>}
                </div>
                <div className="sd-form-group" style={{ flex: 1 }}>
                  <label>Pet Photo</label>
                  <input type="file" accept="image/*" onChange={handleFileChange} />
                  <span className="sd-input-hint">Upload a photo from your device</span>
                  
                  <div style={{ marginTop: '0.5rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>Or Paste URL</label>
                    <input type="url" name="imageUrl" value={petFormData.imageUrl} onChange={handlePetChange} placeholder="https://example.com/pet-photo.jpg" style={{ height: '30px', fontSize: '0.8rem' }} />
                  </div>
                </div>
              </div>

              {/* Row 1: Name + Breed */}
              <div className="sd-form-row">
                <div className="sd-form-group">
                  <label>Pet Name <span className="sd-req">*</span></label>
                  <input type="text" name="name" value={petFormData.name} onChange={handlePetChange} required placeholder="e.g. Bruno, Milo, Luna" />
                </div>
                <div className="sd-form-group">
                  <label>Breed <span className="sd-req">*</span></label>
                  <input type="text" name="breed" value={petFormData.breed} onChange={handlePetChange} required placeholder="e.g. Labrador, Persian, Budgie" />
                </div>
              </div>

              {/* Row 2: Type + Gender */}
              <div className="sd-form-row">
                <div className="sd-form-group">
                  <label>Animal Type <span className="sd-req">*</span></label>
                  <select name="type" value={petFormData.type} onChange={handlePetChange} required>
                    <option value="DOG">🐶 Dog</option>
                    <option value="CAT">🐱 Cat</option>
                    <option value="BIRD">🦜 Bird</option>
                    <option value="HAMSTER">🐹 Hamster</option>
                    <option value="RABBIT">🐰 Rabbit</option>
                    <option value="GUINEA_PIG">🐹 Guinea Pig</option>
                  </select>
                </div>
                <div className="sd-form-group">
                  <label>Gender <span className="sd-req">*</span></label>
                  <select name="gender" value={petFormData.gender} onChange={handlePetChange} required>
                    <option value="MALE">♂ Male</option>
                    <option value="FEMALE">♀ Female</option>
                  </select>
                </div>
              </div>

              {/* Row 3: DOB + Weight + Status */}
              <div className="sd-form-row">
                <div className="sd-form-group">
                  <label>Date of Birth <span className="sd-req">*</span></label>
                  <input type="date" name="dateOfBirth" value={petFormData.dateOfBirth} onChange={handlePetChange} required max={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="sd-form-group">
                  <label>Weight (kg)</label>
                  <input type="number" step="0.1" min="0" name="weight" value={petFormData.weight} onChange={handlePetChange} placeholder="e.g. 8.5" />
                </div>
                <div className="sd-form-group">
                  <label>Adoption Status <span className="sd-req">*</span></label>
                  <select name="status" value={petFormData.status} onChange={handlePetChange} required>
                    <option value="AVAILABLE">✅ Available</option>
                    <option value="RESERVED">🔒 Reserved</option>
                    <option value="ADOPTED">🏠 Adopted</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Health & Details */}
              <div className="sd-form-row">
                <div className="sd-form-group">
                  <label>Adoption Fee (₹)</label>
                  <input type="number" name="adoptionFee" value={petFormData.adoptionFee} onChange={handlePetChange} placeholder="e.g. 5000 (leave empty if free)" />
                </div>
                <div className="sd-form-group">
                  <label>Color</label>
                  <input type="text" name="color" value={petFormData.color} onChange={handlePetChange} placeholder="e.g. Golden, Black & White" />
                </div>
              </div>
              
              <div className="sd-form-row" style={{ alignItems: 'center' }}>
                <div className="sd-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" name="vaccinated" checked={petFormData.vaccinated} onChange={handlePetChange} id="vacc" style={{ width: 'auto' }} />
                  <label htmlFor="vacc" style={{ margin: 0 }}>Vaccinated</label>
                </div>
                <div className="sd-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" name="neutered" checked={petFormData.neutered} onChange={handlePetChange} id="neut" style={{ width: 'auto' }} />
                  <label htmlFor="neut" style={{ margin: 0 }}>Neutered / Spayed</label>
                </div>
              </div>

              {/* Description */}
              <div className="sd-form-group">
                <label>Description</label>
                <textarea name="description" value={petFormData.description} onChange={handlePetChange} rows="3" placeholder="Describe the pet's personality, quirks, and background..."></textarea>
              </div>

              {/* Health Notes */}
              <div className="sd-form-group">
                <label>Health Notes</label>
                <textarea name="healthNotes" value={petFormData.healthNotes} onChange={handlePetChange} rows="2" placeholder="Any medical conditions, dietary requirements, or vet visit notes..."></textarea>
              </div>

              {/* Form Actions */}
              <div className="sd-form-actions">
                <button type="button" className="sd-btn-cancel" onClick={closePetModal} disabled={petFormLoading}>Cancel</button>
                <button type="submit" className="sd-btn-save" disabled={petFormLoading}>
                  {petFormLoading ? 'Saving...' : editingPet ? '✅ Save Changes' : '🐾 Add Pet to Store'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StoreDashboard;

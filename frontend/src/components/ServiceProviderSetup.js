import React, { useState } from 'react';
import API from '../services/api';
import './ServiceProviderSetup.css';

const ServiceProviderSetup = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [specialization, setSpecialization] = useState('');
  const [formData, setFormData] = useState({
    price: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const types = [
    { id: 'BOARDING', label: 'Pet Boarding', icon: '🏠', priceLabel: 'Price per day' },
    { id: 'GROOMING', label: 'Pet Grooming', icon: '✂️', priceLabel: 'Price per session' },
    { id: 'TRAINING', label: 'Pet Training', icon: '🎓', priceLabel: 'Price per session' },
    { id: 'VET', label: 'Vet Clinic', icon: '🏥', priceLabel: 'Price per appointment' }
  ];

  const handleTypeSelect = (typeId) => {
    setSpecialization(typeId);
    setStep(2);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await API.put('/service-provider/setup', {
        specialization,
        price: parseFloat(formData.price),
        description: formData.description
      });
      onComplete();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save setup data');
    } finally {
      setLoading(false);
    }
  };

  const selectedType = types.find(t => t.id === specialization);

  return (
    <div className="setup-container">
      <h1 className="setup-title">Let's set up your business</h1>
      <p className="setup-subtitle">Complete these details to start receiving bookings.</p>

      {step === 1 && (
        <div className="setup-cards">
          {types.map((type) => (
            <div 
              key={type.id} 
              className={`setup-card ${specialization === type.id ? 'active' : ''}`}
              onClick={() => handleTypeSelect(type.id)}
            >
              <span className="setup-icon">{type.icon}</span>
              <span className="setup-card-title">{type.label}</span>
            </div>
          ))}
        </div>
      )}

      {step === 2 && (
        <form className="setup-form" onSubmit={handleSubmit}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2rem' }}>{selectedType.icon}</span>
            <div>
              <h3 style={{ margin: 0 }}>{selectedType.label}</h3>
              <button 
                type="button" 
                onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', padding: 0, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
              >
                Change Type
              </button>
            </div>
          </div>

          {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

          <div className="setup-form-group">
            <label>{selectedType.priceLabel} (₹)</label>
            <input 
              type="number" 
              name="price" 
              value={formData.price} 
              onChange={handleChange} 
              required 
              placeholder="e.g. 500" 
              className="setup-input"
            />
          </div>

          <div className="setup-form-group">
            <label>Short Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              required 
              placeholder="Describe your expertise and what you offer..." 
              className="setup-input"
              style={{ minHeight: '120px', resize: 'vertical' }}
            />
          </div>

          <button type="submit" disabled={loading} className="setup-submit-btn">
            {loading ? 'Saving...' : 'Finish Setup'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ServiceProviderSetup;

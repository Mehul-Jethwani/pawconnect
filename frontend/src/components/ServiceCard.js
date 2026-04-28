import React from 'react';
import { Link } from 'react-router-dom';
import './Card.css'; 
import { formatImageUrl } from '../utils/imageUtils';

// Displays a card with service information
const ServiceCard = ({ service }) => {
  if (!service) return null;

  return (
    <div className="card service-card">
      <div className="card-image-container">
        <img src={formatImageUrl(service.imageUrl, service.type)} alt={service.name} className="card-image"
          onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&q=80'; }}
        />
        <span className="card-badge service-badge">{service.type}</span>
      </div>
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{service.name}</h3>
          <span className="card-city">📍 {service.city?.name || service.city}</span>
        </div>
        <p className="card-subtitle">{service.type?.replace('_', ' ')}</p>
        <Link to={`/services/${service.id}`} className="btn btn-primary card-btn">View Services</Link>
      </div>
    </div>
  );
};

export default ServiceCard;

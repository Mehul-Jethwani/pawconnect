import React from 'react';
import { Link } from 'react-router-dom';
import './StoreCard.css';
import { formatStoreImageUrl } from '../utils/imageUtils';

// Displays a card with store information
const StoreCard = ({ store }) => {
  if (!store) return null;

  return (
    <div className="store-card">
      <div className="store-image-container">
        <img
          src={formatStoreImageUrl(store.imageUrl)}
          alt={store.name}
          className="store-image"
          onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80'; }}
        />
        <div className="store-badge">{store.serviceType || store.type?.replace('_', ' ')}</div>
      </div>
      <div className="store-content">
        <div className="store-header">
          <h3 className="store-title">{store.name}</h3>
          {store.rating != null && (
            <div className="store-rating">
              ⭐ {parseFloat(store.rating).toFixed(1)}
            </div>
          )}
        </div>
        <div className="store-details">
          <span className="store-city">📍 {store.city?.name || store.city}</span>
        </div>
        <Link to={`/stores/${store.id}`} className="btn btn-primary store-btn">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default StoreCard;

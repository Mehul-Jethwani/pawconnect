import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import './StoreDetails.css';

// Displays details of a specific store
const StoreDetails = () => {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await API.get(`/store/${id}`);
        setStore(res.data);
      } catch (error) {
        console.error('Error fetching store details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [id]);

  if (!store) {
    return (
      <div className="page-container store-not-found">
        <h2>Store Not Found</h2>
        <p>We couldn't locate the store you're looking for.</p>
        <Link to="/stores" className="btn btn-primary">Back to Stores</Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="store-details-header">
        <Link to="/stores" className="back-link">← Back to Stores</Link>
      </div>

      <div className="store-details-content">
        <div className="store-details-image">
          <img src={store.imageUrl} alt={store.name} />
          <div className="store-details-badge">{store.serviceType}</div>
        </div>

        <div className="store-details-info">
          <div className="store-details-title-row">
            <h1>{store.name}</h1>
            <span className="store-details-rating">⭐ {store.rating != null ? parseFloat(store.rating).toFixed(1) : 'N/A'}</span>
          </div>

          <div className="store-meta">
            <span className="store-meta-item">📍 {store.city?.name || store.city}</span>
            <span className="store-meta-item">🏥 {store.serviceType}</span>
          </div>

          <div className="store-section">
            <h2>About Us</h2>
            <p className="store-description">{store.description}</p>
          </div>

          <div className="store-section contact-info">
            <h2>Contact Information</h2>
            <p><strong>Address:</strong> {store.address}</p>
            <p><strong>Phone:</strong> {store.contactPhone}</p>
            <p><strong>Email:</strong> {store.contactEmail}</p>
          </div>

          <div className="store-actions">
            <button className="btn btn-primary">Book {store.serviceType} Service</button>
            <button className="btn btn-outline">Contact Store</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDetails;

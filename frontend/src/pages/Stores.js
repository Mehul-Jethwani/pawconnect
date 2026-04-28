import React, { useState, useEffect } from 'react';
import CitySelector from '../components/CitySelector';
import StoreCard from '../components/StoreCard';
import API from '../services/api';
import './Stores.css';

// Page to view and filter pet stores
const Stores = () => {
  const [city, setCity] = useState('Ahmedabad');
  const [filteredStores, setFilteredStores] = useState([]);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await API.get(`/store?city=${city}`);
        setFilteredStores(res.data);
      } catch (error) {
        console.error('Error fetching stores:', error);
      }
    };
    fetchStores();
  }, [city]);

  return (
    <div className="stores-page">
      <div className="stores-hero">
        <div className="page-hero-content">
          <h1>Pet Stores &amp; Facilities</h1>
          <p>Find premium grooming, clinics, and pet stays in your neighborhood.</p>
          <div className="stores-filter-panel">
            <CitySelector selectedCity={city} onCityChange={setCity} />
          </div>
        </div>
      </div>

      <div className="page-container">
        <div className="stores-grid">
          {filteredStores.map(store => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      
      {filteredStores.length === 0 && (
        <div className="no-results">
          <p>No stores found in {city} at the moment. We are expanding soon!</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default Stores;

import React, { useState, useEffect } from 'react';
import API from '../services/api';
import './CitySelector.css';

// A dropdown to select a city
const CitySelector = ({ selectedCity, onCityChange }) => {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await API.get('/cities');
        setCities(res.data);
      } catch (err) {
        console.error('Failed to fetch cities:', err);
      }
    };
    fetchCities();
  }, []);

  return (
    <div className="city-selector">
      <select 
        value={selectedCity} 
        onChange={(e) => onCityChange(e.target.value)}
        className="city-select"
      >
        <option value="">Select City</option>
        {cities.map((city) => (
          <option key={city.id || city.name} value={city.name}>{city.name}</option>
        ))}
      </select>
    </div>
  );
};

export default CitySelector;

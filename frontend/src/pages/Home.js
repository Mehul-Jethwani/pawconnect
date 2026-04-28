import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import CitySelector from '../components/CitySelector';
import PetCard from '../components/PetCard';
import ServiceCard from '../components/ServiceCard';
import StoreCard from '../components/StoreCard';
import API from '../services/api';
import './Home.css';

// Home page displaying featured pets and services
const Home = () => {
  const [city, setCity] = useState('Ahmedabad');
  const [featuredPets, setFeaturedPets] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cities, setCities] = useState([]);

  const handleSearch = (term) => {
    console.log(`Searching for ${term} in ${city}`);
  };

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await API.get('/cities');
        setCities(res.data);
      } catch (err) {
        console.error('Error fetching cities:', err);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      setError(null);
      try {
        const [petsRes, providersRes] = await Promise.allSettled([
          API.get(`/pet?city=${encodeURIComponent(city)}`),
          API.get(`/service-provider?city=${encodeURIComponent(city)}`)
        ]);

        if (petsRes.status === 'fulfilled') {
          setFeaturedPets(petsRes.value.data.slice(0, 6));
        } else {
          console.error('Error fetching pets:', petsRes.reason);
        }

        if (providersRes.status === 'fulfilled') {
          setFeaturedServices(providersRes.value.data.slice(0, 6));
        } else {
          console.error('Error fetching services:', providersRes.reason);
        }

        if (petsRes.status === 'rejected' && providersRes.status === 'rejected') {
          setError('Failed to load featured data. Please check your connection.');
        }
      } catch (err) {
        console.error('General error fetching data:', err);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, [city]);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-content">
          <h1 className="hero-title">Find Your Perfect Pet or <br/>Pet Care Service</h1>
          <p className="hero-subtitle">Discover amazing pets to adopt and connect with the best pet stores and service providers in your city.</p>
          
          <div className="hero-search-container">
            <CitySelector selectedCity={city} onCityChange={setCity} />
            <SearchBar placeholder="Search pets, breeds, or services..." onSearch={handleSearch} />
          </div>

          <div className="hero-actions">
            <Link to="/pets" className="btn btn-primary">Browse Pets</Link>
            <Link to="/services" className="btn btn-secondary">Explore Services</Link>
          </div>
        </div>
      </section>



      {/* 2. Featured Pets Section */}
      <section className="section">
        <div className="page-container" style={{paddingTop: 0, paddingBottom: 0}}>
          <div className="section-header">
            <h2 className="section-title">Featured Pets in {city}</h2>
            <p className="section-subtitle">Discover adorable pets available in your city.</p>
          </div>
          <div className="grid-container mb-4">
            {loading ? <p style={{textAlign: 'center', width: '100%', padding: '2rem'}}>Loading featured pets...</p> : 
             error ? <p style={{textAlign: 'center', color: 'var(--danger)', width: '100%'}}>{error}</p> :
             featuredPets.length > 0 ? featuredPets.map(pet => (
              <PetCard key={pet.id} pet={pet} />
            )) : <p style={{textAlign: 'center', width: '100%', padding: '2rem'}}>No featured pets found in {city}.</p>}
          </div>
          <div className="text-center">
             <Link to="/pets" className="btn btn-outline">View All Pets</Link>
          </div>
        </div>
      </section>

      {/* 3. Pet Care Services Section */}
      <section className="section" style={{backgroundColor: 'var(--surface)'}}>
        <div className="page-container" style={{paddingTop: 0, paddingBottom: 0}}>
          <div className="section-header">
            <h2 className="section-title">Pet Care Services in {city}</h2>
            <p className="section-subtitle">Top-rated veterinary clinics, groomers, and trainers near you.</p>
          </div>
          <div className="grid-container mb-4">
            {loading ? <p style={{textAlign: 'center', width: '100%', padding: '2rem'}}>Loading featured services...</p> : 
             error ? <p style={{textAlign: 'center', color: 'var(--danger)', width: '100%'}}>{error}</p> :
             featuredServices.length > 0 ? featuredServices.map(service => (
              <ServiceCard key={service.id} service={service} />
            )) : <p style={{textAlign: 'center', width: '100%', padding: '2rem'}}>No pet services found in {city}.</p>}
          </div>
          <div className="text-center">
             <Link to="/services" className="btn btn-outline">View All Services</Link>
          </div>
        </div>
      </section>

      {/* 4. Educational & NGO Section */}
      <section className="section support-section">
        <div className="page-container" style={{paddingTop: 0, paddingBottom: 0}}>
          <div className="section-header">
            <h2 className="section-title">Learn & Support</h2>
            <p className="section-subtitle">Resources for responsible pet ownership and supporting animal welfare.</p>
          </div>
          <div className="support-grid">
            <div className="support-card bounce-in">
              <span className="support-icon">📚</span>
              <h3 className="support-title">Pet Care Guides</h3>
              <p className="support-desc">Expert tips on nutrition, training, and health for your pets.</p>
              <Link to="/care-guides" className="btn btn-outline">Explore Guides</Link>
            </div>
            <div className="support-card bounce-in" style={{animationDelay: '0.1s'}}>
              <span className="support-icon">🏛️</span>
              <h3 className="support-title">NGO Information</h3>
              <p className="support-desc">Learn about local animal welfare organizations and how to help.</p>
              <Link to="/ngo-info" className="btn btn-outline">Support NGOs</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

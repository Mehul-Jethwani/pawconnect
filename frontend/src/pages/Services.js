import React, { useState, useEffect } from 'react';
import ServiceCard from '../components/ServiceCard';
import CitySelector from '../components/CitySelector';
import SearchBar from '../components/SearchBar';
import API from '../services/api';
import './BrowseTabs.css'; 

// Page for browsing and filtering pet services
const Services = () => {
  const [services, setServices] = useState([]);

  // Filters State
  const [cityFilter, setCityFilter] = useState('Ahmedabad');
  const [activeTab, setActiveTab] = useState('All Services');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = ['All Services', 'Veterinary Care', 'Pet Grooming', 'Pet Training', 'Pet Stay / Boarding'];

  const mapTabToType = (tab) => {
    switch (tab) {
      case "Pet Grooming": return "GROOMING";
      case "Pet Stay / Boarding": return "BOARDING";
      case "Veterinary Care": return "VET";
      case "Pet Training": return "TRAINING";
      default: return "";
    }
  };

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const typeParam = activeTab === 'All Services' ? '' : `&type=${mapTabToType(activeTab)}`;
        const res = await API.get(`/service-provider?city=${cityFilter}${typeParam}`);
        setServices(res.data);
      } catch (error) {
        console.error('Error fetching providers:', error);
      }
    };
    fetchProviders();
  }, [cityFilter, activeTab]);

  return (
    <div className="browse-page">
      
      {/* Hero Header Section */}
      <div className="page-hero">
        <div className="page-hero-content">
          <h1>Pet Care Services</h1>
          <p>Discover top-rated pet professionals and clinics in your city.</p>
          <div className="browse-search-bar">
            <CitySelector selectedCity={cityFilter} onCityChange={setCityFilter} />
            <SearchBar placeholder="Search by provider or service name..." onSearch={setSearchQuery} />
          </div>
        </div>
      </div>

      <div className="page-container">
        
        {/* Category Tabs */}
        <div className="tabs-container">
          {tabs.map(tab => (
            <button 
              key={tab}
              className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Results Header */}
        <div className="results-header">
          <h2>{activeTab} in {cityFilter}</h2>
          <span>{services.length} providers found</span>
        </div>

        {/* Main Grid Content */}
        {services.length > 0 ? (
          <div className="grid-container">
            {services.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <span style={{fontSize: '3rem', marginBottom: '1rem', display: 'block'}}>🏪</span>
            {services.length === 0 && activeTab === 'All Services' ? (
              <>
                <h3>No services found</h3>
                <p>We couldn't find any services located in {cityFilter}.</p>
              </>
            ) : (
              <>
                <h3>No exact matches</h3>
                <p>No services match your current category filters in {cityFilter}.</p>
              </>
            )}
            <button 
              className="btn btn-outline mt-4"
              onClick={() => { setActiveTab('All Services'); setSearchQuery(''); }}
            >
              Clear Search & Tabs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;

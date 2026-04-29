import React, { useState, useEffect } from 'react';
import PetCard from '../components/PetCard';
import { Link } from 'react-router-dom';
import CitySelector from '../components/CitySelector';
import SearchBar from '../components/SearchBar';
import API from '../services/api';
import './BrowseTabs.css';

const typeToApiParam = {
  'Dog': 'DOG',
  'Cat': 'CAT',
  'Bird': 'BIRD',
  'Hamster': 'HAMSTER',
  'Guinea Pig': 'GUINEA_PIG',
  'Rabbit': 'RABBIT'
};

const BrowsePets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cityFilter, setCityFilter] = useState('Bangalore');
  const [selectedTypes, setSelectedTypes] = useState([]); // Array of strings
  const [searchQuery, setSearchQuery] = useState('');

  const petOptions = ['Dog', 'Cat', 'Bird', 'Hamster', 'Rabbit'];

  const toggleType = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true);
      try {
        const typeParam = selectedTypes.length === 0 ? '' : `&type=${selectedTypes.map(t => typeToApiParam[t]).join(',')}`;
        const res = await API.get(`/pet?city=${encodeURIComponent(cityFilter)}${typeParam}`);
        setPets(res.data);
      } catch (error) {
        console.error('Error fetching pets:', error);
        setPets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, [cityFilter, selectedTypes]);

  // Client-side search filter on name and breed
  const displayedPets = pets.filter(pet => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return pet.name?.toLowerCase().includes(q) || pet.breed?.toLowerCase().includes(q);
  });

  return (
    <div className="browse-page">
      
      {/* Hero Header Section */}
      <div className="page-hero">
        <div className="page-hero-content">
          <h1>Find Your New Best Friend</h1>
          <p>Browse adorable pets waiting for a loving home in your city.</p>
          <div className="browse-search-bar">
            <CitySelector selectedCity={cityFilter} onCityChange={setCityFilter} />
            <SearchBar placeholder="Search by name or breed..." onSearch={setSearchQuery} />
          </div>
          {localStorage.getItem('userRole') === 'STORE_OWNER' && (
            <div style={{marginTop: '1.5rem'}}>
              <Link to="/store-dashboard" className="btn btn-primary" style={{backgroundColor: '#15803d', borderColor: '#15803d'}}>
                🏪 Add Pet to your Store
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="page-container">
        
        {/* Category Tabs */}
        <div className="tabs-container" style={{display: 'flex', flexWrap: 'wrap', gap: '0.8rem', padding: '1rem 0'}}>
          <button 
            className={`tab-button ${selectedTypes.length === 0 ? 'active' : ''}`}
            onClick={() => setSelectedTypes([])}
            style={{padding: '0.6rem 1.5rem', borderRadius: '30px'}}
          >
            All Pets
          </button>
          {petOptions.map(type => (
            <button 
              key={type}
              className={`tab-button ${selectedTypes.includes(type) ? 'active' : ''}`}
              onClick={() => toggleType(type)}
              style={{padding: '0.6rem 1.5rem', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '0.5rem'}}
            >
              <input type="checkbox" checked={selectedTypes.includes(type)} readOnly style={{accentColor: 'var(--accent)'}} />
              {type}s
            </button>
          ))}
        </div>

        {/* Results Header */}
        <div className="results-header">
          <h2>
            {selectedTypes.length === 0 ? 'All Adorable Pets' : `${selectedTypes.join(', ')}s`} in {cityFilter}
          </h2>
          <span>{loading ? '...' : `${displayedPets.length} matches found`}</span>
        </div>

        {/* Main Grid Content */}
        {loading ? (
          <div className="no-results">
            <span style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>🐾</span>
            <p>Loading pets...</p>
          </div>
        ) : displayedPets.length > 0 ? (
          <div className="grid-container">
            {displayedPets.map(pet => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <span style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>🐾</span>
            <h3>No pets found</h3>
            <p>We couldn't find any pets matching your current filters in {cityFilter}.</p>
            <button 
              className="btn btn-outline mt-4"
              onClick={() => { setSelectedTypes([]); setSearchQuery(''); }}
            >
              Clear Search & Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePets;

import React from 'react';
import './SearchBar.css';

// Input field for searching items
const SearchBar = ({ placeholder, onSearch }) => {
  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input 
          type="text" 
          className="search-input" 
          placeholder={placeholder || "Search..."}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <button className="btn btn-primary search-btn">Search</button>
    </div>
  );
};

export default SearchBar;

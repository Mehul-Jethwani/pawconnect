import React from 'react';
import { Link } from 'react-router-dom';
import './Card.css'; // Shared CSS for both PetCard and ServiceCard
import { formatImageUrl, getPlaceholderImage } from '../utils/imageUtils';

// Displays a card with pet information
const PetCard = ({ pet }) => {
  const [imageError, setImageError] = React.useState(false);
  if (!pet) return null;

  const typeEmojiMap = { DOG: '🐶', CAT: '🐱', BIRD: '🐦', RABBIT: '🐰', HAMSTER: '🐹', GUINEA_PIG: '🐹' };
  const emoji = typeEmojiMap[pet.type] || '🐾';

  return (
    <div className="card">
      <div className="card-image-container" style={{ position: 'relative', overflow: 'hidden' }}>
        {!imageError ? (
          <img
            src={formatImageUrl(pet.imageUrl, pet.type, pet.id)}
            alt={pet.name}
            className="card-image"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="image-fallback-emoji" style={{
            width: '100%', height: '200px', display: 'flex', flexDirection: 'column', 
            alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--surface), var(--card))',
            fontSize: '4rem', color: 'var(--hint-text)'
          }}>
            <span>{emoji}</span>
            <span style={{fontSize: '0.9rem', marginTop: '10px', fontWeight: 600, color: 'var(--muted-text)'}}>Photo Unavailable</span>
          </div>
        )}
        <span className="card-badge">{pet.type}</span>
        {pet.gender && (
          <span className={`gender-badge ${pet.gender.toLowerCase()}`} style={{
            position: 'absolute', bottom: '10px', right: '10px', padding: '2px 10px', 
            borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800, background: 'rgba(74,222,128,0.12)', 
            color: 'var(--accent)', border: '1px solid rgba(74,222,128,0.25)', zIndex: 5
          }}>
            {pet.gender === 'MALE' ? '♂ M' : '♀ F'}
          </span>
        )}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '5px', zIndex: 5 }}>
          {pet.vaccinated && (
            <span style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.25)', color: 'var(--accent)', fontSize: '0.65rem', fontWeight: 800, padding: '3px 8px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.25)' }}>
              🛡️ Vaccinated
            </span>
          )}
          {pet.neutered && (
            <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--muted-text)', fontSize: '0.65rem', fontWeight: 800, padding: '3px 8px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.25)' }}>
              ✂️ Neutered
            </span>
          )}
        </div>
      </div>
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{pet.name}</h3>
          <span className="card-city">📍 {pet.locationCity || pet.city?.name || pet.city}</span>
        </div>
        <p className="card-subtitle">{pet.breed}</p>
        {pet.contactPhone && (
          <p className="card-contact" style={{fontSize: '0.85rem', color: 'var(--muted-text)', marginTop: '0.5rem'}}>
            📞 {pet.contactPhone}
          </p>
        )}
        <Link to={`/pets/${pet.id}`} className="btn btn-primary card-btn">View Details</Link>
      </div>
    </div>
  );
};

export default PetCard;

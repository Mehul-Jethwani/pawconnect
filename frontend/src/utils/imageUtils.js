const BASE_URL = "http://localhost:5000";

// Pet type placeholder images - verified working URLs (Multiple options per type)
const PET_PLACEHOLDERS = {
  DOG: [
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80',
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80',
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&q=80',
    'https://images.unsplash.com/photo-1537151608804-ea6f31d04130?w=400&q=80',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80'
  ],
  CAT: [
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80',
    'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400&q=80',
    'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400&q=80',
    'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&q=80',
    'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=400&q=80'
  ],
  BIRD: [
    'https://images.pexels.com/photos/1643456/pexels-photo-1643456.jpeg?w=400',
    'https://images.pexels.com/photos/56733/pexels-photo-56733.jpeg?w=400'
  ],
  HAMSTER: [
    'https://images.pexels.com/photos/4587955/pexels-photo-4587955.jpeg?w=400',
    'https://images.pexels.com/photos/6601811/pexels-photo-6601811.jpeg?w=400'
  ],
  RABBIT: [
    'https://images.unsplash.com/photo-1585110396000-c9fa4e5e929f?w=400&q=80',
    'https://images.unsplash.com/photo-1518796745738-41048802f99a?w=400&q=80'
  ],
  GUINEA_PIG: [
    'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&q=80',
    'https://images.unsplash.com/photo-1585110396000-c9fa4e5e929f?w=400&q=80'
  ]
};

const STORE_PLACEHOLDER = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80';

export const getPlaceholderImage = (type, seed = "") => {
  const images = PET_PLACEHOLDERS[type] || PET_PLACEHOLDERS.DOG;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % images.length;
  return images[index];
};

export const formatImageUrl = (url, type, seed = "") => {
  if (!url) {
    // Return exclusively type-specific mapped placeholder
    return getPlaceholderImage(type, seed);
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Remove leading slash if present
  const cleanPath = url.startsWith('/') ? url.substring(1) : url;
  return `${BASE_URL}/${cleanPath}?v=2`;
};

export const formatStoreImageUrl = (url) => {
  if (!url) return STORE_PLACEHOLDER;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const cleanPath = url.startsWith('/') ? url.substring(1) : url;
  return `${BASE_URL}/${cleanPath}`;
};

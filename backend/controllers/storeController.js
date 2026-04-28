const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/store
const getAllStores = async (req, res) => {
  try {
    const stores = await prisma.store.findMany({
      include: { city: true }
    });
    res.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Failed to fetch stores data' });
  }
};

// GET /api/store/:id
const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await prisma.store.findUnique({
      where: { id },
      include: { city: true }
    });
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    res.json(store);
  } catch (error) {
    console.error('Error fetching store by ID:', error);
    res.status(500).json({ error: 'Failed to fetch store data' });
  }
};

// GET /api/store/my  (Store Owner only)
const getMyStore = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const store = await prisma.store.findFirst({
      where: { ownerId },
      include: { city: true }
    });
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }
    
    res.json(store);
  } catch (error) {
    console.error('Error fetching my store:', error);
    res.status(500).json({ error: 'Failed to fetch store data' });
  }
};

// POST /api/store  (kept for compatibility, but store is now created at signup)
const createStore = async (req, res) => {
  try {
    const { name, rating, imageUrl, serviceType, address, cityId } = req.body;
    const ownerId = req.user.id;

    // Check if this owner already has a store
    const existing = await prisma.store.findFirst({ where: { ownerId } });
    if (existing) {
      return res.status(400).json({ error: 'You already have a store.' });
    }

    const newStore = await prisma.store.create({
      data: { name, rating, imageUrl, serviceType, address, cityId, ownerId }
    });

    const storeWithCity = await prisma.store.findUnique({
      where: { id: newStore.id },
      include: { city: true }
    });
    res.status(201).json(storeWithCity);
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ error: 'Failed to create store' });
  }
};

module.exports = {
  getAllStores,
  getStoreById,
  getMyStore,
  createStore
};

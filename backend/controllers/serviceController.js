const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/service?providerId=...
const getServices = async (req, res) => {
  try {
    const { providerId } = req.query;
    if (!providerId) return res.status(400).json({ error: 'providerId is required' });
    const services = await prisma.service.findMany({ where: { providerId } });
    res.json(services);
  } catch (error) { console.error(error); res.status(500).json({ error: 'Server error' }); }
};

// POST /api/service
const addService = async (req, res) => {
  try {
    const { providerId, name, price, description, availableDays } = req.body;
    const service = await prisma.service.create({
      data: { providerId, name, price: parseFloat(price), description, availableDays: availableDays || [] }
    });
    res.status(201).json(service);
  } catch (error) { console.error(error); res.status(500).json({ error: 'Server error' }); }
};

// PATCH /api/service/:id
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, availableDays } = req.body;
    const data = { name, description, availableDays };
    if (price) data.price = parseFloat(price);
    
    const updated = await prisma.service.update({ where: { id }, data });
    res.json(updated);
  } catch (error) { console.error(error); res.status(500).json({ error: 'Server error' }); }
};

module.exports = { getServices, addService, updateService };

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/availability/:providerId
const getProviderAvailability = async (req, res) => {
  try {
    const { providerId } = req.params;
    const availabilities = await prisma.providerAvailability.findMany({
      where: { serviceProviderId: providerId }
    });
    res.json(availabilities);
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
};

// POST /api/availability
const setProviderAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dayOfWeek, startTime, endTime, isBlocked } = req.body;

    const provider = await prisma.serviceProvider.findFirst({
      where: { userId }
    });

    if (!provider) {
      return res.status(404).json({ error: 'Service Provider not found' });
    }

    // Upsert logic based on dayOfWeek, startTime, endTime
    // Check if exactly same slot exists
    const existing = await prisma.providerAvailability.findFirst({
      where: {
        serviceProviderId: provider.id,
        dayOfWeek: parseInt(dayOfWeek, 10),
        startTime,
        endTime
      }
    });

    if (existing) {
      const updated = await prisma.providerAvailability.update({
        where: { id: existing.id },
        data: { isBlocked: isBlocked === true || isBlocked === 'true' }
      });
      return res.json(updated);
    }

    const created = await prisma.providerAvailability.create({
      data: {
        serviceProviderId: provider.id,
        dayOfWeek: parseInt(dayOfWeek, 10),
        startTime,
        endTime,
        isBlocked: isBlocked === true || isBlocked === 'true'
      }
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Error setting availability:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
};

module.exports = {
  getProviderAvailability,
  setProviderAvailability
};

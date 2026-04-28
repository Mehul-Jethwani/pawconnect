const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/service-provider/my (Provider only)
const getMyProvider = async (req, res) => {
  try {
    const userId = req.user.id;
    const provider = await prisma.serviceProvider.findFirst({
      where: { userId },
      include: { city: true }
    });
    if (!provider) return res.status(404).json({ error: 'Provider profile not found' });
    res.json(provider);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/service-provider?city=Delhi&type=VET
const getAllProviders = async (req, res) => {
  try {
    const { city, type } = req.query;
    const where = {};
    if (city) where.city = { name: { equals: city, mode: 'insensitive' } };
    if (type) where.type = type;

    const providers = await prisma.serviceProvider.findMany({
      where,
      include: { city: true }
    });
    res.json(providers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/service-provider/:id
const getProviderById = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await prisma.serviceProvider.findUnique({
      where: { id },
      include: { city: true, services: true }
    });
    if (!provider) return res.status(404).json({ message: 'Provider not found' });
    res.json(provider);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, description, contactPhone, address } = req.body;
    let { imageUrl } = req.body;

    if (req.file) {
      imageUrl = req.file.path.replace(/\\/g, '/');
    }

    const provider = await prisma.serviceProvider.findUnique({ where: { id } });
    if (!provider || provider.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

    const updated = await prisma.serviceProvider.update({
      where: { id },
      data: { name, description, imageUrl, contactPhone, address }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const setupProvider = async (req, res) => {
  try {
    const userId = req.user.id;
    const { specialization, price, description } = req.body;

    const provider = await prisma.serviceProvider.findFirst({ where: { userId } });
    if (!provider) return res.status(404).json({ error: 'Provider not found' });

    let updateData = {
      type: specialization, // The "specialization" picked is the ProviderType
      description,
      isSetupComplete: true
    };

    if (specialization === 'BOARDING') {
      updateData.pricePerDay = price;
    } else {
      updateData.pricePerSession = price;
    }

    const updated = await prisma.serviceProvider.update({
      where: { id: provider.id },
      data: updateData
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getProviderSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch all ACCEPTED requests within 7 days
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const [appointments, trainings, boardings] = await Promise.all([
      prisma.appointment.findMany({
        where: { providerId: id, status: 'ACCEPTED', date: { gte: now, lte: nextWeek } },
        include: { user: true, userPet: true, service: true }
      }),
      prisma.trainingSession.findMany({
        where: { providerId: id, status: 'ACCEPTED', sessionDate: { gte: now, lte: nextWeek } },
        include: { user: true, userPet: true }
      }),
      prisma.boardingBooking.findMany({
        where: { providerId: id, status: 'ACCEPTED', endDate: { gte: now }, startDate: { lte: nextWeek } },
        include: { user: true, userPet: true }
      })
    ]);

    const schedule = [
      ...appointments.map(a => ({
        id: a.id,
        type: 'appointment',
        date: a.date,
        time: `${new Date(a.date).getHours()}:00`, // Approximation if time isn't separate
        petName: a.userPet?.name || 'Pet',
        ownerName: a.user.name,
        serviceName: a.service.name
      })),
      ...trainings.map(t => ({
        id: t.id,
        type: 'training',
        date: t.sessionDate,
        time: t.sessionTime || '10:00', // Default to 10 AM if not set
        petName: t.userPet?.name || 'Pet',
        ownerName: t.user.name,
        serviceName: 'Training Session'
      })),
      ...boardings.map(b => ({
        id: b.id,
        type: 'boarding',
        startDate: b.startDate,
        endDate: b.endDate,
        petName: b.userPet?.name || 'Pet',
        ownerName: b.user.name,
        serviceName: `Boarding Stay (${b.totalDays} days)`
      }))
    ];

    res.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
};

module.exports = { getMyProvider, getAllProviders, getProviderById, updateProvider, setupProvider, getProviderSchedule };

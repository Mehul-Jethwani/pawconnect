const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to parse dates robustly (handles YYYY-MM-DD and DD-MM-YYYY)
const parseDate = (dateStr) => {
  if (!dateStr) return new Date(NaN);
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;

  // Try parsing DD-MM-YYYY if normal parsing fails
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [p1, p2, p3] = parts;
    // Check if it's DD-MM-YYYY
    if (p1.length <= 2 && p3.length === 4) {
      d = new Date(`${p3}-${p2}-${p1}`);
    }
  }
  return d;
};

exports.createBoardingBooking = async (req, res) => {
  try {
    let { 
      providerId, 
      userPetId, 
      startDate, 
      endDate, 
      dayTypes,
      newPet 
    } = req.body;
    const userId = req.user.id;

    if (typeof dayTypes === 'string') dayTypes = JSON.parse(dayTypes);
    if (typeof newPet === 'string') newPet = JSON.parse(newPet);

    const provider = await prisma.serviceProvider.findUnique({ where: { id: providerId } });
    if (!provider) return res.status(404).json({ message: 'Provider not found' });

    const start = parseDate(startDate);
    const end = parseDate(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid start or end date provided.' });
    }

    let totalDays = 0;
    if (dayTypes && typeof dayTypes === 'object' && Object.keys(dayTypes).length > 0) {
      totalDays = Object.values(dayTypes).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
    } else {
      totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    if (totalDays <= 0) {
      return res.status(400).json({ message: 'Booking must be for at least one day.' });
    }

    const pricePerDay = provider.pricePerDay || 0;
    const totalPrice = totalDays * pricePerDay;
    let finalPetId = userPetId;

    if (newPet && (!finalPetId || finalPetId === '' || finalPetId === 'null')) {
      const { name, type, breed, gender, dateOfBirth } = newPet;
      let imageUrl = newPet.imageUrl;
      if (req.file) imageUrl = req.file.path.replace(/\\/g, '/');

      const dob = parseDate(dateOfBirth);
      if (isNaN(dob.getTime())) {
        return res.status(400).json({ message: 'Invalid date of birth provided for the new pet.' });
      }

      const createdPet = await prisma.userPet.create({
        data: {
          name,
          type: type.toUpperCase(),
          breed: breed || 'Unknown',
          gender: gender.toUpperCase(),
          dateOfBirth: dob,
          imageUrl: imageUrl || null,
          userId
        }
      });
      finalPetId = createdPet.id;
    }

    if (!finalPetId || finalPetId === 'null' || finalPetId === '') {
      return res.status(400).json({ message: 'Pet selection is required.' });
    }

    // Double Booking Prevention: Check if the PET already has a booking that overlaps with this range
    const petOverlap = await prisma.boardingBooking.findFirst({
      where: {
        userPetId: finalPetId,
        status: { in: ['PENDING', 'ACCEPTED'] },
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } }
        ]
      }
    });

    if (petOverlap) {
      return res.status(400).json({ message: 'This pet already has a booking during this period.' });
    }

    const booking = await prisma.boardingBooking.create({
      data: {
        providerId,
        userId,
        userPetId: finalPetId,
        startDate: start,
        endDate: end,
        totalDays,
        pricePerDay: pricePerDay,
        totalPrice
      }
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating boarding booking:', error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};

exports.getProviderBoardingBookings = async (req, res) => {
  try {
    const { id: providerId } = req.params;
    const bookings = await prisma.boardingBooking.findMany({
      where: { providerId },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        userPet: true
      },
      orderBy: { startDate: 'asc' }
    });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching provider boarding bookings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateBoardingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const booking = await prisma.boardingBooking.update({ where: { id }, data: { status } });
    res.json(booking);
  } catch (error) {
    console.error('Error updating boarding status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getUserBoardingBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await prisma.boardingBooking.findMany({
      where: { userId },
      include: { provider: true, userPet: true },
      orderBy: { startDate: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.cancelBoardingBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const booking = await prisma.boardingBooking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.userId !== userId) return res.status(403).json({ message: 'Unauthorized' });

    const startDate = new Date(booking.startDate);
    const now = new Date();
    const diffHours = (startDate - now) / (1000 * 60 * 60);

    if (diffHours < 2) {
      return res.status(400).json({ message: 'Cancellations only allowed at least 2 hours before the start date.' });
    }

    await prisma.boardingBooking.delete({ where: { id } });
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling boarding booking:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.rescheduleBoardingBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.body;
    const userId = req.user.id;
    const booking = await prisma.boardingBooking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.userId !== userId) return res.status(403).json({ message: 'Unauthorized' });

    const currentStart = new Date(booking.startDate);
    const now = new Date();
    const diffHours = (currentStart - now) / (1000 * 60 * 60);

    if (diffHours < 2) {
      return res.status(400).json({ message: 'Rescheduling only allowed at least 2 hours before the start date.' });
    }

    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid new dates' });
    }

    const updated = await prisma.boardingBooking.update({
      where: { id },
      data: { startDate: start, endDate: end, status: 'PENDING' }
    });
    res.json(updated);
  } catch (error) {
    console.error('Error rescheduling boarding booking:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

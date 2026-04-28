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

// POST /api/appointment
const createAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    let { providerId, serviceId, date, userPetId, newPet } = req.body;

    if (typeof newPet === 'string') newPet = JSON.parse(newPet);

    const appointmentDate = parseDate(date);
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ error: 'Invalid appointment date provided.' });
    }

    const now = new Date();
    const normalizedAppDate = new Date(appointmentDate);
    normalizedAppDate.setHours(0, 0, 0, 0);
    const normalizedNow = new Date();
    normalizedNow.setHours(0, 0, 0, 0);
    const maxDate = new Date(normalizedNow);
    maxDate.setDate(maxDate.getDate() + 7);
    
    if (normalizedAppDate < normalizedNow || normalizedAppDate > maxDate) {
      return res.status(400).json({ error: 'You can only book appointments for today or up to 7 days in advance.' });
    }

    const istHours = appointmentDate.getUTCHours() + 5;
    const istMinutes = appointmentDate.getUTCMinutes() + 30;
    const finalHours = istHours + Math.floor(istMinutes / 60);

    if (finalHours < 10 || finalHours >= 19) {
      return res.status(400).json({ error: 'Our working hours are 10:00 AM to 7:00 PM.' });
    }
    if (finalHours === 14) {
      return res.status(400).json({ error: 'We are closed for lunch between 2:00 PM and 3:00 PM.' });
    }

    const existing = await prisma.appointment.findFirst({
      where: { providerId, date: appointmentDate, status: { in: ['PENDING', 'ACCEPTED'] } }
    });
    if (existing) {
      return res.status(400).json({ error: 'This slot is already booked or pending approval.' });
    }

    let finalUserPetId = userPetId;
    if (newPet && (!finalUserPetId || finalUserPetId === '' || finalUserPetId === 'null')) {
      const { name, type, breed, gender, dateOfBirth } = newPet;
      let imageUrl = newPet.imageUrl;
      if (req.file) imageUrl = req.file.path.replace(/\\/g, '/');

      const dob = parseDate(dateOfBirth);
      if (isNaN(dob.getTime())) {
        return res.status(400).json({ error: 'Invalid date of birth provided for the new pet.' });
      }

      const createdPet = await prisma.userPet.create({
        data: {
          name, type, breed, gender, userId,
          dateOfBirth: dob,
          imageUrl: imageUrl || null
        }
      });
      finalUserPetId = createdPet.id;
    }

    if (!finalUserPetId || finalUserPetId === '' || finalUserPetId === 'null') {
      return res.status(400).json({ error: 'Pet selection is required. Please select an existing pet or provide new pet details.' });
    }

    const app = await prisma.appointment.create({
      data: { 
        userId, 
        providerId, 
        serviceId, 
        date: appointmentDate, 
        userPetId: finalUserPetId, 
        status: 'PENDING' 
      }
    });
    res.status(201).json(app);
  } catch (error) { 
    console.error('CRITICAL: Error creating appointment:', error); 
    res.status(500).json({ 
      error: 'Failed to confirm booking. Our systems are currently under maintenance.', 
      details: error.message,
      code: error.code || 'UNKNOWN_ERR'
    }); 
  }
};

// GET /api/appointment/provider/:providerId
const getProviderAppointments = async (req, res) => {
  try {
    const { providerId } = req.params;
    const apps = await prisma.appointment.findMany({
      where: { providerId },
      include: { 
        user: { select: { name: true, email: true, phone: true } }, 
        service: { select: { name: true } },
        userPet: true
      },
      orderBy: { date: 'asc' }
    });
    res.json(apps);
  } catch (error) { console.error(error); res.status(500).json({ error: 'Server error' }); }
};

// PATCH /api/appointment/:id
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await prisma.appointment.update({ where: { id }, data: { status } });
    res.json(updated);
  } catch (error) { console.error(error); res.status(500).json({ error: 'Server error' }); }
};

// GET /api/appointment/my
const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const apps = await prisma.appointment.findMany({
      where: { userId },
      include: { 
        service: { select: { name: true, price: true } }, 
        provider: { select: { name: true, type: true } },
        userPet: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(apps);
  } catch (error) { console.error(error); res.status(500).json({ error: 'Server error' }); }
};

// GET /api/appointment/booked-slots
const getBookedSlots = async (req, res) => {
  try {
    const { providerId, date } = req.query;
    if (!providerId || !date) return res.status(400).json({ error: 'providerId and date required' });
    
    const startOfDay = parseDate(date);
    if (isNaN(startOfDay.getTime())) return res.status(400).json({ error: 'Invalid date' });
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);
    
    const apps = await prisma.appointment.findMany({
      where: {
        providerId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { in: ['PENDING', 'ACCEPTED'] }
      },
      select: { date: true }
    });
    
    const bookedHours = apps.map(app => new Date(app.date).getHours());
    res.json(bookedHours);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching booked slots' });
  }
};

const getSlotsByDate = async (req, res) => {
  try {
    const { providerId, date } = req.params;
    const startOfDay = parseDate(date);
    if (isNaN(startOfDay.getTime())) return res.status(400).json({ error: 'Invalid date' });
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        providerId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { in: ['PENDING', 'ACCEPTED'] }
      },
      select: { date: true }
    });

    const bookedSlots = appointments.map(app => new Date(app.date).getHours());
    res.json(bookedSlots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const app = await prisma.appointment.findUnique({ where: { id } });
    if (!app) return res.status(404).json({ error: 'Appointment not found' });
    if (app.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

    const appDate = new Date(app.date);
    const now = new Date();
    const diffHours = (appDate - now) / (1000 * 60 * 60);

    if (diffHours < 2) {
      return res.status(400).json({ error: 'Cancellations only allowed at least 2 hours before the appointment.' });
    }

    await prisma.appointment.delete({ where: { id } });
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) { 
    console.error(error); 
    res.status(500).json({ error: 'Server error cancelling appointment' }); 
  }
};

const rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;
    const userId = req.user.id;
    const app = await prisma.appointment.findUnique({ where: { id } });
    if (!app) return res.status(404).json({ error: 'Appointment not found' });
    if (app.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

    const newDate = parseDate(date);
    if (isNaN(newDate.getTime())) return res.status(400).json({ error: 'Invalid new date' });

    const appDate = new Date(app.date);
    const now = new Date();
    const diffHours = (appDate - now) / (1000 * 60 * 60);

    if (diffHours < 2) {
      return res.status(400).json({ error: 'Rescheduling only allowed at least 2 hours before the appointment.' });
    }

    const updated = await prisma.appointment.update({ where: { id }, data: { date: newDate, status: 'PENDING' } });
    res.json(updated);
  } catch (error) { 
    console.error(error); 
    res.status(500).json({ error: 'Server error rescheduling appointment' }); 
  }
};

module.exports = { createAppointment, getProviderAppointments, updateAppointmentStatus, getMyAppointments, getBookedSlots, getSlotsByDate, deleteAppointment, rescheduleAppointment };

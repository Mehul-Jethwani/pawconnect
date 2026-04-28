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

exports.getProviderTrainingSessions = async (req, res) => {
  try {
    const { id: providerId } = req.params;
    const sessions = await prisma.trainingSession.findMany({
      where: { providerId },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        userPet: true
      },
      orderBy: { sessionDate: 'asc' }
    });
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching provider training sessions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const { providerId, date } = req.params;
    const searchDate = parseDate(date);
    if (isNaN(searchDate.getTime())) return res.status(400).json({ message: 'Invalid date' });
    
    searchDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(searchDate);
    nextDay.setDate(searchDate.getDate() + 1);

    const count = await prisma.trainingSession.count({
      where: {
        providerId,
        sessionDate: { gte: searchDate, lt: nextDay }
      }
    });
    res.json({ available: count < 2 });
  } catch (error) {
    console.error('Error checking training availability:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createTrainingSessions = async (req, res) => {
  try {
    let { providerId, userPetId, dates, sessionTime, newPet } = req.body;
    const userId = req.user.id;

    if (typeof dates === 'string') dates = JSON.parse(dates);
    if (typeof newPet === 'string') newPet = JSON.parse(newPet);

    const provider = await prisma.serviceProvider.findUnique({ where: { id: providerId } });
    if (!provider) return res.status(404).json({ message: 'Provider not found' });

    const sessions = await prisma.$transaction(async (tx) => {
      let finalPetId = userPetId;

      if (newPet && (!finalPetId || finalPetId === '' || finalPetId === 'null')) {
        const { name, type, breed, gender, dateOfBirth } = newPet;
        let imageUrl = newPet.imageUrl;
        if (req.file) imageUrl = req.file.path.replace(/\\/g, '/');

        const dob = parseDate(dateOfBirth);
        if (isNaN(dob.getTime())) {
          throw new Error('Invalid date of birth provided for the new pet.');
        }

        const createdPet = await tx.userPet.create({
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
        throw new Error('Pet selection is required.');
      }

      const createdSessions = [];
      for (const dateStr of dates) {
        const sessionDate = parseDate(dateStr);
        if (isNaN(sessionDate.getTime())) throw new Error(`Invalid session date: ${dateStr}`);
        
        const [h, m] = (sessionTime || '10:00').split(':');
        sessionDate.setHours(parseInt(h), parseInt(m), 0, 0);

        // Double Booking Prevention: Check if this provider already has a session at this exact time
        const existing = await tx.trainingSession.findFirst({
          where: {
            providerId,
            sessionDate: sessionDate,
            status: { in: ['PENDING', 'ACCEPTED'] }
          }
        });

        if (existing) {
          throw new Error(`The time slot ${sessionTime} on ${dateStr} is already booked.`);
        }

        const session = await tx.trainingSession.create({
          data: {
            providerId,
            userId,
            userPetId: finalPetId,
            sessionDate: sessionDate,
            sessionTime: sessionTime || '10:00',
            pricePerSession: provider.pricePerSession || 0
          }
        });
        createdSessions.push(session);
      }
      return createdSessions;
    });

    res.status(201).json(sessions);
  } catch (error) {
    console.error('Error creating training sessions:', error);
    res.status(400).json({ message: error.message, details: error.message });
  }
};

exports.updateTrainingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const session = await prisma.trainingSession.update({ where: { id }, data: { status } });
    res.json(session);
  } catch (error) {
    console.error('Error updating training status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.cancelTrainingSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const session = await prisma.trainingSession.findUnique({ where: { id } });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.userId !== userId) return res.status(403).json({ message: 'Unauthorized' });

    const sessionDate = new Date(session.sessionDate);
    const now = new Date();
    const diffHours = (sessionDate - now) / (1000 * 60 * 60);

    if (diffHours < 2) {
      return res.status(400).json({ message: 'Cancellations only allowed at least 2 hours before the session.' });
    }

    await prisma.trainingSession.delete({ where: { id } });
    res.json({ message: 'Session cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling training session:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.rescheduleTrainingSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;
    const userId = req.user.id;
    const session = await prisma.trainingSession.findUnique({ where: { id } });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.userId !== userId) return res.status(403).json({ message: 'Unauthorized' });

    const sessionDate = new Date(session.sessionDate);
    const now = new Date();
    const diffHours = (sessionDate - now) / (1000 * 60 * 60);

    if (diffHours < 2) {
      return res.status(400).json({ message: 'Rescheduling only allowed at least 2 hours before the session.' });
    }

    const newDate = parseDate(date);
    if (isNaN(newDate.getTime())) return res.status(400).json({ message: 'Invalid new date' });

    const updated = await prisma.trainingSession.update({
      where: { id },
      data: { sessionDate: newDate, sessionTime: time || session.sessionTime, status: 'PENDING' }
    });
    res.json(updated);
  } catch (error) {
    console.error('Error rescheduling training session:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getUserTrainingSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await prisma.trainingSession.findMany({
      where: { userId },
      include: { provider: true, userPet: true },
      orderBy: { sessionDate: 'desc' }
    });
    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

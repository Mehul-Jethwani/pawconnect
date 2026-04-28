const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getNotificationCounts = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let counts = { enquiries: 0, bookings: 0 };

    // Fetch user's notificationsSeenAt to determine what's "new"
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationsSeenAt: true }
    });
    const seenAt = userData?.notificationsSeenAt || new Date(0);

    if (role === 'USER') {
      // For normal users: only count PENDING bookings (newly accepted = they need to know)
      // We count bookings created AFTER they last saw notifications
      counts.bookings =
        (await prisma.appointment.count({ where: { userId, status: 'PENDING', createdAt: { gt: seenAt } } })) +
        (await prisma.boardingBooking.count({ where: { userId, status: 'PENDING', createdAt: { gt: seenAt } } })) +
        (await prisma.trainingSession.count({ where: { userId, status: 'PENDING', createdAt: { gt: seenAt } } }));
      counts.enquiries = 0; // Not used for normal users in badge
    } else if (role === 'STORE_OWNER') {
      const store = await prisma.store.findFirst({ where: { ownerId: userId } });
      if (store) {
        // Only count enquiries received AFTER the owner last visited the dashboard
        counts.enquiries = await prisma.petEnquiry.count({
          where: { pet: { storeId: store.id }, createdAt: { gt: seenAt } }
        });
      }
    } else if (role === 'SERVICE_PROVIDER') {
      const provider = await prisma.serviceProvider.findFirst({ where: { userId } });
      if (provider) {
        // Only count NEW pending bookings since last visit
        counts.bookings =
          (await prisma.appointment.count({ where: { providerId: provider.id, status: 'PENDING', createdAt: { gt: seenAt } } })) +
          (await prisma.boardingBooking.count({ where: { providerId: provider.id, status: 'PENDING', createdAt: { gt: seenAt } } })) +
          (await prisma.trainingSession.count({ where: { providerId: provider.id, status: 'PENDING', createdAt: { gt: seenAt } } }));
      }
    }

    res.json(counts);
  } catch (error) {
    console.error('Error fetching notification counts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark notifications as seen — call when user visits their notification page/dashboard
exports.markNotificationsSeen = async (req, res) => {
  try {
    const userId = req.user.id;
    await prisma.user.update({
      where: { id: userId },
      data: { notificationsSeenAt: new Date() }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications seen:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: {
        isApproved: false,
        role: { not: 'ADMIN' }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        stores: {
          select: {
            name: true,
            address: true,
            city: { select: { name: true } }
          },
          take: 1
        },
        serviceProviders: {
          select: {
            name: true,
            address: true,
            city: { select: { name: true } }
          },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Flatten store/provider info for convenience
    const formatted = pendingUsers.map(u => {
      const business = u.stores[0] || u.serviceProviders[0];
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        storeName: business?.name || null,
        storeAddress: business?.address || null,
        storeCity: business?.city?.name || null
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Fetch pending users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const approveUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isApproved: true }
    });

    res.json({ 
      message: 'User approved successfully', 
      user: { id: user.id, email: user.email, role: user.role, isApproved: user.isApproved } 
    });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getPendingUsers, approveUser };

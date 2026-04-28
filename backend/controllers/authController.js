const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const signup = async (req, res) => {
  try {
    const { name, email, password, role, storeName, storeAddress, cityId, serviceType } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['USER', 'STORE_OWNER', 'SERVICE_PROVIDER'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role selection' });
    }

    // Extra validation for Store Owners
    if (role === 'STORE_OWNER') {
      if (!storeName || !storeAddress || !cityId) {
        return res.status(400).json({ message: 'Store name, address, and city are required for Store Owners' });
      }
    }

    // Extra validation for Service Providers
    if (role === 'SERVICE_PROVIDER') {
      if (!storeName || !storeAddress || !cityId || !serviceType) {
        return res.status(400).json({ message: 'Business name, type, address, and city are required for Service Providers' });
      }
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isApproved = role === 'USER'; // Automatic true for USER, false for others

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isApproved
      }
    });

    // Auto-create the Store for Store Owners
    let store = null;
    if (role === 'STORE_OWNER') {
      store = await prisma.store.create({
        data: {
          name: storeName,
          address: storeAddress,
          cityId,
          ownerId: user.id
        }
      });
    }

    // Auto-create the Service Provider for Service Providers
    let provider = null;
    if (role === 'SERVICE_PROVIDER') {
      provider = await prisma.serviceProvider.create({
        data: {
          name: storeName, // Using storeName as business name
          type: serviceType,
          address: storeAddress,
          cityId,
          userId: user.id
        }
      });
    }

    res.status(201).json({ 
      message: 'Signup successful', 
      user: { id: user.id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved },
      store: store ? { id: store.id, name: store.name } : null,
      provider: provider ? { id: provider.id, name: provider.name } : null
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isApproved && user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Account pending admin approval' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'pawconnect_super_secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, password } = req.body;

    const data = {};
    if (name) data.name = name;
    if (phone) data.phone = phone;
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, role: true, phone: true }
    });

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
};

module.exports = { signup, login, updateProfile };

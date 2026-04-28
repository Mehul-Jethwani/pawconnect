const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/cities
router.get('/', async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

module.exports = router;

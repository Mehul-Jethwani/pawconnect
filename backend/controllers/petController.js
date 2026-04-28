const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// GET /api/pet?city=Delhi&type=DOG
const getAllPets = async (req, res) => {
  try {
    const { city, type } = req.query;

    const whereClause = {
      status: 'AVAILABLE'
    };

    // Filter by city name (case-insensitive)
    if (city && city !== 'All') {
      whereClause.city = {
        name: { equals: city, mode: 'insensitive' }
      };
    }

    // Filter by pet type(s)
    if (type && type !== 'All') {
      const typeArray = type.split(',').map(t => t.trim().toUpperCase().replace(' ', '_'));
      whereClause.type = { in: typeArray };
    }

    const pets = await prisma.pet.findMany({
      where: whereClause,
      include: {
        store: { select: { id: true, name: true, address: true } },
        city: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(pets);
  } catch (error) {
    const errorLog = `[${new Date().toISOString()}] Error fetching pets: ${error.message}\n${error.stack}\n`;
    fs.appendFileSync(path.join(__dirname, '../error.log'), errorLog);
    console.error('Error fetching pets:', error);
    res.status(500).json({ error: 'Failed to fetch pets data', message: error.message });
  }
};

const getPetById = async (req, res) => {
  try {
    const { id } = req.params;

    const pet = await prisma.pet.findUnique({
      where: { id },
      include: {
        store: true,
        city: true
      }
    });

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    res.json(pet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/pet/my-store  (Store Owner only)
const getMyStorePets = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const store = await prisma.store.findFirst({ where: { ownerId } });
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const pets = await prisma.pet.findMany({
      where: { storeId: store.id },
      include: { city: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json(pets);
  } catch (error) {
    console.error('Error fetching store pets:', error);
    res.status(500).json({ error: 'Failed to fetch store pets' });
  }
};

// POST /api/pet  (Store Owner only)
const addPet = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const store = await prisma.store.findFirst({ where: { ownerId } });
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found. Please contact support.' });
    }

    const { name, breed, dateOfBirth, type, gender, description, weight, status, vaccinated, neutered, healthNotes, adoptionFee, color } = req.body;
    let { imageUrl } = req.body;

    if (req.file) {
      imageUrl = req.file.path; // Cloudinary URL
    }

    const pet = await prisma.pet.create({
      data: {
        name,
        breed,
        dateOfBirth: new Date(dateOfBirth),
        type,
        gender,
        description,
        imageUrl,
        weight: weight ? parseFloat(weight) : null,
        status: status || 'AVAILABLE',
        vaccinated: vaccinated === 'true' || vaccinated === true,
        neutered: neutered === 'true' || neutered === true,
        healthNotes,
        adoptionFee: adoptionFee ? parseInt(adoptionFee, 10) : null,
        color,
        storeId: store.id,
        cityId: store.cityId
      }
    });

    res.status(201).json(pet);
  } catch (error) {
    console.error('Error adding pet:', error);
    res.status(500).json({ error: 'Failed to add pet' });
  }
};

// PATCH /api/pet/:id
const updatePet = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;

    const pet = await prisma.pet.findUnique({
      where: { id },
      include: { store: true }
    });

    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    if (pet.store.ownerId !== ownerId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to update this pet' });
    }

    const { name, breed, dateOfBirth, type, gender, description, weight, status, vaccinated, neutered, healthNotes, adoptionFee, color } = req.body;
    let { imageUrl } = req.body;

    if (req.file) {
      imageUrl = req.file.path; // Cloudinary URL
    }
    
    let updateData = { name, breed, type, gender, description, imageUrl, status, healthNotes, color };
    if (weight !== undefined && weight !== '') updateData.weight = weight !== null ? parseFloat(weight) : null;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth);
    if (vaccinated !== undefined) updateData.vaccinated = vaccinated === 'true' || vaccinated === true;
    if (neutered !== undefined) updateData.neutered = neutered === 'true' || neutered === true;
    if (adoptionFee !== undefined && adoptionFee !== '') updateData.adoptionFee = adoptionFee !== null ? parseInt(adoptionFee, 10) : null;
    
    if (status === 'ADOPTED') {
      updateData.adoptedAt = new Date();
    } else if (status === 'AVAILABLE' || status === 'RESERVED') {
      updateData.adoptedAt = null; 
    }
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    const updatedPet = await prisma.pet.update({ where: { id }, data: updateData });
    
    res.json(updatedPet);
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({ error: 'Failed to update pet' });
  }
};

// DELETE /api/pet/:id
const deletePet = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;
    
    const pet = await prisma.pet.findUnique({
      where: { id },
      include: { store: true }
    });

    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    if (pet.store.ownerId !== ownerId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to delete this pet' });
    }

    if (pet.imageUrl && pet.imageUrl.includes('cloudinary.com')) {
      const parts = pet.imageUrl.split('/');
      const filename = parts[parts.length - 1];
      const publicId = `pawconnect/pets/${filename.split('.')[0]}`;
      await cloudinary.uploader.destroy(publicId);
    }

    await prisma.pet.delete({ where: { id } });
    
    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).json({ error: 'Failed to delete pet' });
  }
};

module.exports = {
  getAllPets,
  getPetById,
  getMyStorePets,
  addPet,
  updatePet,
  deletePet
};

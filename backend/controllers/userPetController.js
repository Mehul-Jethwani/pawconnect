const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cloudinary = require('cloudinary').v2;

// GET /api/user-pet/my
const getMyPets = async (req, res) => {
  try {
    const userId = req.user.id;
    const pets = await prisma.userPet.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(pets);
  } catch (error) {
    console.error('Error fetching user pets:', error);
    res.status(500).json({ error: 'Failed to fetch your pets' });
  }
};

// POST /api/user-pet
const addUserPet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, type, breed, gender, dateOfBirth, vaccinated, lastVetVisit, medicalNotes, emergencyContactName, emergencyContactPhone } = req.body;
    let { imageUrl } = req.body;

    if (req.file) {
      imageUrl = req.file.path; // Cloudinary URL
    }

    const pet = await prisma.userPet.create({
      data: {
        name,
        type: type.toUpperCase(),
        breed,
        gender: gender.toUpperCase(),
        dateOfBirth: new Date(dateOfBirth),
        imageUrl,
        vaccinated: vaccinated === 'true' || vaccinated === true,
        lastVetVisit: lastVetVisit ? new Date(lastVetVisit) : null,
        medicalNotes,
        emergencyContactName,
        emergencyContactPhone,
        userId
      }
    });

    res.status(201).json(pet);
  } catch (error) {
    console.error('Error adding user pet:', error);
    res.status(500).json({ error: 'Failed to add pet' });
  }
};

// PATCH /api/user-pet/:id
const updateUserPet = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, type, breed, gender, dateOfBirth, vaccinated, lastVetVisit, medicalNotes, emergencyContactName, emergencyContactPhone } = req.body;
    let { imageUrl } = req.body;

    // Check ownership
    const existing = await prisma.userPet.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update this pet' });
    }

    const data = {};
    if (name) data.name = name;
    if (type) data.type = type.toUpperCase();
    if (breed) data.breed = breed;
    if (gender) data.gender = gender.toUpperCase();
    if (dateOfBirth) data.dateOfBirth = new Date(dateOfBirth);
    if (vaccinated !== undefined) data.vaccinated = vaccinated === 'true' || vaccinated === true;
    if (lastVetVisit !== undefined) data.lastVetVisit = lastVetVisit ? new Date(lastVetVisit) : null;
    if (medicalNotes !== undefined) data.medicalNotes = medicalNotes;
    if (emergencyContactName !== undefined) data.emergencyContactName = emergencyContactName;
    if (emergencyContactPhone !== undefined) data.emergencyContactPhone = emergencyContactPhone;
    
    if (req.file) {
      data.imageUrl = req.file.path; // Cloudinary URL
    } else if (imageUrl !== undefined) {
      data.imageUrl = imageUrl;
    }

    const updated = await prisma.userPet.update({
      where: { id },
      data
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating user pet:', error);
    res.status(500).json({ error: 'Failed to update pet' });
  }
};

// DELETE /api/user-pet/:id
const deleteUserPet = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check ownership
    const existing = await prisma.userPet.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this pet' });
    }

    if (existing.imageUrl && existing.imageUrl.includes('cloudinary.com')) {
      const parts = existing.imageUrl.split('/');
      const filename = parts[parts.length - 1];
      const publicId = `pawconnect/userpets/${filename.split('.')[0]}`;
      await cloudinary.uploader.destroy(publicId);
    }

    await prisma.userPet.delete({ where: { id } });
    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Error deleting user pet:', error);
    res.status(500).json({ error: 'Failed to delete pet' });
  }
};

module.exports = { getMyPets, addUserPet, updateUserPet, deleteUserPet };

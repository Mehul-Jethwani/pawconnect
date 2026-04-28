const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createEnquiry = async (req, res) => {
  try {
    const { id: petId } = req.params;
    const { question } = req.body;
    const userId = req.user.id;

    const enquiry = await prisma.petEnquiry.create({
      data: {
        petId,
        userId,
        question
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    res.status(201).json(enquiry);
  } catch (error) {
    console.error('Error creating enquiry:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getPetEnquiries = async (req, res) => {
  try {
    const { id: petId } = req.params;

    const enquiries = await prisma.petEnquiry.findMany({
      where: { petId },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(enquiries);
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.answerEnquiry = async (req, res) => {
  try {
    const { id: enquiryId } = req.params;
    const { answer } = req.body;
    const ownerId = req.user.id;

    // Verify ownership: Find enquiry, check if pet -> store -> ownerId matches
    const existingEnquiry = await prisma.petEnquiry.findUnique({
      where: { id: enquiryId },
      include: {
        pet: {
          include: {
            store: true
          }
        }
      }
    });

    if (!existingEnquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    if (existingEnquiry.pet.store.ownerId !== ownerId) {
      return res.status(403).json({ message: 'Unauthorized: You can only answer enquiries for your own store pets' });
    }

    const enquiry = await prisma.petEnquiry.update({
      where: { id: enquiryId },
      data: {
        answer,
        answeredAt: new Date()
      }
    });

    res.json(enquiry);
  } catch (error) {
    console.error('Error answering enquiry:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getStoreEnquiries = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const enquiries = await prisma.petEnquiry.findMany({
      where: {
        pet: {
          store: {
            ownerId: ownerId
          }
        }
        // Removed 'answer: null' filter so stores can see full conversation history
      },
      include: {
        pet: {
          select: {
            name: true,
            imageUrl: true
          }
        },
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(enquiries);
  } catch (error) {
    console.error('Error fetching store enquiries:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getEnquiryMessages = async (req, res) => {
  try {
    const { id: enquiryId } = req.params;
    const enquiry = await prisma.petEnquiry.findUnique({
      where: { id: enquiryId },
      include: { pet: { include: { store: true } } }
    });

    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });

    // Security: Only user who created it or store owner who owns the pet
    const isOwner = req.user.role === 'STORE_OWNER' && enquiry.pet.store.ownerId === req.user.id;
    const isCreator = req.user.id === enquiry.userId;

    if (!isOwner && !isCreator && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const messages = await prisma.enquiryMessage.findMany({
      where: { enquiryId },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching enquiry messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.addEnquiryMessage = async (req, res) => {
  try {
    const { id: enquiryId } = req.params;
    const { text } = req.body;

    const enquiry = await prisma.petEnquiry.findUnique({
      where: { id: enquiryId },
      include: { pet: { include: { store: true } } }
    });

    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });

    // Security: Only user who created it or store owner who owns the pet
    const isOwner = req.user.role === 'STORE_OWNER' && enquiry.pet.store.ownerId === req.user.id;
    const isCreator = req.user.id === enquiry.userId;

    if (!isOwner && !isCreator && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const message = await prisma.enquiryMessage.create({
      data: {
        enquiryId,
        senderRole: req.user.role,
        message: text
      }
    });

    // Also update the main enquiry's answered status if it's the store owner
    if (req.user.role === 'STORE_OWNER') {
      await prisma.petEnquiry.update({
        where: { id: enquiryId },
        data: {
          answer: text, // Keep legacy field updated for compatibility
          answeredAt: new Date()
        }
      });
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Error adding enquiry message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

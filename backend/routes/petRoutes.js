const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const petEnquiryController = require('../controllers/petEnquiryController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Define pet routes
router.get('/my-store', requireAuth, requireRole('STORE_OWNER'), petController.getMyStorePets);
router.post('/', requireAuth, requireRole('STORE_OWNER'), upload.single('image'), petController.addPet);
router.get('/', petController.getAllPets);
router.get('/:id', petController.getPetById);
router.patch('/:id', requireAuth, requireRole(['STORE_OWNER', 'ADMIN']), upload.single('image'), petController.updatePet);
router.delete('/:id', requireAuth, requireRole(['STORE_OWNER', 'ADMIN']), petController.deletePet);

// Enquiry routes
router.post('/:id/enquiry', requireAuth, requireRole('USER'), petEnquiryController.createEnquiry);
router.get('/:id/enquiries', petEnquiryController.getPetEnquiries);

module.exports = router;

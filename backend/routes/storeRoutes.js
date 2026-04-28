const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const petEnquiryController = require('../controllers/petEnquiryController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Define store routes
router.post('/', requireAuth, requireRole('STORE_OWNER'), storeController.createStore);
router.get('/my', requireAuth, requireRole('STORE_OWNER'), storeController.getMyStore);
router.get('/', storeController.getAllStores);
router.get('/enquiries', requireAuth, requireRole('STORE_OWNER'), petEnquiryController.getStoreEnquiries);
router.get('/:id', storeController.getStoreById);

module.exports = router;

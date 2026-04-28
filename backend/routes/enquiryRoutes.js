const express = require('express');
const router = express.Router();
const petEnquiryController = require('../controllers/petEnquiryController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/store', requireAuth, requireRole('STORE_OWNER'), petEnquiryController.getStoreEnquiries);
router.patch('/:id/answer', requireAuth, requireRole('STORE_OWNER'), petEnquiryController.answerEnquiry);
router.get('/:id/messages', requireAuth, petEnquiryController.getEnquiryMessages);
router.post('/:id/messages', requireAuth, petEnquiryController.addEnquiryMessage);

module.exports = router;

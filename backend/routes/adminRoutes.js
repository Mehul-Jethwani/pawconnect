const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/pending-users', requireAuth, requireRole('ADMIN'), adminController.getPendingUsers);
router.patch('/approve-user/:id', requireAuth, requireRole('ADMIN'), adminController.approveUser);

module.exports = router;

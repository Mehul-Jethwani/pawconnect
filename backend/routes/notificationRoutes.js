const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/counts', requireAuth, notificationController.getNotificationCounts);
router.post('/seen', requireAuth, notificationController.markNotificationsSeen);

module.exports = router;

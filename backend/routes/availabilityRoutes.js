const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/:providerId', availabilityController.getProviderAvailability);
router.post('/', requireAuth, requireRole(['SERVICE_PROVIDER', 'ADMIN']), availabilityController.setProviderAvailability);

module.exports = router;

const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

router.get('/', serviceController.getServices);
router.post('/', requireAuth, requireRole('SERVICE_PROVIDER'), serviceController.addService);
router.patch('/:id', requireAuth, requireRole('SERVICE_PROVIDER'), serviceController.updateService);

module.exports = router;

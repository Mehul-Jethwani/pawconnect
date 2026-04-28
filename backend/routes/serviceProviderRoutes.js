const express = require('express');
const router = express.Router();
const providerController = require('../controllers/serviceProviderController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/my', requireAuth, requireRole('SERVICE_PROVIDER'), providerController.getMyProvider);
router.get('/:id/schedule', requireAuth, providerController.getProviderSchedule);
router.get('/', providerController.getAllProviders);
router.get('/:id', providerController.getProviderById);
router.patch('/:id', requireAuth, upload.single('image'), providerController.updateProvider);
router.put('/setup', requireAuth, requireRole('SERVICE_PROVIDER'), providerController.setupProvider);

module.exports = router;

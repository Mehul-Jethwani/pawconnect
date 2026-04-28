const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/provider/:id', requireAuth, requireRole(['SERVICE_PROVIDER', 'ADMIN']), trainingController.getProviderTrainingSessions);
router.get('/availability/:providerId/:date', trainingController.checkAvailability);
router.post('/', requireAuth, requireRole('USER'), upload.single('petImage'), trainingController.createTrainingSessions);
router.get('/my', requireAuth, requireRole('USER'), trainingController.getUserTrainingSessions);
router.patch('/:id/status', requireAuth, requireRole(['SERVICE_PROVIDER', 'ADMIN']), trainingController.updateTrainingStatus);
router.delete('/:id', requireAuth, trainingController.cancelTrainingSession);
router.patch('/:id/reschedule', requireAuth, trainingController.rescheduleTrainingSession);

module.exports = router;

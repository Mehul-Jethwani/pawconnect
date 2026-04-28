const express = require('express');
const router = express.Router();
const boardingController = require('../controllers/boardingController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', requireAuth, requireRole('USER'), upload.single('petImage'), boardingController.createBoardingBooking);
router.get('/provider/:id', requireAuth, requireRole(['SERVICE_PROVIDER', 'ADMIN']), boardingController.getProviderBoardingBookings);
router.get('/my', requireAuth, requireRole('USER'), boardingController.getUserBoardingBookings);
router.patch('/:id/status', requireAuth, requireRole(['SERVICE_PROVIDER', 'ADMIN']), boardingController.updateBoardingStatus);
router.delete('/:id', requireAuth, boardingController.cancelBoardingBooking);
router.patch('/:id/reschedule', requireAuth, boardingController.rescheduleBoardingBooking);

module.exports = router;

const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', requireAuth, upload.single('petImage'), appointmentController.createAppointment);
router.get('/my', requireAuth, appointmentController.getMyAppointments);
router.get('/booked-slots', appointmentController.getBookedSlots);
router.get('/slots/:providerId/:date', appointmentController.getSlotsByDate);
router.get('/provider/:providerId', requireAuth, appointmentController.getProviderAppointments);
router.patch('/:id', requireAuth, appointmentController.updateAppointmentStatus);
router.delete('/:id', requireAuth, appointmentController.deleteAppointment);
router.patch('/:id/reschedule', requireAuth, appointmentController.rescheduleAppointment);

module.exports = router;

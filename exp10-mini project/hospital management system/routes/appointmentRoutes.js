const express = require('express');
const router = express.Router();
const { bookAppointment, getAppointments, updateAppointmentStatus } = require('../controllers/appointmentController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, getAppointments)
    .post(protect, bookAppointment);

router.route('/:id/status')
    .put(protect, updateAppointmentStatus);

module.exports = router;

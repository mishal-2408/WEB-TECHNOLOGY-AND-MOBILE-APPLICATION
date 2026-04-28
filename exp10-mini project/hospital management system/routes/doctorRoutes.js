const express = require('express');
const router = express.Router();
const { getDoctors, addDoctor, deleteDoctor, updateDoctorStatus } = require('../controllers/doctorController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, getDoctors)
    .post(protect, addDoctor);

router.route('/:id')
    .delete(protect, deleteDoctor);

router.route('/:id/status')
    .put(protect, updateDoctorStatus);

module.exports = router;

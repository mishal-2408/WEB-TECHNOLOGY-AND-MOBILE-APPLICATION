const express = require('express');
const router = express.Router();
const { getPatients, getPatientById, addPatient, updatePatient, deletePatient, registerPatient, loginPatient } = require('../controllers/patientController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.post('/register', registerPatient);
router.post('/login', loginPatient);

router.route('/')
    .get(protect, adminOnly, getPatients)
    .post(protect, adminOnly, addPatient);

router.route('/:id')
    .get(protect, getPatientById)
    .put(protect, adminOnly, updatePatient)
    .delete(protect, adminOnly, deletePatient);

module.exports = router;

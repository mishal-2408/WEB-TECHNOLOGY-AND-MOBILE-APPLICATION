const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { uploadRecord, getRecordsByPatient } = require('../controllers/recordController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.route('/')
    .post(protect, adminOnly, upload.single('file'), uploadRecord);

router.route('/:patientId')
    .get(protect, getRecordsByPatient);

module.exports = router;

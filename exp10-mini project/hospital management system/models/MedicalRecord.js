const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    filePath: { type: String, required: true },
    description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);

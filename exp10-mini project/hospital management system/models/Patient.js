const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    disease: { type: String, required: true },
    contact: { type: String, required: true },
    username: { type: String, unique: true, sparse: true },
    password: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);

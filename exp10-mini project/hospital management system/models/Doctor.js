const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    availability: [{ type: String }], // e.g., ["09:00 AM", "10:00 AM"]
    status: { type: String, enum: ['Not Arrived', 'Arrived', 'Late', 'Leave'], default: 'Not Arrived' }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);

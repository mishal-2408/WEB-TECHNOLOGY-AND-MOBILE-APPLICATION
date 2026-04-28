const Doctor = require('../models/Doctor');

const getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({});
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addDoctor = async (req, res) => {
    const { name, specialization, availability } = req.body;

    try {
        const doctor = new Doctor({
            name, specialization, availability
        });

        const createdDoctor = await doctor.save();
        res.status(201).json(createdDoctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        
        await doctor.deleteOne();
        res.json({ message: 'Doctor removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateDoctorStatus = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        
        doctor.status = req.body.status;
        await doctor.save();
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDoctors, addDoctor, deleteDoctor, updateDoctorStatus };

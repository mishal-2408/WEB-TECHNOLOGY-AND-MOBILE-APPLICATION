const Appointment = require('../models/Appointment');

const bookAppointment = async (req, res) => {
    const { patient, doctor, date, timeSlot } = req.body;

    try {

        const existingAppointment = await Appointment.findOne({ doctor, date, timeSlot });
        if (existingAppointment) {
            return res.status(400).json({ message: 'Doctor is already booked for this time slot on this date' });
        }

        const appointment = new Appointment({
            patient, doctor, date, timeSlot
        });

        const createdAppointment = await appointment.save();
        res.status(201).json(createdAppointment);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Doctor is already booked for this time slot on this date' });
        }
        res.status(500).json({ message: error.message });
    }
};

const getAppointments = async (req, res) => {
    try {
        let query = {};
        if (req.user && req.user.role === 'patient') {
            query.patient = req.user.id;
        }
        
        const appointments = await Appointment.find(query)
            .populate('patient', 'name contact')
            .populate('doctor', 'name specialization status');
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateAppointmentStatus = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        
        appointment.status = req.body.status;
        await appointment.save();
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { bookAppointment, getAppointments, updateAppointmentStatus };

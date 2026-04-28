const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

const getDashboardStats = async (req, res) => {
    try {
        const totalPatients = await Patient.countDocuments();
        const totalDoctors = await Doctor.countDocuments();
        const totalAppointments = await Appointment.countDocuments();


        const diseasesAggregation = await Patient.aggregate([
            { $group: { _id: "$disease", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const recentAppointments = await Appointment.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('patient', 'name')
            .populate('doctor', 'name');

        res.json({
            stats: {
                totalPatients,
                totalDoctors,
                totalAppointments
            },
            commonDiseases: diseasesAggregation,
            recentAppointments
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats };

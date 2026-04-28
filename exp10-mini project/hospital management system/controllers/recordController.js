const MedicalRecord = require('../models/MedicalRecord');

const uploadRecord = async (req, res) => {
    const { patient, description } = req.body;

    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file' });
    }

    try {
        const record = new MedicalRecord({
            patient,
            description,
            filePath: req.file.path.replace(/\\/g, '/')
        });

        const createdRecord = await record.save();
        res.status(201).json(createdRecord);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRecordsByPatient = async (req, res) => {
    try {
        const records = await MedicalRecord.find({ patient: req.params.patientId });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { uploadRecord, getRecordsByPatient };

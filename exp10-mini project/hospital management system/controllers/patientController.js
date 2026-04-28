const Patient = require('../models/Patient');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id, role: 'patient' }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const getPatients = async (req, res) => {
    try {
        const patients = await Patient.find({});
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (patient) {
            res.json(patient);
        } else {
            res.status(404).json({ message: 'Patient not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addPatient = async (req, res) => {
    const { name, age, gender, disease, contact } = req.body;

    try {
        const patient = new Patient({
            name, age, gender, disease, contact
        });
        const createdPatient = await patient.save();
        res.status(201).json(createdPatient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updatePatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (patient) {
            patient.name = req.body.name || patient.name;
            patient.age = req.body.age || patient.age;
            patient.gender = req.body.gender || patient.gender;
            patient.disease = req.body.disease || patient.disease;
            patient.contact = req.body.contact || patient.contact;

            const updatedPatient = await patient.save();
            res.json(updatedPatient);
        } else {
            res.status(404).json({ message: 'Patient not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (patient) {
            await patient.deleteOne();
            res.json({ message: 'Patient removed' });
        } else {
            res.status(404).json({ message: 'Patient not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const registerPatient = async (req, res) => {
    const { name, age, gender, disease, contact, username, password } = req.body;

    try {
        const patientExists = await Patient.findOne({ username });
        if (patientExists) {
            return res.status(400).json({ message: 'Patient username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const patient = new Patient({
            name, age, gender, disease, contact, username, password: hashedPassword
        });

        const createdPatient = await patient.save();

        if (createdPatient) {
            res.status(201).json({
                _id: createdPatient._id,
                name: createdPatient.name,
                username: createdPatient.username,
                token: generateToken(createdPatient._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid patient data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginPatient = async (req, res) => {
    const { username, password } = req.body;

    try {
        const patient = await Patient.findOne({ username });
        if (patient && patient.password && (await bcrypt.compare(password, patient.password))) {
            res.json({
                _id: patient._id,
                name: patient.name,
                username: patient.username,
                token: generateToken(patient._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getPatients, getPatientById, addPatient, updatePatient, deletePatient, registerPatient, loginPatient };

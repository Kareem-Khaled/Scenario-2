const Patient = require('../models/patient');
const Doctor = require('../models/doctor');
const Appointment = require('../models/appointment');
const Slot = require('../models/slot');
const { removeExpiredAppointments } = require('./methods');

module.exports.render_index = async (req, res) => {
    res.render('patient/index', { page_name: 'index' });
};

module.exports.render_history = async (req, res) => {
    const patient = await Patient.findOne({ info: req.user._id }).populate({
        path: 'appointments',
        populate: {
            path: 'doctor',
            populate: {
                path: 'info',
            },
        },
    })
    
    let appointments = await removeExpiredAppointments(patient);
    res.render('patient/history', { page_name: 'history', appointments: patient.appointments });
};

module.exports.render_online_booking = async (req, res) => {
    const doctors = await Doctor.find({}).populate({
        path: 'info',
    });
    res.render('patient/online-booking', { page_name: 'online-booking', doctors });
};

module.exports.book_slot = async (req, res) => {
    const {day, date, startTime, endTime, doctorId} = req.body;
    let doctor = await Doctor.findById(doctorId);
    let patient = await Patient.findOne({ info: req.user._id });
    const slot = new Slot({
        day,
        date,
        startTime,
        endTime,
    })
    const appointment = new Appointment({
        doctor: doctorId,
        patient: patient._id,
        status: 'Upcoming',
        slot,
        cost: doctor.appointmentCost,
    });
    await appointment.save();
    doctor.appointments.push(appointment);
    patient.appointments.push(appointment);
    await doctor.save();
    await patient.save();
    req.flash('success', 'Appointment booked successfully!');
    res.redirect('/patient');
};
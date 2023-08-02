const e = require('express');
const Patient = require('../models/patient');
const Doctor = require('../models/doctor');

module.exports.render_index = async (req, res) => {
    res.render('patient/index', { page_name: 'index' });
};

module.exports.render_history = async (req, res) => {
    res.render('patient/history', { page_name: 'history' });
};

module.exports.render_online_booking = async (req, res) => {
    const doctors = await Doctor.find({}).populate({
        path: 'info',
    });
    res.render('patient/online-booking', { page_name: 'online-booking', doctors });
};
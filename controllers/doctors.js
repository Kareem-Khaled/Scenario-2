const e = require('express');
const Doctor = require('../models/doctor');
const Slot = require('../models/slot');

module.exports.render_index = async (req, res) => {
    res.render('doctor/index', { page_name: 'index' });
};

module.exports.render_history = async (req, res) => {
    res.render('doctor/history', { page_name: 'history' });
};

module.exports.render_online_booking = async (req, res) => {
    res.render('doctor/online-booking', { page_name: 'online-booking' });
};

module.exports.save_slot = async (req, res) => {
    const doctor = req.doctorId;
    if (!doctor) {
        return res.status(404).redirect('/404');
    }
    let {day, startTime, endTime, duration, isHoliday} = req.body;
    if(isHoliday){
        startTime = endTime = duration = NaN;
        isHoliday = true;
    }
    else{
        isHoliday = false;
    }
    console.log(day, startTime, endTime, duration, isHoliday);
    res.redirect('/doctor/online-booking');
};
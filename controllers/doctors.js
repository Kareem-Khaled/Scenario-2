const e = require('express');
const Doctor = require('../models/doctor');
const User = require('../models/user');
const Slot = require('../models/slot');
const {calculateTimeSlots, removeExpiredAppointments} = require('./methods.js');

module.exports.render_index = async (req, res) => {
    let doctor = await Doctor.findOne({ info: req.user._id }).populate({
        path: 'appointments',
        populate: {
            path: 'patient',
            populate: {
                path: 'info',
            },
        },
    })
    await removeExpiredAppointments(doctor);
    res.render('doctor/index', { page_name: 'index' });
};

module.exports.render_profile = async (req, res) => {
    const doctor = await Doctor.findOne({ info: req.user._id }).populate({
        path: 'info',
    })
    res.render('doctor/profile', { page_name: 'profile', doctor });
}

module.exports.save_profile = async (req, res) => {
    const {specialty, appointmentCost, phone, location} = req.body;
    const doctor = await Doctor.findOne({ info: req.user._id }).populate({
        path: 'info',
    })
    doctor.specialty = specialty;
    doctor.appointmentCost = appointmentCost;
    const user = await User.findById(req.user._id );
    user.phone = phone;
    user.location = location;
    await doctor.save();
    await user.save();
    req.flash('success', 'Your profile has been updated');
    res.redirect('/doctor');
}

module.exports.render_history = async (req, res) => {
    let doctor = await Doctor.findOne({ info: req.user._id }).populate({
        path: 'appointments',
        populate: {
            path: 'patient',
            populate: {
                path: 'info',
            },
        },
    })
    let appointments = await removeExpiredAppointments(doctor);
    res.render('doctor/history', { page_name: 'history', appointments });
};

module.exports.render_online_booking = async (req, res) => {
    const doctor = await Doctor.findOne({ info: req.user._id }).populate({
        path: 'slots',
    })
    res.render('doctor/online-booking', { page_name: 'online-booking', slots: doctor.slots });
};

module.exports.get_slots = async (req, res) => {
    const doctor = await Doctor.findOne({ info: req.params.doctorId }).populate({
        path: 'slots',
    })
    res.status(200).send({
        slots: doctor.slots 
    });
};

module.exports.veiw_slots = async (req, res) => {
    const doctor = await Doctor.findById(req.params.doctorId)
    .populate({
        path: 'slots',
    }).populate({
        path: 'appointments',
    });
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    let coming = [];
    for (let slot of doctor.slots) {
        if(!slot.isHoliday){
            let temp = calculateTimeSlots(slot.startTime, slot.endTime, slot.duration, slot.day);
            coming.push(...temp);
        }
    }
    doctor.appointments.forEach((doctorAppointment) => {
        let matchingAppointment = coming.find((comingAppointment) =>
            doctorAppointment.slot.day === comingAppointment.day &&
            doctorAppointment.slot.startTime === comingAppointment.startTime &&
            doctorAppointment.slot.endTime === comingAppointment.endTime
        );
        if (matchingAppointment) {
            matchingAppointment.isBooked = true;
        }
    });
    coming.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
    });
    res.render('patient/book-slot', { page_name: '', slots: coming, doctorId: req.params.doctorId });
};

module.exports.save_slot = async (req, res) => {
    const doctor = await Doctor.findOne({ info: req.user._id }).populate({
        path: 'slots',
    });

    if (!doctor) {
        return res.status(404).redirect('/404');
    }
    let {day, startTime, endTime, duration, isHoliday} = req.body;
    if(isHoliday){
        startTime = endTime = duration = -1;
        isHoliday = true;
    }
    else{
        isHoliday = false;
    }
    const existingSlot = doctor.slots.find(slot => slot.day === day);
    if (existingSlot) {
        // Day already exists, update the existing slot
        existingSlot.startTime = startTime;
        existingSlot.endTime = endTime;
        existingSlot.duration = duration;
        existingSlot.isHoliday = isHoliday;
        await existingSlot.save();
    } else {
        // Day does not exist, create a new slot and add it to the array
        const newSlot = new Slot({ day, startTime, endTime, duration, isHoliday });
        await newSlot.save();
        doctor.slots.push(newSlot);
    }
  
    // Save the doctor with the updated/inserted slot
    await doctor.save();

    req.flash('success', 'Slot updated successfully');
    res.redirect('/doctor/online-booking');
};

module.exports.get_doctor_dashboard = async (req, res) => {
    const doctor = await Doctor.findOne({ info: req.params.doctorId })
    .populate({
        path: 'appointments',
        populate: {
            path: 'patient',
            populate: {
                path: 'info',
            },
        },
    })

    let allAppointments = doctor.appointments.length;
    const finishedAppointments = doctor.appointments.filter(appointment => appointment.status === 'Finished');
    let pendingAppointments = allAppointments - finishedAppointments.length;
    let appointmentsPercentage = (finishedAppointments.length  * 100 / allAppointments) || 0;

    let male = 0, female = 0, totalEarnings = 0, monthEarnings = 0, ages = new Array(5).fill(0);
    const currentDate = new Date();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const currentYear = currentDate.getFullYear();

    finishedAppointments.forEach(appointment => {
        if (appointment.patient.info.gender === 'male') {
            male++;
        } else {
            female++;
        }
        if(appointment.patient.info.age < 20){
            ages[0]++;
        }
        else if(appointment.patient.info.age <= 30){
            ages[1]++;
        }
        else if(appointment.patient.info.age <= 40){
            ages[2]++;
        }
        else if(appointment.patient.info.age <= 50){
            ages[3]++;
        }
        else{
            ages[4]++;
        }
        const [month, day, year] = appointment.slot.date.split(' / ');
        if(month == currentMonth && year == currentYear){
            monthEarnings += appointment.cost;
        }
        totalEarnings += appointment.cost;
    });

    res.status(200).send({
        ages,
        totalEarnings, 
        monthEarnings,
        pendingAppointments,
        gender:[male, female],
        appointmentsPercentage
    });
}
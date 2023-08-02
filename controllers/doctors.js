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
    const doctor = await Doctor.findById(req.params.doctorId).populate({
        path: 'slots',
    });
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    let coming = [], past = [];
    for (let slot of doctor.slots) {
        if(!slot.isHoliday){
            let temp = calculateTimeSlots(slot.startTime, slot.endTime, slot.duration, slot.day);
            if(isDayBefore(today, slot.day)){
                past.push(...temp);
            }
            else{
                coming.push(...temp);
            }
        }
    }
    coming.push(...past);
    // const now = new Date();
    // Get the current time in hours, minutes, and seconds
    // const currentHours = now.getHours();
    // const currentMinutes = now.getMinutes();
    // console.log(currentHours, currentMinutes);
    res.render('patient/book-slot', { page_name: '', slots: coming });
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

function calculateTimeSlots(startTime, endTime, duration, day) {
    let slots = [];
    let [hours, minutes] = startTime.split(":");
    let startMinutes = parseInt(hours) * 60 + parseInt(minutes);

    [hours, minutes] = endTime.split(":");
    let endMinutes = parseInt(hours) * 60 + parseInt(minutes);
    while (startMinutes + duration <= endMinutes) {
        let a = parseInt(startMinutes / 60);
        let b = parseInt(startMinutes % 60);
        let c = parseInt((startMinutes + duration) / 60);
        let d = (startMinutes + duration) % 60;
        slots.push({
            day,
            startTime: `${(a < 10 ? "0" + a : a)}:${(b < 10 ? "0" + b : b)}`,
            endTime: `${(c < 10 ? "0" + c : c)}:${(d < 10 ? "0" + d : d)}`,
            isBooked: false
        });
        startMinutes += duration;
        startMinutes %= (24 * 60);
    }
  
    return slots;
  }

  function isDayBefore(day1, day2) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const day1Index = days.indexOf(day1);
    const day2Index = days.indexOf(day2);
  
    // If either of the days is not found, return false or handle the case as per your requirement
    if (day1Index === -1 || day2Index === -1) {
      return false;
    }
  
    return day1Index < day2Index;
  }
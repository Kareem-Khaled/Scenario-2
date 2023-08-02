const e = require('express');
const Doctor = require('../models/doctor');
const Slot = require('../models/slot');

module.exports.render_index = async (req, res) => {
    res.render('doctor/index', { page_name: 'index' });
};

module.exports.render_history = async (req, res) => {
    const doctor = await Doctor.findOne({ info: req.user._id }).populate({
        path: 'appointments',
        populate: {
            path: 'patient',
            populate: {
                path: 'info',
            },
        },
    })

    const currentDate = new Date();
    // Add one hour to the current time (summer time)
    currentDate.setHours(currentDate.getHours() + 3);
    doctor.appointments.forEach((appointment) => {
        const appointmentDate = new Date(appointment.slot.date);
        const [hours, minutes] = appointment.slot.startTime.split(':');
        const appointmentStartTime = new Date(appointmentDate);
        appointmentStartTime.setHours(Number(hours) + 2);
        appointmentStartTime.setMinutes(Number(minutes));
      
      if (appointmentStartTime < currentDate) {
        appointment.status = 'Finished';
      }
    });
    
    await doctor.save();
    res.render('doctor/history', { page_name: 'history', appointments: doctor.appointments });
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

function calculateTimeSlots(startTime, endTime, duration, day) {
    let slots = [];
    const currentDate = new Date();
    // Add one hour to the current time (summer time)
    currentDate.setHours(currentDate.getHours() + 3);

    let [hours, minutes] = startTime.split(":");
    let startMinutes = parseInt(hours) * 60 + parseInt(minutes);

    [hours, minutes] = endTime.split(":");
    let endMinutes = parseInt(hours) * 60 + parseInt(minutes);
    while (startMinutes + duration <= endMinutes) {
        let a = parseInt(startMinutes / 60).toString().padStart(2, '0');
        let b = parseInt(startMinutes % 60).toString().padStart(2, '0');
        let c = parseInt((startMinutes + duration) / 60).toString().padStart(2, '0');
        let d = ((startMinutes + duration) % 60).toString().padStart(2, '0');
        
        const appointmentStartTime = new Date(getNextDayDate(day));
        appointmentStartTime.setHours(Number(a) + 2);
        appointmentStartTime.setMinutes(Number(b));
        if (appointmentStartTime >= currentDate) {
            slots.push({
                day,
                date: getNextDayDate(day),
                startTime: `${a}:${b}`,
                endTime: `${c}:${d}`,
                isBooked: false
            });
        }
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

  function getNextDayDate(dayName) {
    const now = new Date();
    const dayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(dayName);
  
    if (dayIndex === -1) {
      return null;
    }
  
    const currentDayIndex = now.getDay();
  
    let daysUntilNextDay = dayIndex - currentDayIndex;
    if (daysUntilNextDay <= 0) {
      daysUntilNextDay += (daysUntilNextDay === 0 ? 0 : 7);
    }
  
    now.setDate(now.getDate() + daysUntilNextDay);

    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    return `${month} / ${day} / ${year}`;
  }
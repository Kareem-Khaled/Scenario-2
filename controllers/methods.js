const Appointment = require('../models/appointment');
module.exports.calculateTimeSlots = (startTime, endTime, duration, day) => {
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

  module.exports.isDayBefore = (day1, day2) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const day1Index = days.indexOf(day1);
    const day2Index = days.indexOf(day2);
  
    // If either of the days is not found, return false or handle the case as per your requirement
    if (day1Index === -1 || day2Index === -1) {
      return false;
    }
  
    return day1Index < day2Index;
  }

  module.exports.removeExpiredAppointments = async(user) => {
        const currentDate = new Date();
        // Add one hour to the current time (summer time)
        currentDate.setHours(currentDate.getHours() + 3);
        user.appointments.forEach(async (appointment) => {
            const appointmentDate = new Date(appointment.slot.date);
            const [hours, minutes] = appointment.slot.endTime.split(':');
            const appointmentEndTime = new Date(appointmentDate);
            appointmentEndTime.setHours(Number(hours) + 2);
            appointmentEndTime.setMinutes(Number(minutes));
        
        if (appointmentEndTime < currentDate) {
            let Updatedappointment = await Appointment.findById(appointment._id);
            if(Updatedappointment.status != 'Finished'){
                Updatedappointment.status = 'Reporting';
                await Updatedappointment.save();
              }
        }
    });
    return user.appointments;
  }

  const getNextDayDate = (dayName) => {
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
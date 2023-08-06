const Patient = require('../models/patient');
const Doctor = require('../models/doctor');
const User = require('../models/user');
const Appointment = require('../models/appointment');
const Slot = require('../models/slot');
const { removeExpiredAppointments } = require('./methods');

module.exports.render_index = async (req, res) => {
    const patientId = (req.params.patientId || req.user._id);
    const patient = await Patient.findOne({ info: patientId }).populate({
        path: 'appointments'
    })
    const allAppointments = patient.appointments.length;
    let finishedAppointments = patient.appointments.filter(appointment => appointment.status === 'Finished');
    let totalCost = finishedAppointments.reduce((total, appointment) => total + appointment.cost, 0);
    
    let pendingAppointments = allAppointments - finishedAppointments.length;
    let finishedAppointmentsPercentage = (finishedAppointments.length  * 100 / allAppointments) || 0;
    let pendingAppointmentsPercentage = (pendingAppointments  * 100 / allAppointments) || 0;
    
    finishedAppointments = [finishedAppointments.length, parseInt(finishedAppointmentsPercentage)];
    pendingAppointments = [pendingAppointments, parseInt(pendingAppointmentsPercentage)];
    
    res.render('patient/index', { page_name: 'index', patient, totalCost, finishedAppointments, pendingAppointments });
};

module.exports.render_profile = async (req, res) => {
    const patient = await Patient.findOne({ info: req.user._id }).populate({
        path: 'info',
    })
    res.render('patient/profile', { page_name: 'profile', patient});
}

module.exports.render_report = async (req, res) => {
    const appointment = await Appointment.findById(req.params.appointmentId).populate({
        path: 'doctor',
        populate: {
            path: 'info',
        }
    }).populate({
        path: 'patient',
        populate: {
            path: 'info',
        }
    })
    res.render('patient/report', { page_name: 'report', appointment});
}

module.exports.save_report = async (req, res) => {
    const {report} = req.body;
    const appointment = await Appointment.findById(req.params.appointmentId);
    appointment.report = report;
    appointment.status = 'Finished';
    await appointment.save();
    req.flash('success', 'Your report has been saved');
    res.redirect('/doctor');
}

module.exports.save_profile = async (req, res) => {
    const {age, bloodType, phone, location} = req.body;
    const patient = await Patient.findOne({ info: req.user._id }).populate({
        path: 'info',
    })
    patient.age = age;
    patient.bloodType = bloodType;
    const user = await User.findById(req.user._id );
    user.phone = phone;
    user.location = location;
    await patient.save();
    await user.save();
    req.flash('success', 'Your profile has been updated');
    res.redirect('/patient');
}

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
        status: 'Pending',
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


// Function to generate the PDF
const PDFDocument = require('pdfkit');
module.exports.generate_report = async (req, res) => {
    const patient = await Patient.findOne({ info: req.user._id }).populate('info')
    .populate({
        path: 'appointments',
        populate: [
            {
                path: 'doctor',
                populate: {
                    path: 'info',
                },
            },
            {
                path: 'slot',
            },
        ],
    });
    const doc = new PDFDocument();
    const filename = `${patient.info.username}_report.pdf`;

    // Set the headers to make the PDF downloadable
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    // Pipe the PDF content directly to the response stream for download
    doc.pipe(res);

    // Add content to the PDF document
    doc.fontSize(18).text(`${patient.info.username} Report`, { underline: true, align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Age: ${patient.age}`);
    doc.fontSize(14).text(`Blood Type: ${patient.bloodType}`);
    doc.moveDown(4);

    doc.fontSize(16).text('Appointment Details:', { underline: true, align: 'center' });
    let printLine = 0;
    for (const appointment of patient.appointments) {
        const doctor = appointment.doctor;
        doc.moveDown();
        if(printLine){
            doc.strokeColor('black').lineWidth(2).moveTo(doc.x * 3, doc.y).lineTo(doc.page.width - doc.x * 2 - doc.page.margins.right, doc.y).stroke();
            doc.moveDown();
        }
        doc.fontSize(14).text(`Date: ${appointment.slot.date}`);
        doc.fontSize(14).text(`Doctor: ${doctor.info.username}`);
        doc.fontSize(14).text(`Specialty: ${doctor.specialty}`);
        doc.fontSize(14).text(`Report: ${appointment.report}`);
        doc.moveDown();
        printLine = 1;    
    }

    doc.end(); // End the PDF document

};
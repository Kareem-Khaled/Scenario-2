const express = require('express');
const patient = require('../controllers/patient');
const { isLoggedIn, isPatient } = require('../middleware');

const router = express.Router();

router.route("/profile")
        .get(isLoggedIn, isPatient, patient.render_profile)
        .post(isLoggedIn, isPatient, patient.save_profile);

router.route("/history")
        .get(isLoggedIn, isPatient, patient.render_history);

router.route("/online-booking")
        .get(isLoggedIn, isPatient, patient.render_online_booking);
        
router.route("/book-slot")
        .post(isLoggedIn, isPatient, patient.book_slot);

router.route("/generate-report")
        .get(isLoggedIn, isPatient, patient.generate_report);

router.route("/report/:appointmentId")
        .get(isLoggedIn, patient.render_report)
        .post(isLoggedIn, patient.save_report);

router.route("/:patientId")
        .get(isLoggedIn, patient.render_index);

router.route("/")
        .get(isLoggedIn, isPatient, patient.render_index);
        
module.exports = router;
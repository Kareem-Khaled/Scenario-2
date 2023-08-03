const express = require('express');
const patient = require('../controllers/patient');
const { isLoggedIn, isPatient } = require('../middleware');

const router = express.Router();

router.route("/")
        .get(isLoggedIn, isPatient, patient.render_index);

router.route("/history")
        .get(isLoggedIn, isPatient, patient.render_history);

router.route("/online-booking")
        .get(isLoggedIn, isPatient, patient.render_online_booking);

router.route("/book-slot")
        .post(isLoggedIn, isPatient, patient.book_slot);

module.exports = router;
const express = require('express');
const patient = require('../controllers/patient');
const { isLoggedIn } = require('../middleware');

const router = express.Router();

router.route("/")
        .get(isLoggedIn, patient.render_index);

router.route("/history")
        .get(isLoggedIn, patient.render_history);

router.route("/online-booking/")
        .get(isLoggedIn, patient.render_online_booking);


module.exports = router;
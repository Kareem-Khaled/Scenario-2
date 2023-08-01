const express = require('express');
const doctors = require('../controllers/doctors');
const { isLoggedIn } = require('../middleware');

const router = express.Router();

router.route("/")
        .get(isLoggedIn, doctors.render_index);

router.route("/history")
        .get(isLoggedIn, doctors.render_history);

router.route("/online-booking")
        .get(isLoggedIn, doctors.render_online_booking);

router.route('/slot')
        .post(isLoggedIn, doctors.save_slot);


module.exports = router;
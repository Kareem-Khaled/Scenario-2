const express = require('express');
const doctors = require('../controllers/doctors');

const router = express.Router();

router.route("/")
        .get(doctors.render_index);

router.route("/history")
        .get(doctors.render_history);

router.route("/online-booking")
        .get(doctors.render_online_booking);

router.route('/slot')
        .post(doctors.save_slot);


module.exports = router;
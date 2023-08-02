const express = require('express');
const doctors = require('../controllers/doctors');
const { isLoggedIn } = require('../middleware');

const router = express.Router();


router.route("/history")
        .get(isLoggedIn, doctors.render_history);

router.route("/online-booking")
        .get(isLoggedIn, doctors.render_online_booking);

router.route('/slot')
        .post(isLoggedIn, doctors.save_slot);

router.route('/slot/:doctorId')
        .get(doctors.get_slots);

router.route('/:doctorId')
        .get(doctors.veiw_slots);

router.route("/")
        .get(isLoggedIn, doctors.render_index);

module.exports = router;
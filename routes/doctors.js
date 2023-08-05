const express = require('express');
const doctors = require('../controllers/doctors');
const { isLoggedIn, isDoctor } = require('../middleware');

const router = express.Router();


router.route("/profile")
        .get(isLoggedIn, isDoctor, doctors.render_profile)
        .post(isLoggedIn, isDoctor, doctors.save_profile);

router.route("/history")
        .get(isLoggedIn, isDoctor, doctors.render_history);

router.route("/online-booking")
        .get(isLoggedIn, isDoctor, doctors.render_online_booking);

router.route('/slot')
        .post(isLoggedIn, isDoctor, doctors.save_slot);

router.route('/slot/:doctorId')
        .get(doctors.get_slots);
        
router.route('/dashboard/:doctorId')
        .get(doctors.get_doctor_dashboard);

router.route('/slots/:doctorId')
        .get(doctors.veiw_slots);

router.route("/")
        .get(isLoggedIn, isDoctor, doctors.render_index);

module.exports = router;
const express = require('express');
const auth = require('../controllers/auth');
const passport = require('passport');

const router = express.Router();
const { isNotLoggedIn } = require('../middleware');

router.route("/login")
        .get(isNotLoggedIn, auth.render_login)
        .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), auth.login);

router.route("/register")
        .get(isNotLoggedIn, auth.render_register)
        .post(auth.register);

// router.route("/forgot-password")
//         .get(auth.render_forgot_password);

router.route("/logout")
        .get(auth.logout);


module.exports = router;
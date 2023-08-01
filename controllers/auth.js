const e = require('express');
const Doctor = require('../models/doctor');

module.exports.render_register = async (req, res) => {
    res.render('authentication/register');
};

module.exports.render_login = async (req, res) => {
    res.render('authentication/login');
};

module.exports.render_forgot_password = async (req, res) => {
    res.render('authentication/forgot-password');
};

module.exports.register = async (req, res, next) => {
    try{
        const {username, email, password, cpassword, userType, gender} = req.body;
        if(password != cpassword){
            throw new Error("The two passwords aren't identical");   
        }
        if(userType == 'doctor'){
            const doctor = new Doctor({username, email, gender});
            const registeredUser = await Doctor.register(doctor, password);
            req.login(registeredUser, err => {
                if (err) return next(err);
                res.redirect('/doctor');
            })
        }
        else{
    
            res.redirect('/doctor');
        }
    }catch(err){
        req.flash('error', err.message);
        res.redirect('/register');
    }
};

module.exports.login = async (req, res) => {
    // const user = await Doctor.findById(req.user._id);
    req.flash('success', `Welcome back ${req.user.username}!!!`);
    res.redirect(`/doctor`);
};

module.exports.logout = async (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/login');
    });
};
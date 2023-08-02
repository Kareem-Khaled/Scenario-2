const User = require('../models/user');
const Doctor = require('../models/doctor');
const Patient = require('../models/patient');

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
        const isDoctor = userType === 'doctor';
        let image = "undraw_profile_0.svg";
        if(!isDoctor && gender == 'female'){
            image = "undraw_profile_1.svg";
        }
        else if(isDoctor && gender == 'male'){
            image = "undraw_profile_2.svg";
        }
        else if(isDoctor){
            image = "undraw_profile_3.svg";
        }
        const user = new User({username, email, gender, isDoctor, image});
        const registeredUser = await User.register(user, password);
        if(isDoctor){
            const doctor = new Doctor({
                info: user,
                specialty: 'General',
                slots: []
            });
            await doctor.save();
            req.login(registeredUser, err => {
                if (err) return next(err);
                res.redirect('/doctor');
            })
        }
        else{
            const patient = new Patient({
                info: user,
                history: []
            });
            await patient.save();
            req.login(registeredUser, err => {
                if (err) return next(err);
                res.redirect('/patient');
            })
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
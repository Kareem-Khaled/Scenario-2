module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.isDoctor = (req, res, next) => {
    if(!req.user.isDoctor) {
        req.flash('error', 'You can\'t access this page!');
        return res.redirect('/patient');
    }
    next();
}

module.exports.isPatient = (req, res, next) => {
    if(req.user.isDoctor) {
        req.flash('error', 'You can\'t access this page!');
        return res.redirect('/doctor');
    }
    next();
}

module.exports.isNotLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        req.flash('error', 'You are already signed in!');
        if(req.user.isDoctor) {
            return res.redirect('/doctor');
        }
        return res.redirect('/patient');
    }
    next();
}
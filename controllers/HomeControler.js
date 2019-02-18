const passport = require('passport');
const mypassport = require('../passport_config')(passport);

exports.index = (req, res) => {
    if(req.user){
        return res.render("home/index.pug", { title: "Express Server", user: req.user});
    }else{
        return res.redirect('/login');
    }
}

exports.login = (req, res) => {
    if(req.user){
        return res.redirect('/');
    }else
    res.render("home/login.pug", { title: "Log in", csrfToken: req.csrfToken(), message: req.flash() });
}

exports.loginPost = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true
    })(req, res, next);
}

exports.logout = (req, res, next) => {
   req.logout();
   req.session.destroy();
   res.redirect('/login');
}
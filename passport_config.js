let LocalStrategy = require('passport-local').Strategy;
let bcrypt = require('bcrypt');
let db = require('./models/models');

module.exports = (passport) => {
    console.log("initialize passport");
    passport.serializeUser((user, done) => {
        done(null, user.UserName);
    });

    passport.deserializeUser((username, done) => {
        console.log('search user:' + username)
        db.User.findOne({
            where: {
                UserName: username
            }
        }).then((user) => {
            if (user) {
                done(null, user);
            } else {
                done(new Error('Wrong user Id.'))
            }
        })
    });

    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, username, password, done) {
        if (username == null || username == "") {
            req.flash('message', 'Id de usuario vacio');
            return done(null, false);
        } else if (password == "" || password == undefined) {
            req.flash('message', 'Clave vacia');
            return done(null, false);
        }

        return db.User.findOne({
            where: {
                UserName: username
            }
        }).then(user => {
            if (user) {
                console.log(username, password)
                console.log(user.UserName)
                bcrypt.compare(password, user.Password, (err, result) => {
                    console.log("password:" + result);
                    if (result) {
                        return done(null, user);
                    } else {
                        req.flash('message', 'Clave incorrecta');
                        console.log("password Error");
                        return done(null, false);
                    }
                });
            } else {
                console.log("user no found");
                req.flash('message', 'Usuario no autorizado');
                return done(null, false);
            }

        }).catch(err => {
            console.log(err)
            done(err, false);
        });
    }))
}
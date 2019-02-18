let LocalStrategy = require('passport-local').Strategy;
let bcrypt = require('bcrypt');
let db = require('./models/models');

module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user.username);
    });

    passport.deserializeUser((username, done) => {
        db.user.findOne({
            where: {
                username: username
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
            req.flash('userError', 'Id de usuario vacio');
            return done(null, false);
        } else if (password == "" || password == undefined) {
            req.flash('passwordError', 'Clave vacia');
            return done(null, false);
        }

        return db.user.findOne({
            where: {
                username: username
            }
        }).then(user => {
            if (user) {
                bcrypt.compare(password, user.password, (err, result) => {
                    if (result) {
                        return done(null, user);
                    } else {
                        req.flash('passwordError', 'Clave incorrecta');
                        return done(null, false);
                    }
                });
            } else {
                req.flash('userError', 'Usuario no autorizado');
                return done(null, false);
            }

        }).catch(err => {
            done(err, false);
        });
    }))
}
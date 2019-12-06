let LocalStrategy = require('passport-local').Strategy;
let db = require('./models');

module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user.Name);
    });

    passport.deserializeUser((username, done) => {
        db.user.findOne({
            where: {
                Name: username
            }, include: [
                { model: db.userConfig },
                { model: db.favorite },
                { model: db.recent }
            ]
        }).then((user) => {
            if (user) {
                done(null, user);
            } else {
                done(new Error('Wrong user Id.'))
            }
        }).catch(err => {
            console.log(err);
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
                Name: username
            }, include: [
                { model: db.userConfig },
                { model: db.favorite },
                { model: db.recent }
            ]
        }).then(user => {
            if (user) {
                user.validPassword(password).then((result) => {
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
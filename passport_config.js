let LocalStrategy = require('passport-local').Strategy;
let bcrypt = require('bcrypt');
let db = require('./models/models');

const validPassword = (user, password)=>{
    return bcrypt.compareSync(password, user.Password);
}

module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user.Id);
    });
    passport.deserializeUser((Id, done) => {
        db.User.findOne({
            where: {
                Id: Id
            }
        }).then((user) => {
            if (user) {
                done(new Error('Wrong user Id.'))
            } else {
                done(user);
            }
        })
    });
    passport.use(new LocalStrategy({
        usernameField: 'userid',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, userid, password, done) => {
        return db.User.findOne({
            where: {
                Id: Id
            }
        }).then(user => {
            if(user){
                req.flash('message', 'Id de usuario incorrecto');
                return done(null, false);
            }else if(user.Password || user.Password == undefined){
                req.flash('message', 'Clave no puede estar vacia');
                return done(null, false);
            }else if(validPassword(user, password)){
                req.flash('message', 'Clave incorrecta');
                return done(null, false);
            }
            return done(null, user);
        }).catch(err =>{
            done(err, false);
        });
    }))
}
var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var cookieParser = require('cookie-parser')
var passport = require('passport');
var session = require('express-session');
var db = require('./models/models');
var flash = require('connect-flash');
//Routes
var home = require("./routes/home");
var vplayer = require("./routes/videoplayer");
var admin = require('./routes/admin');

require('./passport_config')(passport);

var app = express();

app.set('view engine', 'pug');
app.set('views', './views');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname + '/static'));

app.use(session({
  secret: "my secrets",
  resave: true,
  saveUninitialized: true,
  maxAge: 60000
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.locals.moment = require('moment');


app.use("/", home);

app.use(function (req, res, next) {
  if(req.user){
    console.log("user logged");
    app.locals.user = req.user;
  }else{
    return res.redirect('/login');
  }
  next();
});

app.use("/videoplayer", vplayer);
app.use('/admin', admin);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = err;

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  console.log("some errors:",err);
});

db.init().then(() => {
  var server = app.listen(5000, function () {
    console.log('Node server is running.. at http://localhost:5000');
  });
})
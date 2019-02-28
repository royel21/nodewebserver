var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var cookieParser = require('cookie-parser')
var passport = require('passport');
var session = require('express-session');
var db = require('./models');
var flash = require('connect-flash');
const bodyParser = require('body-parser');
const csrf = require('csurf');

//Routes
var home = require("./routes/homeRoute");
var vplayer = require("./routes/videoPlayerRoute");
var admin = require('./routes/adminRoute');

require('./passport_config')(passport);

var app = express();

app.set('view engine', 'pug');
app.set('views', './views');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
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
app.locals.roles = { user: "Usurario", manager: "Manager", admin: "Administrador" };

app.use(function (req, res, next) {
  if (req.user) {
    app.locals.user = req.user;
  } else if (req.url !== "/login") {
    return res.redirect('/login');
  }

  next();
});
app.use(csrf({ cookie: true }));
app.use("/", home);
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
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  console.log(req.url)
  console.log("some errors:", err);
  return res.render('error');
});

db.init().then(() => {
  let server = app.listen(5080, function () {
    console.log('Node server is running.. at http://localhost:5080');
  });
  
  require('./socketio-server')(server, app);
});

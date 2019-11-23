const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const csrf = require('csurf');
const fileUpload = require('express-fileupload');

const db = require('./models');

//Routes
const home = require("./routes/homeRoute");
const vplayer = require("./routes/videoPlayerRoute");
const admin = require('./routes/adminRoute');

require('./passport_config')(passport);

const app = express();

app.set('view engine', 'pug');
app.set('views', './views');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));
app.use(fileUpload());

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
app.locals.fs = require("fs");

app.use(function (req, res, next) {
  if (req.user) {
    app.locals.user = req.user;
    app.locals.url = req.url
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
  if (!req.url.includes('covers') && !req.url.includes('.map')) {
    console.log("some errors:", req.url, err.message);
  }
  return res.render('error');
});

const port = 4664;

db.init().then(() => {
  let server = app.listen(port, function () {
    console.log('Node server is running.. at http://localhost:'+port);
  });

  require('./modules/socketio-server')(server, app);
});

var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var cookieParser = require('cookie-parser')
var passport = require('passport');
var session = require('express-session');

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

app.use(session({secret: "my secrets"}));
app.use(passport.initialize());
app.use(passport.session());

app.use("/", home);
app.use("/videoplayer", vplayer);
app.use('/admin', admin);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

var server = app.listen(5000, function () {
    console.log('Node server is running.. at http://localhost:5000');
});
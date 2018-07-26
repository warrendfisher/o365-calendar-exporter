var createError = require('http-errors');
const express = require('express'),
    app = express(),
    bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var path = require('path');
const session = require('express-session');
var helmet = require('helmet');

require('dotenv').config();

var indexRouter = require('./routes/index');
var authorize = require('./routes/authorize');
var calendar = require('./routes/calendar');
var xlsexport = require('./routes/xlsexport');
var about = require('./routes/about');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set('trust proxy', 1); // trust first proxy

//configuring the body-parser middleware
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'calExporterOffice365',
    resave: false,
    saveUninitialized: true,
}));

app.use('/', indexRouter);
app.use('/authorize', authorize);
app.use('/calendar', calendar);
app.use('/xlsexport', xlsexport);
app.use('/about', about);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
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

module.exports = app;
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var imageRouter = require('./routes/image');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Exposing public/ for static image GETs
app.use(express.static(path.join(__dirname, 'public')));

// Only image/ route implemented
app.use('/api', imageRouter);

// Default response for any other request
app.use(function(req, res, next) {
  const error = new Error("Not found.");
  error.status = 404;
  res.statusCode = 404;
  next(error);
});

// error handler
app.use(function(err, req, res, next) {
  res.status(res.statusCode || 500);
  res.end();
});

module.exports = app;

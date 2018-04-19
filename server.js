const dotenv = require('dotenv');
const result = dotenv.config();
if (result.error) throw result.error;
const createError = require('http-errors');
const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const app = express();
const sslkey = fs.readFileSync('ssl-key.pem');
const sslcert = fs.readFileSync('ssl-cert.pem');
const options = {
  key: sslkey,
  cert: sslcert,
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routing
const indexRouter = require('./routes/index');
const imagesRouter = require('./routes/images');
const loginRouter = require('./routes/login');
app.use('/', indexRouter);
app.use('/images', imagesRouter);
app.use('/login', loginRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  console.log(req);
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// connect to database and create servers
mongoose.connect(
    `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/test`).
    then(() => {
      console.log('database connection authenticated succesfully!');
      https.createServer(options, app).listen(3000);
      http.createServer((req, res) => {
        res.writeHead(301, {'Location': 'https://localhost:3000' + req.url});
        res.end();
      }).listen(8080);
    });


module.exports = app;

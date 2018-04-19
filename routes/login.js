const express = require('express');
const app = require('express')();
const passport = require('passport');
const bodyParser = require('body-parser');
const LocalStrategy = require('passport-local').Strategy;
const router = new express.Router();
const strategy = new LocalStrategy(
    (username, password, done) => {
      if (username !== process.env.username ||
          password !== process.env.password) {
        return done(null, false, {message: 'Incorrect credentials.'});
      }
      console.log('Authentication succeeded.');
      return done(null, {});
    });

app.use(bodyParser.urlencoded({extended: true}));
passport.use(strategy);
app.use(passport.initialize());

router.post('/', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/test',
  session: false,
}));

module.exports = router;

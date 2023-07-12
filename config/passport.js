const express = require('express')
const passport = require('passport')
const User = require('../database/Models/user')

passport.use(new LocalStrategy(
    function(username, password, done) {
      User.findOne({ where: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!user.verifyPassword(password)) { return done(null, false); }
        return done(null, user);
      });
    }
  ));
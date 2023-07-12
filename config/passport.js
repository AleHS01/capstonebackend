const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcrypt");

const User = require("../database/Models/user");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ where: { username } });
      if (!user) {
        return done(null, false, { message: "User Not found!" });
      }
      const validUser = await bcrypt.compare(password, user.password);
      if (!validUser) {
        return done(null, false, { message: "Invalid password" });
      }
      return done(null, user);
    } catch (error) {
      done(error);
    }
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/api/google/callback", // adjust as necessary
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate({
        where: { googleId: profile.id },
        defaults: {
          username: profile.displayName,
          email: profile.emails[0].value,
        },
      })
        .then(([user, created]) => {
          // user - the found or created user object
          // created - a boolean indicating whether the user was created or found

          return cb(null, user);
        })
        .catch((err) => {
          return cb(err);
        });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error);
    });
});

module.exports = passport;

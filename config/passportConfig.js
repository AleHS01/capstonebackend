const User = require("../database/Models/User");
const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ where: { username } });

        if (!user) {
          return done(null, false);
        }

        bcrypt.compare(password, user.password, (error, result) => {
          if (error) {
            return done(null, error);
          }

          if (result === true) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        });
      } catch (error) {
        return done(null, error);
      }
    })
  );
  passport.serializeUser((user, cb) => {
    cb(null, user.id);
  });

  passport.deserializeUser(async (id, cb) => {
    console.log("User id in deserializeUser: ", id);
    try {
      const user = await User.findByPk(id);
      cb(null, user);
    } catch (error) {
      cb(error, null);
    }
  });
};

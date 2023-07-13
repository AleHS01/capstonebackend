const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcrypt");

const User = require("../database/Models/user");

// passport.use(
//   new LocalStrategy(async (username, password, done) => {
//     try {
//       const user = await User.findOne({ where: { username } });
//       if (!user) {
//         return done(null, false, { message: "User Not found!" });
//       }
//       const validUser = await bcrypt.compare(password, user.password);
//       if (!validUser) {
//         return done(null, false, { message: "Invalid password" });
//       }
//       return done(null, user);
//     } catch (error) {
//       done(error);
//     }
//   })
// );

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/api/google/callback", // adjust as necessary
    },
    async (accessToken, refreshToken, profile, cb) => {
      console.log("Profile:\n", profile);
      try {
        //Check if user with the given Google ID already exists
        const existingUser = await User.findOne({
          where: { googleId: profile.id },
        });
        if (existingUser) {
          return cb(null, existingUser);
        } else {
          //Create a new user using the Google profile data
          const newUser = await User.create({
            username: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
          });
          return cb(null, newUser);
        }
      } catch (error) {
        return cb(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("serialize user works, user id:", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  console.log("User id in deserialieUser: ", id);
  User.findByPk(id)
    .then((user) => {
      console.log("Deserialize user works, user id:", user.id);
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

module.exports = passport;

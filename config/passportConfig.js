require("dotenv").config();
const { defaults } = require("pg");
const { User } = require("../database/Models");
const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(async (username, password) => {
      try {
        const user = await User.findOne({ where: { username } });

        if (!user) {
          return done(null, false, { message: "Incorrect Username" });
        }
        if (!bcrypt.compare(password, user.password)) {
          return done(null, false, { message: "Incorrect Password" });
        }
        // await bcrypt.compare(password, user.password, (error, result) => {
        //   if (error) {
        //     return done(error);
        //   }

        //   if (result === true) {
        //     return done(null, user);
        //   } else {
        //     return done(null, false, { message: "Incorrect Password" });
        //   }
        // });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // -------------Google Auth--------------
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/login/google_callback`,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, cb) => {
        const defaultUser = {
          username: `${profile.name.givenName} ${profile.name.familyName}`,
          email: profile.emails[0].value,
          googleId: profile.id,
          first_name: profile.name.givenName,
          last_name: profile.name.familyName,
        };

        try {
          let user = await User.findOne({ where: { googleId: profile.id } });

          if (!user) {
            // User doesn't exist, create a new user
            user = await User.create(defaultUser);
          }

          return cb(null, user);
        } catch (error) {
          console.log(error);
          return cb(error, null);
        }
      }
    )
  );

  // passport.use(
  //   new GoogleStrategy(
  //     {
  //       clientID: process.env.GOOGLE_CLIENT_ID,
  //       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  //       callbackURL: `${process.env.BACKEND_URL}/api/login/google_callback`,
  //       passReqToCallback: true,
  //     },
  //     async (req, accessToken, refreshToken, profile, cb) => {
  //       const defaultUser = {
  //         username: `${profile.name.givenName} ${profile.name.familyName}`,
  //         email: profile.emails[0].value,
  //         googleId: profile.id,
  //         first_name: profile.name.givenName,
  //         last_name: profile.name.familyName,
  //       };

  //       // console.log("google Profile:", profile);
  //       const user = await User.findOrCreate({
  //         where: { googleId: profile.id },
  //         defaults: defaultUser,
  //       }).catch((err) => {
  //         console.log(err);
  //         cb(err, null);
  //       });
  //       if (user && user[0]) {
  //         return cb(null, user && user[0]);
  //       }
  //     }
  //     // async (req, accessToken, refreshToken, profile, done) => {
  //     //   try {
  //     //     const defaultUser = {
  //     //       username: `${profile.name.givenName} ${profile.name.familyName}`,
  //     //       email: profile.emails[0].value,
  //     //       googleId: profile.id,
  //     //       first_name: profile.name.givenName,
  //     //       last_name: profile.name.familyName,
  //     //     };

  //     //     // console.log("google Profile:", profile);
  //     //     const [user] = await User.findOrCreate({
  //     //       where: { googleId: defaultUser.googleId },
  //     //       defaults: defaultUser,
  //     //     });
  //     //     done(null, user);
  //     //   } catch (error) {
  //     //     done(error);
  //     //   }
  //     //   // ).catch((err) => {
  //     //   //   console.log(err);
  //     //   //   done(err, null);
  //     //   // });
  //     //   // if (user && user[0]) {
  //     //   //   return done(null, user && user[0]);
  //     //   // }
  //     // }
  //   )
  // );

  // -------------End of Google Auth--------------

  passport.serializeUser((user, cb) => {
    console.log("Serialize user id:", user.id);
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

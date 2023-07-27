require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const db = require("./database/db");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const { User } = require("./database/Models");
const serverless = require("serverless-http");
// const passportLocalStrategy = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
// const cookieSession = require("cookie-session");
const bycrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const cookieConfig = require("./config/cookieConfig");

const app = express();

const sessionStore = new SequelizeStore({ db });

//--------------------------Imports Done-----------

// MiddleWare
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// const corsOptions = {

//   origin: function (origin, callback) {
//     // Allow requests with no origin (like mobile apps or curl requests)
//     if (!origin) return callback(null, true);

//     // Check if the origin is in the whitelist (replace 'http://localhost:3000' with your actual frontend URL)
//     const allowedOrigins = ["http://localhost:3000"];
//     if (allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
// };

// app.use(cors(corsOptions)); // Use the custom CORS middleware
app.enable("trust proxy");

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    // methods: "GET,POST,PUT,DELETE",
    credentials: true,
    allowedHeaders:
      "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    preflightContinue: true,
  })
);

// app.use(cookieParser("secret"));

app.use(
  session({
    secret: "secret",
    store: sessionStore,
    resave: true,
    saveUninitialized: true,
    cookie: cookieConfig,
  })
);
// app.use(
//   cookieSession({
//     name: "session",
//     secret: "secret",
//     //for non HTTPS connection: if its a HTTPS (deploy) then put back
//     // sameSite: "none",
//     // secure: true,
//     maxAge: 1000 * 60 * 60 * 24,
//     path: "/",
//     httpOnly: true,
//   })
// );
// app.use(function (request, response, next) {
//   if (request.session && !request.session.regenerate) {
//     request.session.regenerate = (cb) => {
//       cb();
//     };
//   }
//   if (request.session && !request.session.save) {
//     request.session.save = (cb) => {
//       cb();
//     };
//   }
//   next();
// });

// passport.serializeUser((user, cb) => {
//   cb(null, user.id);
// });

// passport.deserializeUser(async (id, cb) => {
//   console.log("User id in deserializeUser: ", id);
//   try {
//     const user = await User.findByPk(id);
//     cb(null, user);
//   } catch (error) {
//     cb(error, null);
//   }
// });

// passport.serializeUser((user, done) => {
//   console.log("serialize User is running");
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   console.log("Deserialize is Running");
//   try {
//     const user = await User.findByPk(id);
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// });

app.use(passport.initialize());
app.use(passport.session());
require("./config/passportConfig")(passport); //to use same instance of passport in the entire server

// passport.use(
//   new LocalStrategy(async (username, password, done) => {
//     try {
//       const user = await User.findOne({ where: { username } });

//       if (!user) {
//         return done(null, false, { message: "Incorrect Username" });
//       }
//       if (!bcrypt.compare(password, user.password)) {
//         return done(null, false, { message: "Incorrect Password" });
//       }
//       // await bcrypt.compare(password, user.password, (error, result) => {
//       //   if (error) {
//       //     return done(error);
//       //   }

//       //   if (result === true) {
//       //     return done(null, user);
//       //   } else {
//       //     return done(null, false, { message: "Incorrect Password" });
//       //   }
//       // });

//       return done(null, user);
//     } catch (error) {
//       return done(error);
//     }
//   })
// );

// // -------------Google Auth--------------

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "http://localhost:8080/api/login/google_callback",
//       // passReqToCallback: true,
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const defaultUser = {
//           username: `${profile.name.givenName} ${profile.name.familyName}`,
//           email: profile.emails[0].value,
//           googleId: profile.id,
//           first_name: profile.name.givenName,
//           last_name: profile.name.familyName,
//         };

//         // console.log("google Profile:", profile);
//         const [user] = await User.findOrCreate({
//           where: { googleId: defaultUser.googleId },
//           defaults: defaultUser,
//         });
//         done(null, user);
//       } catch (error) {
//         done(error);
//       }
//       // ).catch((err) => {
//       //   console.log(err);
//       //   done(err, null);
//       // });
//       // if (user && user[0]) {
//       //   return done(null, user && user[0]);
//       // }
//     }
//   )
// );

// // -------------End of Google Auth--------------

// passport.serializeUser((user, cb) => {
//   console.log("Serialize user id:", user.id);
//   cb(null, user.id);
// });

// passport.deserializeUser(async (id, cb) => {
//   console.log("User id in deserializeUser: ", id);
//   try {
//     const user = await User.findByPk(id);
//     cb(null, user);
//   } catch (error) {
//     cb(error, null);
//   }
// });

// app.use(cookieParser("secret"));

//------------------------Middleware Done----------------------

//Mounting Routes
app.use("/api", require("./api")(passport));

//Start Server
const serverRun = () => {
  app.listen(process.env.PORT, () => {
    console.log(`Live on port: ${process.env.PORT}`);
  });
};

async function main() {
  console.log("This is going to print models: ", db.models);
  await sessionStore.sync();
  await db.sync();
  await serverRun();
}

main();

module.exports.handler = serverless(app);

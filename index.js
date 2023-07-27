const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const db = require("./database/db");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const { User } = require("./database/Models");
// const passportLocalStrategy = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
// const cookieSession = require("cookie-session");
// const bycrypt = require("bcryptjs");
// const bodyParser = require("body-parser");

const app = express();

const sessionStore = new SequelizeStore({ db });

//--------------------------Imports Done-----------

// MiddleWare
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use(cookieParser("secret"));

app.use(
  session({
    secret: "secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    // cookie: {
    //   maxAge: 1000 * 60 * 60 * 24,
    //   httpOnly: true,
    //   // sameSite: "none", ONLY USE WHEN DEPLOY
    //   // secure: true,
    // },
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

passport.serializeUser((user, done) => {
  console.log("serialize User is running");
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  console.log("Deserialize is Running");
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

app.use(passport.initialize());
app.use(passport.session());
require("./config/passportConfig")(passport); //to use same instance of passport in the entire server

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

const express = require("express");
const cors = require("cors");
const passport = require("passport");
const passportLocalStrategy = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bycrypt = require("bcryptjs");
const session = require("express-session");
const bodyParser = require("body-parser");
const db = require("./database/db");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

const app = express();

const sessionStore = new SequelizeStore({ db });

//--------------------------Imports Done-----------

// MiddleWare
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if the origin is in the whitelist (replace 'http://localhost:3000' with your actual frontend URL)
    const allowedOrigins = ["http://localhost:3000"];
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// app.use(cors(corsOptions)); // Use the custom CORS middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

// app.use(
//   session({
//     secret: "secret",
//     store: sessionStore,
//     resave: true,
//     saveUninitialized: true,
//     cookie: { maxAge: 8 * 60 * 60 * 1000 },
//   })
// );
app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    secret: "secret",
    sameSite: "none",
    secure: true,
    maxAge: 1000 * 60 * 60 * 24,
    path: "/",
    httpOnly: true,
  })
);
app.use(function (request, response, next) {
  if (request.session && !request.session.regenerate) {
    request.session.regenerate = (cb) => {
      cb();
    };
  }
  if (request.session && !request.session.save) {
    request.session.save = (cb) => {
      cb();
    };
  }
  next();
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

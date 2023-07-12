const express = require("express");
const passport = require("./config/passport");
const cors = require("cors");
const app = express();
const PORT = 8080;
const session = require("express-session");
const db = require("./database/db.js");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const {Configuration, PlaidApi, PlaidEnvironments}= require('plaid')
app.use(cors());
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionStore = new SequelizeStore({ db });

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.CLIENT_ID,
      'PLAID-SECRET': process.env.SECRET,
    },
  },

})


// setting up plaid client
const plaidClient = new PlaidApi(configuration)
console.log(plaidClient)

// express-session middleware
app.use(
  require("express-session")({
    secret: "secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 4 * 60 * 60 * 1000 }, //fours hours
  })
);

// Initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use("/api", require("./api"));

app.get("/", (req, res) => {
  res.send("server up and running :)");
});

const runServer = async () => {
  await db.sync();
  app.listen(PORT, () => {
    console.log("Live on port 8080.");
  });
};
console.log(plaidClient)
runServer();
module.exports = {app, plaidClient};

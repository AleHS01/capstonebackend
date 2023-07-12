const express = require("express");
const passport = require('./config/passport')
const cors = require("cors");
const app = express();
const PORT = 8080;
const db = require("./database/db.js");
app.use(cors());

app.use(express.json())
app.use(express.urlencoded({extended: true}))

// express-session middleware 
app.use(require('express-session')({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}))

// Initialize passport middleware
app.use(passport.initialize())
app.use(passport.session())

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

runServer();
module.exports = app;

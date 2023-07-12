const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 8080;
const db = require("./database/db.js");
app.use(cors());

app.get("/", (req, res) => {
  res.send("server up and running :)");
});

// app.use("/api", require("./api"));

const runServer = async () => {
  await db.sync();
  app.listen(PORT, () => {
    console.log("Live on port 8080.");
  });
};

runServer();
module.exports = app;

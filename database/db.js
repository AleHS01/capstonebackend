const { Sequelize } = require("sequelize");
const dotenv = require("dotenv").config();
const pg = require("pg");

// const db = new Sequelize("postgres://postgres@localhost:5432/financemate_db", {
//   logging: false,
//   dialectModule: pg,
// });

//DB for DEPLOYMENT - USE THIS ONE
const db = new Sequelize(
  "postgres://alehs:I0Hr1Yl65cDLD0Xy0ZGekZM65n1h578V@dpg-cj07gnh8g3n9brqv9250-a.oregon-postgres.render.com/capstone_db_u25j",
  {
    logging: false,
    dialectModule: pg,
    dialectOptions: {
      ssl: true,
    },
  }
);

//const db = new Sequelize('postgres://localhost:5432/capstone_database')

// const db = new Sequelize('postgres://localhost:5432/capstone_database')

// const db = new Sequelize("postgres://postgres:Home6924@localhost:5432/financemate_db", {
//   logging: false,
//   dialectModule: pg,
// });
// const db = new Sequelize('postgres://localhost:5432/capstonedatabase')

// const db = new Sequelize("postgres://postgres:Home6924@localhost:5432/financemate_db", {
//   logging: false,
//   dialectModule: pg,
// });

//Test Conection
db.authenticate()
  .then(() => {
    console.log("DB connection works");
  })
  .catch((error) => {
    console.error("DB connection failed:", error);
  });

module.exports = db;

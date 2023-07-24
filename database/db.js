const { Sequelize } = require("sequelize");
const dotenv = require("dotenv").config();
const pg = require("pg");

// const db = new Sequelize("postgres://postgres@localhost:5432/financemate_db", {
//   logging: false,
//   dialectModule: pg,
// });
<<<<<<< HEAD
//const db = new Sequelize('postgres://localhost:5432/capstone_database')
=======
// const db = new Sequelize('postgres://localhost:5432/capstone_database')
>>>>>>> f87a05bbce3e8bf73634eb33ef50205ebf0c4ce4

// const db = new Sequelize("postgres://postgres:Home6924@localhost:5432/financemate_db", {
//   logging: false,
//   dialectModule: pg,
// });
const db = new Sequelize('postgres://localhost:5432/capstonedatabase')

const db = new Sequelize("postgres://postgres:Home6924@localhost:5432/financemate_db", {
  logging: false,
  dialectModule: pg,
});

//Test Conection
db.authenticate()
  .then(() => {
    console.log("DB connection works");
  })
  .catch((error) => {
    console.error("DB connection failed:", error);
  });

module.exports = db;

const { DataTypes } = require("sequelize");
const db = require("../db");

const Income = db.define("Income", {
  income_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  income_value: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "Users",
      key: "id",
    },
  },
});

module.exports = Income;

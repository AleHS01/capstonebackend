const { DataTypes } = require("sequelize");
const db = require("../db");

const Expense = db.define("Expense", {
  expense_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  expense_value: {
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

module.exports = Expense;

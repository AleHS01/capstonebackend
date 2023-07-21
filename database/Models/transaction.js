const db = require("../db");
const { DataTypes } = require("sequelize");

const Transaction = db.define("Transaction", {
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  merchant_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  payment_channe: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  personal_finance_category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  transaction_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
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

module.exports = Transaction;

const { DataTypes } = require("sequelize");
const db = require("../db");

const Group = db.define("Group", {
  group_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  isOrdered: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
});

module.exports = Group;

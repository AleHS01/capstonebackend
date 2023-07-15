const { DataTypes } = require("sequelize");
const db = require("../db");
const bcrypt = require("bcryptjs");

const User = db.define(
  "User",
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, //when working with google-auth
      //unique: true
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    plaidAccessToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    plaidItemId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeBulkCreate: async (users) => {
        for (const user of users) {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        }
      },
    },

    beforeUpdate: async (user) => {
      if (user.password && user.changed("password")) {
        const salt = await bcrypt.genSalt(10); // generating salt using bcrypt
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  }
);
module.exports = User;

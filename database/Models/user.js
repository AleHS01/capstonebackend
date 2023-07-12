const { DataTypes } = require('sequelize/types')
const db = require('../db')
const {DataTypes} = require('sequelize')

const User = db.define("Users", {
    username:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
})

module.exports = User
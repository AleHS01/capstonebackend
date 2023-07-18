const db = require('../db')
const {DataTypes} = require('sequelize')

const Budget = db.define("Budget", {
    budget_name:{
        type: DataTypes.STRING,
        allowNull: true
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
})

module.exports = Budget
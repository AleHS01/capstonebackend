const { DataTypes } =require("sequelize")
const db = require("../db")

const Active_Committee = db.define("Active_Committee",{
    committee_name:{
        type:DataTypes.STRING,
        allowNull: true,
    },
    individual_amount:{
        type:DataTypes.INTEGER,
        allowNull: true,
    },
    total_amount:{
        type:DataTypes.INTEGER,
        allowNull: true,
    },
    start_date:{
        type:DataTypes.DATE,
        allowNull: true,
    },
    end_date:{
        type:DataTypes.DATE,
        allowNull: true,
    }
})

module.exports = Active_Committee;
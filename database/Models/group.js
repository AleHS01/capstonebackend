const { DataTypes } =require("sequelize")
const db = require("../db")

const Group = db.define("Group",{
    group_name:{
        type:DataTypes.STRING,
        allowNull: true,
    }
})

module.exports = Group;
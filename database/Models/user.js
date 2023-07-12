const { DataTypes } = require('sequelize/types')
const db = require('../db')
const {DataTypes} = require('sequelize')
const bcrypt = require('bcrypt')

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
},{
    hooks: {
        // trigger beforeCreate hook --> when an entry is saved for the first time
        beforeCreate: async (user) => {
            if(user.password){
                const salt = await bcrypt.genSalt(10) // generating salt using bcrypt
                user.password = await bcrypt.hash(user.password, salt)
            }
        },
        beforeUpdate: async (user) => {
            const salt = await bcrypt.genSalt(10) // generating salt using bcrypt
            user.password = await bcrypt.hash(user.password, salt)
        }
    }
}
)

module.exports = User
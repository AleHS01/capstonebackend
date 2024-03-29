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
    },
    stripe_product_id:{
        type:DataTypes.STRING,
        allowNull:true
    },
    stripe_price_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    arrayOfUsersID: {
        type: DataTypes.ARRAY(DataTypes.STRING), 
        defaultValue: [],
      },
    
})

module.exports = Active_Committee;
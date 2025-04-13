

const {DataTypes}=require('sequelize')
const {sequelize}=require('../config/db')

const customerMaster = sequelize.define(
    'customer_master',{
       
        customerId:{
            type:DataTypes.INTEGER,
            primaryKey :true,
            autoIncrement :true
        },
        customerName:{
            type:DataTypes.STRING,
            allowNull :false
        },
        customerPhone:{
            type:DataTypes.STRING,
            allowNull :false
        },
        customerEmail:{
            type:DataTypes.STRING,
            allowNull :false,
            unique :true
        },
        customerAddress:{
            type:DataTypes.STRING,
            allowNull :false
        },
        customerProfession:{
            type:DataTypes.STRING,
            allowNull :false
        },
        languagesKnown:{
            type:DataTypes.STRING,
            allowNull :false
        },
        projectNameBlock:{
            type:DataTypes.STRING,
            allowNull :false
        },
        flatNo:{
            type:DataTypes.STRING,
            allowNull :false
        }
    },{
    tableName:'customer_masters',
    timestamps :true}
)

module.exports=customerMaster
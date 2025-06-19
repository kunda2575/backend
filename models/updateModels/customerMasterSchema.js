

const {DataTypes}=require('sequelize')
const {sequelize}=require('../../config/db')

const CustomerMaster = sequelize.define(
    'customer_master',{
        // id: {
        //     type: DataTypes.INTEGER,
        //     autoIncrement: true,
        //     primaryKey: true
        // },
        customerId:{
            type:DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
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
        }, 
        documents:{
            type:DataTypes.STRING,
            allowNull :false
        }, userId:{
            type:DataTypes.INTEGER,
            allowNull:false
        }
    },{
    tableName:'customer_masters',
    timestamps :true}
)

module.exports=CustomerMaster
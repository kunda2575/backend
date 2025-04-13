
const {DataTypes}=require('sequelize')
const {sequelize}=require('../config/db')

const builserMaster = sequelize.define(
    'builder_master',{
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        bilderMaster:{
            type:DataTypes.STRING,
            allowNull:false
        }
    },
    {
        tableName:'builder_masters',
        timestamps:true
    }

)
module.exports=builserMaster
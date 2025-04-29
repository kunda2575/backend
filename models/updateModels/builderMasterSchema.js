
const {DataTypes}=require('sequelize')
const {sequelize}=require('../../config/db')

const builderMaster = sequelize.define(
    'builder_master',{
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        builderMaster:{
            type:DataTypes.STRING,
            allowNull:false
        },
        userId:{
            type:DataTypes.INTEGER,
            allowNull:false
        }
    },
    {
        tableName:'builder_masters',
        timestamps:true
    }

)
module.exports=builderMaster
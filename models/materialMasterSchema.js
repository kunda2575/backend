

const {DataTypes}=require('sequelize')
const {sequelize}=require('../config/db')

const materialMaster = sequelize.define(
    'material_master',{
        material_id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
        
            autoIncrement:true
        },
        materialName:{
            type:DataTypes.STRING,
            allowNull:false
        }
    },
    {
        tableName:'material_masters',
        timestamps :true
    }
)
module.exports=materialMaster
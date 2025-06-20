

const {DataTypes}=require('sequelize')
const {sequelize}=require('../../config/db')

const materialMaster = sequelize.define(
    'material_master',{
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        material_id:{
            type:DataTypes.STRING,
            allowNull :false,
            unique: true
        },
        materialName:{
            type:DataTypes.STRING,
            allowNull:false
        },
       
    },
    {
        tableName:'material_masters',
        timestamps :true
    }
)
module.exports=materialMaster

const {DataTypes}=require('sequelize')
const {sequelize}=require('../config/db')

const vendorMaster = sequelize.define(
    'vendor_master',{
        vendorId:{
            type: DataTypes.INTEGER, // ✅ Added data type
            primaryKey: true,
            autoIncrement: true // ✅ Auto-generate IDs
        },
        vendorName:{
            type:DataTypes.STRING,
            allowNull:false
        },
        services:{
            type:DataTypes.STRING,
            allowNull:false
        },
        phone :{
            type:DataTypes.STRING,
            allowNull:false
        },
        address:{
            type:DataTypes.STRING,
            allowNull : false
        },
        city:{
            type:DataTypes.STRING,
            allowNull:false
        }

    },
    {
        tableName:'vendor_master',
        timestaamps:true
    }
    
)
module.exports=vendorMaster
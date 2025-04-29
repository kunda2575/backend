
const {DataTypes}=require('sequelize')
const {sequelize}=require('../../config/db')

const userMaster = sequelize.define(
    'userMaster',{
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userName:{
            type:DataTypes.STRING,
            allowNull :false
        },
        password :{
            type:DataTypes.STRING,
            allowNull :false
        },
        role:{
            type:DataTypes.STRING,
            allowNull :false
        },
        phone :{
            type:DataTypes.STRING,
            allowNull :false
        },
        email:{
            type:DataTypes.STRING,
            allowNull :false,
            unique:true
        },
        userId:{
            type:DataTypes.INTEGER,
            allowNull:false
        }
    },{
        tableName :'user_masters',
        timestamps:true
    }
)
module.exports = userMaster
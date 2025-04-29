const {DataTypes}=require('sequelize')
const {sequelize} = require('../../config/db')


const teamMembers = sequelize.define(
    'team_members',{
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        team_name:{
            type:DataTypes.STRING,
            allowNUll:false
        },
        team_phone:{
            type:DataTypes.STRING,
            allowNull:false
        },
        team_email:{
            type:DataTypes.STRING,
            allowNull:false,
            unique :true
        },
        team_address:{
            type:DataTypes.STRING,
            allowNull:false,

        },
        team_designation:{
            type:DataTypes.STRING,
            allowNull:false
        },
        userId:{
            type:DataTypes.INTEGER,
            allowNull:false
        }
    },{
        tableName:"team_members",
        timestamps:true
    }

)
module.exports=teamMembers
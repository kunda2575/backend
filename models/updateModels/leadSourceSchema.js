
const {DataTypes}=require('sequelize')
const {sequelize} = require('../../config/db')

const leadSource = sequelize.define(
    'LeadSource',{
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        leadSource:{
            type:DataTypes.STRING,
            allowNUll:false
        },
       
       
    },
    {
        tableName :'lead_sources',
        timestamps :true
    }
)
module.exports=leadSource;
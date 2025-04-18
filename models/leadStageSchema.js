const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LeadStage = sequelize.define(
    'LeadStage',  // Model name (Sequelize will handle it internally)
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        leadStage: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId:{
            type:DataTypes.INTEGER,
            allowNull:false
        }
    },
    {
        tableName: 'lead_stages',  // ✅ Explicitly set the table name
        timestamps: true        
    }
);

module.exports = LeadStage;

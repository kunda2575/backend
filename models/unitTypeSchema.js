

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const unitType = sequelize.define(
    'unit_type',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        unit: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId:{
            type:DataTypes.INTEGER,
            allowNull:false
        }
    },
    {
        tableName: 'unit_type_masters',
        timestamps: true
    }
);

module.exports = unitType;

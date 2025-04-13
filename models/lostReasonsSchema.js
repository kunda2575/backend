const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LostReasons = sequelize.define(
    'LostReasons',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        lostReason: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        tableName: 'lost_reasons',
        timestamps: true
    }
);

module.exports = LostReasons;

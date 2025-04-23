

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const paymentModeMaster = sequelize.define(
    'paymentMode_master',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        paymentMode: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId:{
            type:DataTypes.INTEGER,
            allowNull:false
        }
    },
    {
        tableName: 'payment_modes_masters',
        timestamps: true
    }
);

module.exports = paymentModeMaster;

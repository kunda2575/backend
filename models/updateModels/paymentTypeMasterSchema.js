

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const paymentTypeMaster = sequelize.define(
    'paymentType_master',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        paymentType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId:{
            type:DataTypes.INTEGER,
            allowNull:false
        }
    },
    {
        tableName: 'payment_type_masters',
        timestamps: true
    }
);

module.exports = paymentTypeMaster;

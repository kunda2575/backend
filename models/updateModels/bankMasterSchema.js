const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const BankMaster = sequelize.define(
    'BankMaster',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        bankName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ifscCode: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        branch: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId:{
            type:DataTypes.INTEGER,
            allowNull:false
        }
    },
    {
        tableName: 'bank_master',
        timestamps: true
    }
);

module.exports = BankMaster;

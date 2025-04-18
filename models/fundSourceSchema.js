const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const FundSource = sequelize.define(
    'FundSource',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        fundSource: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId:{
            type:DataTypes.INTEGER,
            allowNull:false
        }
    },
    {
        tableName: 'fund_source',
        timestamps: true
    }
);

module.exports = FundSource;

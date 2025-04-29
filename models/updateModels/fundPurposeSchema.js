const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const FundPurpose = sequelize.define(
    'FundPurpose',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        fundPurpose: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId:{
            type:DataTypes.INTEGER,
            allowNull:false
        }
    },
    {
        tableName: 'fund_purpose',
        timestamps: true
    }
);

module.exports = FundPurpose;

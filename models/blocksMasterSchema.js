const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const blocksMaster = sequelize.define(
    'Blocks_master',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        blockNO: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        blockName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId:{
            type:DataTypes.INTEGER,
            allowNull:true
        }
    },
    {
        tableName: 'blocks_masters',
        timestamps: true
    }
);

module.exports = blocksMaster;

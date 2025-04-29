const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const rolesMaster = sequelize.define(
    'roles_master',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        rolesName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId:{
            type:DataTypes.INTEGER,
            allowNull:false
        }
    },
    {
        tableName: 'roles_masters',
        timestamps: true
    }
);

module.exports = rolesMaster;

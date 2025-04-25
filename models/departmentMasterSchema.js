const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DepartmentMaster = sequelize.define(
    'DepartmentMaster',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        departmentID: {
            type: DataTypes.STRING,
            allowNull :false,
            unique: true
        },
        departmentName: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        userId:{
            type:DataTypes.INTEGER,
            allowNull:false
        }
    },
    {
        tableName: 'department_master',
        timestamps: true // Automatically adds createdAt and updatedAt fields
    }
);

module.exports = DepartmentMaster;

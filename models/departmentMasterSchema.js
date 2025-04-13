const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DepartmentMaster = sequelize.define(
    'DepartmentMaster',
    {
        
        departmentID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        departmentName: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    },
    {
        tableName: 'department_master',
        timestamps: true // Automatically adds createdAt and updatedAt fields
    }
);

module.exports = DepartmentMaster;

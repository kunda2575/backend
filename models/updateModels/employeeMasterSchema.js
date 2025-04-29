const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const EmployeeMaster = sequelize.define(
    'EmployeeMaster',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        employeeID: {
            type: DataTypes.STRING,
            allowNull :false,
            unique: true
        },
        employeeName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        employeePhone: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        employeeEmail: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        idType: {
            type: DataTypes.STRING,
            allowNull: true
        },
        idProof1: {
            type: DataTypes.STRING,
            allowNull: true
        },
        employeeSalary: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        department: {
            type: DataTypes.STRING,
            allowNull: true
        },
        userId:{
            type:DataTypes.INTEGER,
            allowNull:false
        }
    },
    {
        tableName: 'employee_masters',
        timestamps: true // Automatically adds createdAt and updatedAt
    }
);

module.exports = EmployeeMaster;

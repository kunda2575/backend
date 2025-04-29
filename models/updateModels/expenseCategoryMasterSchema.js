const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const ExpenseCategoryMaster = sequelize.define(
    'ExpenseCategoryMaster',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        expenseCategory: {
            type: DataTypes.STRING,
            allowNull: false
        },
        expenseHead: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId:{
            type:DataTypes.INTEGER,
            allowNull:false
        }
    },
    {
        tableName: 'expense_category_master',
        timestamps: true // Adds createdAt and updatedAt fields
    }
);

module.exports = ExpenseCategoryMaster;

const { sequelize } = require('../../config/db');
const { DataTypes } = require('sequelize');

// Define the Material model
const MaterialIssue = sequelize.define(
    'MaterialIssue',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        material_name: {
            type: DataTypes.STRING,
            allowNull: false,  // This field cannot be NULL
        },
        unit_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        quantity_issued: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        issued_by: {
            type: DataTypes.STRING,
            allowNull: false
        },
        issued_to: {
            type: DataTypes.STRING,
            allowNull: false
        },
        issue_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
       
    },
    {
        tableName: 'material_issue',  // Specify the table name
        timestamps: true,  // We don't need createdAt or updatedAt for this model
    }
);

module.exports = MaterialIssue;

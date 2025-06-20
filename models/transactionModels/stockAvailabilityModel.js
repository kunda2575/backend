const { sequelize } = require('../../config/db');
const { DataTypes } = require('sequelize');

// Define the Material model
const Material = sequelize.define(
    'Material',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        material_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        material_name: {
            type: DataTypes.STRING,
            allowNull: false,  // This field cannot be NULL
        },
        unit_type: {
            type: DataTypes.STRING,
            allowNull: false,  // This field cannot be NULL
        },
        available_stock: {
            type: DataTypes.STRING,
            defaultValue: 0,  // Default value is 0
        },
       
    },
    {
        tableName: 'materials',  // Specify the table name
        timestamps: true,  // We need createdAt or updatedAt for this model
    }
);

module.exports = Material;

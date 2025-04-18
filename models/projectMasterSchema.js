const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ProjectMaster = sequelize.define(
    'ProjectMaster',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        projectName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        projectOwner: {
            type: DataTypes.STRING,
            allowNull: false
        },
        projectContact: {
            type: DataTypes.STRING,
            allowNull: false
        },
        projectAddress: {
            type: DataTypes.STRING,
            allowNull: false
        },
        projectBrouchers: {
            type: DataTypes.STRING,
            allowNull: false
        },
        projectStartDate: {
            type: DataTypes.DATE,  
            allowNull: false
        },
        projectEndDate: {
            type: DataTypes.DATE,  
            allowNull: false
        },
        userId:{
            type:DataTypes.INTEGER,
            allowNull:false
        }
    },
    {
        tableName: 'project_masters',
        timestamps: true
    }
);

module.exports = ProjectMaster;

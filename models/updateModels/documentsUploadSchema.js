const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const documentsMaster = sequelize.define(
    'DocumentsMaster',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        documentsUpload: {
            type: DataTypes.STRING,
            allowNull: false
        },
       
        userId:{
            type:DataTypes.INTEGER,
            allowNull:false
        }
    },
    {
        tableName: 'documents_master',
        timestamps: true
    }
);

module.exports = documentsMaster;

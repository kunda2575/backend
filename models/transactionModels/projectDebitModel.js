const { sequelize } = require('../../config/db');
const { DataTypes } = require('sequelize');

const ProjectDebit = sequelize.define('ProjectDebit', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    payed_to: {
        type: DataTypes.STRING,
        allowNull: false
    },
    vendor_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount_inr: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    invoice_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    payment_mode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    payment_bank: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'project_debits',
    timestamps: true
});

module.exports = ProjectDebit;

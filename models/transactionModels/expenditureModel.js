const { sequelize } = require('../../config/db');
const { DataTypes } = require('sequelize');

const Expenditure = sequelize.define('Expenditure', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    vendor_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expense_head: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount_inr: {
        type: DataTypes.DECIMAL(10,2),
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
    payment_reference: {
        type: DataTypes.STRING
    },
    payment_evidence: {
        type: DataTypes.STRING,
        allowNull: true
    },
   
}, {
    tableName: 'expenditure',
    timestamps: true  // Correct option name
});

module.exports = Expenditure;

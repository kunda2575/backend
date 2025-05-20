const { sequelize } = require('../../config/db');
const { DataTypes } = require('sequelize');

const CustomerPayments = sequelize.define('CustomerPayments', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customer_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    customer_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contact_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique:true
    },
    profession: {
        type: DataTypes.STRING,
        allowNull: false
    },
    native_language: {
        type: DataTypes.STRING,
        allowNull: false
    },
    project_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    block_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    flat_no: {
        type: DataTypes.STRING,
        allowNull: false
    },
    agreed_price: {
        type: DataTypes.STRING,
        allowNull: false
    },
    installment_no: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount_received: {
        type: DataTypes.STRING,
        allowNull: false
    },
    payment_mode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    payment_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    verified_by: {
        type: DataTypes.STRING,
        allowNull:false
    },
    funding_bank: {
        type: DataTypes.STRING,
        allowNull: true
    },
    documents: {
        type: DataTypes.STRING,
        allowNull: true
    },
    flat_hand_over_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    flat_area: {
        type: DataTypes.STRING,
        allowNull: true
    },
    no_of_bhk: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false  // Assuming userId should be mandatory for every customer_payments record
    }
}, {
    tableName: 'customer_payments',
    timestamps: true  // Correct option name
});

module.exports = CustomerPayments;

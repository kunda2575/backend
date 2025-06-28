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
        allowNull: false,
        validate: {
            notEmpty: { msg: "Customer ID cannot be empty" }
        }
    },
    customer_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "Customer name cannot be empty" },
            len: { args: [2, 100], msg: "Customer name should be 2 to 100 characters" }
        }
    },
    contact_number: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "Contact number is required" },
            isNumeric: { msg: "Contact number must be numeric" },
            len: { args: [7, 15], msg: "Contact number length should be 7 to 15 digits" }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: { msg: "Email is required" },
            isEmail: { msg: "Must be a valid email address" }
        }
    },
    profession: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "Profession is required" }
        }
    },
    native_language: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "Native language is required" }
        }
    },
    project_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "Project name is required" }
        }
    },
    block_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "Block name is required" }
        }
    },
    flat_no: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "Flat number is required" }
        }
    },
    agreed_price: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "Agreed price is required" },
            isDecimal: { msg: "Agreed price must be a valid number" }
        }
    },
    installment_no: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "Installment number is required" },
            isInt: { msg: "Installment number must be an integer" }
        }
    },
    amount_received: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "Amount received is required" },
            isDecimal: { msg: "Amount received must be a valid number" }
        }
    },
    payment_mode: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "Payment mode is required" }
        }
    },
    payment_type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "Payment type is required" }
        }
    },
    verified_by: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "Verified by is required" }
        }
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
        allowNull: true,
        validate: {
            isDate: { msg: "Flat handover date must be a valid date" }
        }
    },
    flat_area: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isDecimal: { msg: "Flat area must be a valid number" }
        }
    },
    no_of_bhk: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isInt: { msg: "No of BHK must be an integer" }
        }
    },
}, {
    tableName: 'customer_payments',
    timestamps: true
});

module.exports = CustomerPayments;

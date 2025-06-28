const { sequelize } = require('../../config/db');
const { DataTypes } = require('sequelize');

const Expenditure = sequelize.define('Expenditure', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Date is required' },
      isDate: { msg: 'Date must be a valid date' },
    },
  },
  vendor_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Vendor name is required' },
      len: {
        args: [2, 100],
        msg: 'Vendor name must be between 2 and 100 characters',
      },
    },
  },
  expense_head: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Expense head is required' },
    },
  },
  amount_inr: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Amount is required' },
      isDecimal: { msg: 'Amount must be a decimal number' },
      min: {
        args: [0.01],
        msg: 'Amount must be greater than 0',
      },
    },
  },
  invoice_number: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Invoice number is required' },
    },
  },
  payment_mode: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Payment mode is required' },
    //   isIn: {
    //     args: [['cash', 'bank_transfer', 'upi', 'cheque']],
    //     msg: 'Payment mode must be one of: cash, bank_transfer, upi, cheque',
    //   },
    },
  },
  payment_bank: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Payment bank is required' },
    },
  },
  payment_reference: {
    type: DataTypes.STRING,
    allowNull: true, // if optional
  },
  payment_evidence: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'expenditure',
  timestamps: true,
});

module.exports = Expenditure;

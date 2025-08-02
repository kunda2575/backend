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
    allowNull: false,
    validate: {
      isDate: { msg: 'Date must be a valid date' },
      notEmpty: { msg: 'Date is required' }
    }
  },
  payed_to: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'payed to name is required' },
      len: {
        args: [2, 100],
        msg: 'payed to name must be between 2 and 100 characters'
      }
    }
  },
  vendor_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Vendor name is required' }
    }
  },
  amount_inr: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: { msg: 'Amount must be a valid decimal number' },
      min: {
        args: [0.01],
        msg: 'Amount must be greater than zero'
      }
    }
  },
  invoice_number: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Invoice number is required' },
      len: {
        args: [1, 50],
        msg: 'Invoice number must be between 1 and 50 characters'
      }
    }
  },
  payment_mode: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Payment mode is required' }
    }
  },
  payment_bank: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Payment bank is required' }
    }
  },
   projectId:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
}, {
  tableName: 'project_debits',
  timestamps: true
});

module.exports = ProjectDebit;

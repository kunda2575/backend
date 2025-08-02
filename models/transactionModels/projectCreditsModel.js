const { sequelize } = require('../../config/db');
const { DataTypes } = require('sequelize');

const ProjectCredits = sequelize.define('ProjectCredits', {
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
  source: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Source is required' },
      len: {
        args: [2, 100],
        msg: 'Source must be between 2 and 100 characters'
      }
    }
  },
  amount_inr: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Amount (INR) is required' },
      is: {
        args: /^[0-9]+(\.[0-9]{1,2})?$/,
        msg: 'Amount must be a valid number (e.g. 1000.00)'
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
  purpose: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Purpose is required' }
    }
  },
  deposit_bank: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Deposit bank is required' }
    }
  },
   projectId:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
}, {
  tableName: 'project_credits',
  timestamps: true
});

module.exports = ProjectCredits;

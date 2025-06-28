const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const CustomerMaster = sequelize.define(
  'customer_master',
  {
    customerId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Customer name is required' },
        len: {
          args: [2, 100],
          msg: 'Customer name must be between 2 and 100 characters'
        }
      }
    },
    customerPhone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Phone number is required' },
        isNumeric: { msg: 'Phone number must contain only digits' },
        len: {
          args: [10, 15],
          msg: 'Phone number must be between 10 and 15 digits'
        }
      }
    },
    customerEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Email already exists'
      },
      validate: {
        notEmpty: { msg: 'Email is required' },
        isEmail: { msg: 'Invalid email address' }
      }
    },
    customerAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Address is required' }
      }
    },
    customerProfession: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Profession is required' }
      }
    },
    languagesKnown: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Languages known is required' }
      }
    },
    projectNameBlock: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Project/Block name is required' }
      }
    },
    flatNo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Flat number is required' }
      }
    },
    documents: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Documents are required' }
      }
    }
  },
  {
    tableName: 'customer_masters',
    timestamps: true
  }
);

module.exports = CustomerMaster;

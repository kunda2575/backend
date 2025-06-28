const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const vendorMaster = sequelize.define(
  'vendor_master',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    vendorId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Vendor ID must be unique'
      },
      validate: {
        notEmpty: { msg: 'Vendor ID is required' },
        len: {
          args: [3, 50],
          msg: 'Vendor ID must be between 3 and 50 characters'
        }
      }
    },

    vendorName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Vendor name is required' }
      }
    },

    services: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Services field is required' }
      }
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Phone number is required' },
        isNumeric: { msg: 'Phone number must contain only numbers' },
        len: {
          args: [10, 15],
          msg: 'Phone number must be between 10 and 15 digits'
        }
      }
    },

    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Address is required' }
      }
    },

    city: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'City is required' }
      }
    }
  },
  {
    tableName: 'vendor_master',
    timestamps: true // ✅ Fixed typo here
  }
);

module.exports = vendorMaster;

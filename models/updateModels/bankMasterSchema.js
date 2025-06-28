const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const BankMaster = sequelize.define(
  'BankMaster',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Bank name is required' },
        len: {
          args: [2, 100],
          msg: 'Bank name must be between 2 and 100 characters'
        }
      }
    },
    ifscCode: {
      type: DataTypes.STRING,
      allowNull: false,
     
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Branch name is required' }
      }
    }
  },
  {
    tableName: 'bank_master',
    timestamps: true
  }
);

module.exports = BankMaster;

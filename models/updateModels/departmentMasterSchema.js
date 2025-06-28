const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const DepartmentMaster = sequelize.define(
  'DepartmentMaster',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    departmentMaster: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Department name is required' },
        len: {
          args: [2, 100],
          msg: 'Department name must be between 2 and 100 characters'
        }
      }
    },
    departmentID: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Department ID must be unique'
      },
      validate: {
        notEmpty: { msg: 'Department ID is required' },
        len: {
          args: [2, 50],
          msg: 'Department ID must be between 2 and 50 characters'
        }
      }
    }
  },
  {
    tableName: 'department_master',
    timestamps: true
  }
);

module.exports = DepartmentMaster;

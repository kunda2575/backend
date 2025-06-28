const { sequelize } = require('../../config/db');
const { DataTypes } = require('sequelize');

const MaterialIssue = sequelize.define(
  'MaterialIssue',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    material_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Material name is required' },
        len: {
          args: [2, 100],
          msg: 'Material name must be between 2 and 100 characters',
        },
      },
    },
    unit_type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Unit type is required' },
      },
    },
    quantity_issued: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: 'Quantity issued must be an integer' },
        min: {
          args: [1],
          msg: 'Quantity issued must be at least 1',
        },
      },
    },
    issued_by: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Issued by is required' },
      },
    },
    issued_to: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Issued to is required' },
      },
    },
    issue_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: { msg: 'Issue date must be a valid date' },
        notEmpty: { msg: 'Issue date is required' },
      },
    },
  },
  {
    tableName: 'material_issue',
    timestamps: true, // createdAt and updatedAt
  }
);

module.exports = MaterialIssue;

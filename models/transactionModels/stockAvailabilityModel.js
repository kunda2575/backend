const { sequelize } = require('../../config/db');
const { DataTypes } = require('sequelize');

const Material = sequelize.define(
  'Material',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    material_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Material ID is required' },
        len: {
          args: [2, 50],
          msg: 'Material ID must be between 2 and 50 characters'
        }
      }
    },
    material_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Material name is required' },
        len: {
          args: [2, 100],
          msg: 'Material name must be between 2 and 100 characters'
        }
      }
    },
    unit_type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Unit type is required' }
      }
    },
    available_stock: {
      type: DataTypes.STRING,
      defaultValue: '0',
      validate: {
        isNumeric: { msg: 'Available stock must be a number' }
      }
    }
  },
  {
    tableName: 'materials',
    timestamps: true
  }
);

module.exports = Material;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const MaterialMaster = sequelize.define(
  'MaterialMaster',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    material_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Material ID must be unique'
      },
      validate: {
        notEmpty: { msg: 'Material ID is required' },
        len: {
          args: [2, 50],
          msg: 'Material ID must be between 2 and 50 characters'
        }
      }
    },
    materialName: {
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
     projectId: {
            type: DataTypes.INTEGER,
            allowNull: false,

        },
  },
  {
    tableName: 'material_masters',
    timestamps: true
  }
);

module.exports = MaterialMaster;

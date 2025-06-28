const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const teamMembers = sequelize.define(
  'team_members',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    team_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Team member name is required' },
        len: {
          args: [3, 100],
          msg: 'Team name must be between 3 and 100 characters'
        }
      }
    },

    team_phone: {
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

    team_email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Email must be unique'
      },
      validate: {
        notEmpty: { msg: 'Email is required' },
        isEmail: { msg: 'Must be a valid email address' }
      }
    },

    team_address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Address is required' },
        len: {
          args: [10, 255],
          msg: 'Address must be at least 10 characters'
        }
      }
    },

    team_designation: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Designation is required' }
      }
    }
  },
  {
    tableName: 'team_members',
    timestamps: true
  }
);

module.exports = teamMembers;

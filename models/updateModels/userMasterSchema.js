const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const userMaster = sequelize.define(
  'userMaster',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Username is required' },
        len: {
          args: [3, 50],
          msg: 'Username must be between 3 and 50 characters'
        }
      }
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password is required' },
        len: {
          args: [6, 100],
          msg: 'Password must be at least 6 characters'
        }
      }
    },

    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Role is required' }
      }
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Phone number is required' },
        isNumeric: { msg: 'Phone must contain only numbers' },
        len: {
          args: [10, 15],
          msg: 'Phone number must be between 10 and 15 digits'
        }
      }
    },

    email: {
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
    projectName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "Project name is required" }
        }
    },
    // projectId:{
    //   type:DataTypes.INTEGER,
    //   allowNull:false
    // }
  },
  {
    tableName: 'user_masters',
    timestamps: true
  }
);

module.exports = userMaster;

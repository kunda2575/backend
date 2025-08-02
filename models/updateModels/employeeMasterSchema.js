const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const EmployeeMaster = sequelize.define(
  'EmployeeMaster',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    employeeID: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Employee ID must be unique'
      },
      validate: {
        notEmpty: { msg: 'Employee ID is required' },
        len: {
          args: [3, 50],
          msg: 'Employee ID must be between 3 and 50 characters'
        }
      }
    },
    employeeName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Employee name is required' },
        len: {
          args: [2, 100],
          msg: 'Employee name must be between 2 and 100 characters'
        }
      }
    },
    employeePhone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Phone number must be unique'
      },
      validate: {
        notEmpty: { msg: 'Phone number is required' },
        is: {
          args: /^[0-9]{10}$/,
          msg: 'Phone number must be 10 digits'
        }
      }
    },
    employeeEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Email must be unique'
      },
      validate: {
        notEmpty: { msg: 'Email is required' },
        isEmail: { msg: 'Invalid email format' }
      }
    },
   
    idType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    idProof1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    employeeSalary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        isDecimal: { msg: 'Salary must be a number' },
        min: {
          args: [0],
          msg: 'Salary cannot be negative'
        }
      }
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true
    },
    emp_address: {
      type: DataTypes.STRING,
      allowNull: true
    },
     projectId: {
            type: DataTypes.INTEGER,
            allowNull: false,

        },
  },
  {
    tableName: 'employee_masters',
    timestamps: true
  }
);

module.exports = EmployeeMaster;

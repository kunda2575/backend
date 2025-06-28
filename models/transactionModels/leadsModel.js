const { sequelize } = require('../../config/db');
const { DataTypes } = require("sequelize");

const Leads = sequelize.define(
  'Leads',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    contact_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Contact name is required' },
      },
    },

    contact_phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Phone number is required' },
        len: {
          args: [10, 15],
          msg: 'Phone number must be between 10 to 15 digits',
        },
      },
    },

    contact_email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Email already exists',
      },
      validate: {
        notEmpty: { msg: 'Email is required' },
        isEmail: { msg: 'Invalid email format' },
      },
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Address is required' },
      },
    },

    customer_profession: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Profession is required' },
      },
    },

    native_language: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Native language is required' },
      },
    },

    lead_source: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Lead source is required' },
      },
    },

    lead_stage: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Lead stage is required' },
      },
    },

    value_in_inr: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Value in INR is required' },
      },
    },

    creation_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'Creation date must be a valid date' },
        notEmpty: { msg: 'Creation date is required' },
      },
    },

    expected_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'Expected date must be a valid date' },
        notEmpty: { msg: 'Expected date is required' },
      },
    },

    team_member: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Team member is required' },
      },
    },

    last_interacted_on: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'Last interacted date must be a valid date' },
        notEmpty: { msg: 'Last interacted date is required' },
      },
    },

    next_interacted_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'Next interacted date must be a valid date' },
        notEmpty: { msg: 'Next interacted date is required' },
      },
    },

    remarks: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Remarks are required' },
      },
    },

    reason_for_lost_customers: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Reason for lost customers is required' },
      },
    },
  },
  {
    tableName: 'lead_transaction',
    timestamps: true,
  }
);

module.exports = Leads;

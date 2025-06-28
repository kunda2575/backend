const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const ProjectMaster = sequelize.define(
  'ProjectMaster',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    projectName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Project name is required' },
        len: {
          args: [3, 100],
          msg: 'Project name must be between 3 and 100 characters'
        }
      }
    },

    projectOwner: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Project owner is required' },
        len: {
          args: [3, 100],
          msg: 'Project owner name must be between 3 and 100 characters'
        }
      }
    },

    projectContact: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Project contact is required' },
        isNumeric: { msg: 'Project contact must contain only numbers' },
        len: {
          args: [10, 15],
          msg: 'Project contact must be between 10 and 15 digits'
        }
      }
    },

    projectAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Project address is required' },
        len: {
          args: [10, 255],
          msg: 'Project address must be at least 10 characters'
        }
      }
    },

    projectBrouchers: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Project brochure file path is required' }
      }
    },

    projectStartDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'Project start date must be a valid date' },
        notEmpty: { msg: 'Project start date is required' }
      }
    },

    projectEndDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'Project end date must be a valid date' },
        notEmpty: { msg: 'Project end date is required' },
        isAfterStartDate(value) {
          if (this.projectStartDate && value < this.projectStartDate) {
            throw new Error('End date must be after start date');
          }
        }
      }
    }
  },
  {
    tableName: 'project_masters',
    timestamps: true
  }
);

module.exports = ProjectMaster;

const { sequelize } = require('../../config/db'); // ✅ Correct destructure
const { DataTypes } = require('sequelize');

const ProjectCredits = sequelize.define('ProjectCredits', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  source: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount_inr: {
    type: DataTypes.STRING,
    allowNull: false
  },
  payment_mode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  purpose: {
    type: DataTypes.STRING,
    allowNull: false
  },
  deposit_bank: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
}, {
  tableName: 'project_credits',
  timestamps: true
});

module.exports = ProjectCredits;

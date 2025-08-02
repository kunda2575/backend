const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

const ProjectMaster = sequelize.define("ProjectMaster", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
 projectName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true  // ✅ FIXED: added key and value
  },
  projectOwner: { type: DataTypes.STRING, allowNull: false },
  projectContact: { type: DataTypes.STRING, allowNull: false },
  projectAddress: { type: DataTypes.STRING, allowNull: false },
  projectBrouchers: { type: DataTypes.TEXT, allowNull: false },
  expectedStartDate: { type: DataTypes.DATE, allowNull: false },
  expectedEndDate: { type: DataTypes.DATE, allowNull: false },
}, {
  tableName: "project_masters",
  timestamps: true,
});

module.exports = ProjectMaster;

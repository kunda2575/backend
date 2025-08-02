const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../../config/db");

const User = sequelize.define("User", {
  userId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  fullname: { type: DataTypes.STRING, allowNull: false },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  mobilenumber: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  profile: { type: DataTypes.STRING, defaultValue: "default.jpg" },
  // project_id: { type: DataTypes.INTEGER,},
  password: { type: DataTypes.STRING, allowNull: false },
  resetPasswordToken: { type: DataTypes.STRING },
  resetPasswordExpires: { type: DataTypes.DATE },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.NOW },
  updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.NOW },
}, {
  // defaultScope: {
  //   attributes: { exclude: ['password'] },
  // },
  // scopes: {
  //   withPassword: { attributes: {} },
  // },
  tableName: "users",
  timestamps: true,
});

module.exports = User;

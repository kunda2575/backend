const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const OTP = sequelize.define(
  "OTP",
  {
    email: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiry: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "otps",
    timestamps: false,
  }
);

module.exports = OTP;

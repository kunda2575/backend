const { Sequelize } = require("sequelize");
require("dotenv").config();

const DB_URL = process.env.DB_URL;
console.log("🔍 DB_URL:", DB_URL);

console.log("⏳ Connecting...");

const sequelize = new Sequelize(DB_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: console.log, // show SQL queries
  pool: {
    max: 5,
    min: 0,
    acquire: 10000,
    idle: 10000,
  },
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connection has been established successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);
  } finally {
    await sequelize.close();
    console.log("🔒 Connection closed.");
  }
})();

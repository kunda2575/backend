const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

// console.log("🔹 DB Config:", {
//   DB_NAME: process.env.DB_NAME,
//   DB_USER: process.env.DB_USER,
//   DB_HOST: process.env.DB_HOST,
// });

const sequelize = new Sequelize(
  // process.env.DB_NAME,
  // process.env.DB_USER,
  // process.env.DB_PASS,

  process.env.DB_URL,
  {
    // host: process.env.DB_HOST,
    dialect: "postgres",

dialectOptions:{
  ssl:{
    require:true,
    rejectUnauthorized:false
  }
},

    logging: console.log, // ✅ Enables SQL query logging
    pool: {
      max: 10,
      min: 0, // ✅ Set min to 0 to allow idle connections to close
      acquire: 100000, // increased timeout
      idle: 10000,
    },
  }
);



const sqlDb = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to PostgreSQL");

    // ✅ Sync all models AFTER they are imported
    await sequelize.sync({ alter: true }); // this updates the table structure
    // console.log("✅ Tables are updated!");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
};

module.exports = { sqlDb, sequelize };

const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const mongo_url = process.env.MONGO_URL;

const connectDB = async () => {
    try {
        await mongoose.connect(mongo_url);
        console.log("Database Connected Successfully");
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;

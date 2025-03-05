const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const mongo_url = process.env.MONGO_URL;

const localDb = async () => {
    try {
        await mongoose.connect(mongo_url);
        console.log("Database Connected Successfully");
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const serverDb = () => {
    try {
        let username1 = encodeURIComponent("konetipraveen");
        let password = encodeURIComponent(process.env.password);
        let dbName = process.env.dbName;
        console.log("username  = ",username1)
        let url =`mongodb+srv://${username1}:${password}@cluster0.nnowk.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`
        console.log(url)
        mongoose.connect(url)
            .then(() => console.log("Mongodb Database is Connected"))
            .catch(error => console.error("Error in Database Connection", error));

        const db = mongoose.connection;

        // Optionally, you can listen for errors
        db.on("error", (error) => console.error("Database Error", error));
    } catch (error) {

    }
}
module.exports = { localDb,serverDb };

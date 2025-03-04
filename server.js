const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotEnv = require("dotenv");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const connectDB = require("./config/db");
const userRoutes = require("./routes/signUpRoutes");

dotEnv.config();
connectDB();

const app = express();
const port = process.env.port || 5000; // Default to 5000 if not set in .env

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Swagger Options
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Real Estate API",
            version: "1.0.0",
            description: "API documentation for Real Estate application",
        },
        servers: [
            {
                url: `http://localhost:${port}`,
            },
        ],
    },
    apis: ["./routes/*.js"], // Ensure your route files have Swagger comments
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use("/user", userRoutes);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
});

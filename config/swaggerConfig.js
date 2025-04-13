const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MERN Authentication API",
      version: "1.0.0",
      description: "API documentation for authentication system",
    },
    servers: [
      {
        url: "http://localhost:2026",
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to route files
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };

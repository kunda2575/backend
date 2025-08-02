const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const secretKey = process.env.JWT_SECRET;

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Token is required for authentication" });
    }

    try {
        // Verify and decode the token
        const decoded = jwt.verify(token, secretKey);

        // Log the decoded userId (for debugging)
        console.log("Decoded JWT payload:", decoded);

        // Attach userId to request object
        req.userId = decoded.userId;
        



        // Proceed to the next middleware/route handler
        next();
    } catch (error) {
        console.error("Token verification error:", error);

        // Handle expired or invalid token
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token has expired" });
        }

        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

module.exports = verifyToken;

const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const authMiddleware = async (req, res, next) => {
    try {

        // CHECK AUTHORIZATION HEADER
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization header missing"
            });
        }

        // CHECK BEARER FORMAT
        const parts = authHeader.split(" ");

        if (
            parts.length !== 2 ||
            parts[0] !== "Bearer"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format"
            });
        }

        const token = parts[1];

        // CHECK JWT SECRET
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: "JWT secret is missing"
            });
        }

        // VERIFY TOKEN
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // FIND CURRENT USER FROM DATABASE
        const user = await User.findById(
            decoded.id
        ).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User account not found"
            });
        }

        // BLOCKED ACCOUNT
        if (user.status === "blocked") {
            return res.status(403).json({
                success: false,
                message:
                    "Your account is blocked. Please contact the administrator."
            });
        }

        // CLOSED ACCOUNT
        if (user.status === "closed") {
            return res.status(403).json({
                success: false,
                message:
                    "Your account is closed. Please contact the administrator."
            });
        }

        // SET CURRENT USER
        req.user = {
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name,
            accountNumber: user.accountNumber,
            status: user.status
        };

        next();

    } catch (error) {

        console.log(
            "Auth Middleware Error:",
            error.message
        );

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired. Please login again."
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token. Please login again."
            });
        }

        return res.status(401).json({
            success: false,
            message: "Authentication failed"
        });
    }
};

module.exports = authMiddleware;
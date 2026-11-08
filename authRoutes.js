const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../Models/User");

const router = express.Router();

// ==========================================
// REGISTER
// ==========================================

router.post("/register", async (req, res) => {
    try {

        const {
            name,
            email,
            phone,
            password
        } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const cleanEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({
            email: cleanEmail
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const accountNumber =
            "BANK" +
            Math.floor(
                10000000 +
                Math.random() * 90000000
            );

        const user = new User({
            name: name.trim(),
            email: cleanEmail,
            phone: phone.trim(),
            password: hashedPassword,
            balance: 0,
            accountNumber,
            role: "user",
            status: "active"
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                accountNumber: user.accountNumber,
                balance: user.balance,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {

        console.log(
            "Register Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// ==========================================
// USER LOGIN
// ==========================================

router.post("/login", async (req, res) => {
    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required"
            });
        }

        const user = await User.findOne({
            email:
                email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password"
            });
        }

        // ==========================================
        // CHECK ACCOUNT STATUS
        // ==========================================

        if (user.role === "user") {

            if (user.status === "blocked") {
                return res.status(403).json({
                    success: false,
                    message:
                        "Your account has been blocked. Please contact the bank administrator."
                });
            }

            if (user.status === "closed") {
                return res.status(403).json({
                    success: false,
                    message:
                        "Your account has been closed. Please contact the bank administrator."
                });
            }
        }

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                accountNumber: user.accountNumber,
                balance: user.balance,
                role: user.role,
                status: user.status || "active"
            }
        });

    } catch (error) {

        console.log(
            "Login Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// ==========================================
// ADMIN LOGIN
// ==========================================

router.post("/admin-login", async (req, res) => {
    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Admin email and password are required"
            });
        }

        const user = await User.findOne({
            email:
                email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid admin credentials"
            });
        }

        if (user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message:
                    "Admin access denied"
            });
        }

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid admin credentials"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: "admin"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            success: true,
            message:
                "Admin login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                accountNumber: user.accountNumber,
                balance: user.balance,
                role: "admin",
                status: user.status || "active"
            }
        });

    } catch (error) {

        console.log(
            "Admin Login Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Admin login failed"
        });
    }
});

// ==========================================
// TEST ROUTE
// ==========================================

router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Auth route working"
    });
});

// ==========================================
// EXPORT
// ==========================================

module.exports = router;
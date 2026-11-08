const dns = require("dns");

// ==========================================
// DNS FIX FOR MONGODB ATLAS
// ==========================================

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);

require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./Models/User");

// ==========================================
// CREATE ADMIN
// ==========================================

const createAdmin = async () => {

    try {

        // ==========================================
        // CHECK ENV
        // ==========================================

        if (
            !process.env.MONGODB_URI ||
            !process.env.ADMIN_EMAIL ||
            !process.env.ADMIN_PASSWORD
        ) {
            console.log(
                "❌ MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD are required"
            );

            process.exit(1);
        }

        // ==========================================
        // CONNECT MONGODB
        // ==========================================

        await mongoose.connect(
            process.env.MONGODB_URI,
            {
                serverSelectionTimeoutMS: 10000
            }
        );

        console.log(
            "✅ MongoDB Connected"
        );

        // ==========================================
        // CHECK EXISTING ADMIN
        // ==========================================

        const adminEmail =
            process.env.ADMIN_EMAIL
                .toLowerCase()
                .trim();

        const existingUser =
            await User.findOne({
                email: adminEmail
            });

        // ==========================================
        // EXISTING USER
        // ==========================================

        if (existingUser) {

            if (existingUser.role === "admin") {

                console.log(
                    "⚠️ Admin account already exists"
                );

            } else {

                existingUser.role = "admin";

                await existingUser.save();

                console.log(
                    "✅ Existing user changed to admin"
                );
            }

            await mongoose.connection.close();

            return;
        }

        // ==========================================
        // HASH PASSWORD
        // ==========================================

        const hashedPassword =
            await bcrypt.hash(
                process.env.ADMIN_PASSWORD,
                10
            );

        // ==========================================
        // GENERATE ADMIN ACCOUNT NUMBER
        // ==========================================

        const accountNumber =
            "ADMIN" +
            Math.floor(
                10000000 +
                Math.random() * 90000000
            );

        // ==========================================
        // CREATE ADMIN
        // ==========================================

        const admin = new User({

            name: "Bank Administrator",

            email: adminEmail,

            phone: "0000000000",

            password: hashedPassword,

            balance: 0,

            accountNumber: accountNumber,

            role: "admin"
        });

        await admin.save();

        // ==========================================
        // SUCCESS
        // ==========================================

        console.log(
            "✅ Admin account created successfully"
        );

        console.log(
            "Admin Email:",
            admin.email
        );

        console.log(
            "Admin Account Number:",
            admin.accountNumber
        );

        await mongoose.connection.close();

    } catch (error) {

        console.log(
            "❌ Admin Creation Error:",
            error.message
        );

        await mongoose.connection.close();

        process.exit(1);
    }
};

createAdmin();
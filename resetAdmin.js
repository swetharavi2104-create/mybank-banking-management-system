require("dotenv").config();

const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./Models/User");

// ==========================================
// ADMIN DETAILS
// ==========================================

const ADMIN_EMAIL = "admin@mybank.com";
const NEW_PASSWORD = "admin123";

// ==========================================
// RESET ADMIN PASSWORD
// ==========================================

async function resetAdmin() {
    try {

        // MongoDB Connection
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("✅ MongoDB Connected");

        // Find admin
        const admin = await User.findOne({
            email: ADMIN_EMAIL.toLowerCase().trim()
        });

        if (!admin) {
            console.log("❌ Admin account not found");
            console.log("📧 Email checked:", ADMIN_EMAIL);

            await mongoose.connection.close();
            return;
        }

        // Check role
        if (admin.role !== "admin") {
            console.log("❌ This account is not an admin");
            console.log("Current role:", admin.role);

            await mongoose.connection.close();
            return;
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(
            NEW_PASSWORD,
            10
        );

        // Update password
        admin.password = hashedPassword;
        admin.status = "active";

        await admin.save();

        console.log("----------------------------------");
        console.log("✅ Admin password reset successfully");
        console.log("----------------------------------");
        console.log("📧 Email:", ADMIN_EMAIL);
        console.log("🔑 Password:", NEW_PASSWORD);
        console.log("👤 Role:", admin.role);
        console.log("🟢 Status:", admin.status);
        console.log("----------------------------------");

        // Close MongoDB
        await mongoose.connection.close();

        console.log("✅ MongoDB connection closed");

    } catch (error) {

        console.log("❌ Error:", error.message);

        try {
            await mongoose.connection.close();
        } catch (closeError) {
            console.log("MongoDB close error:", closeError.message);
        }
    }
}

// Run function
resetAdmin();
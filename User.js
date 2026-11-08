const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        // ==========================================
        // USER NAME
        // ==========================================

        name: {
            type: String,
            required: true,
            trim: true
        },

        // ==========================================
        // EMAIL
        // ==========================================

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        // ==========================================
        // PHONE
        // ==========================================

        phone: {
            type: String,
            required: true,
            trim: true
        },

        // ==========================================
        // PASSWORD
        // ==========================================

        password: {
            type: String,
            required: true
        },

        // ==========================================
        // BALANCE
        // ==========================================

        balance: {
            type: Number,
            default: 0,
            min: 0
        },

        // ==========================================
        // ACCOUNT NUMBER
        // ==========================================

        accountNumber: {
            type: String,
            unique: true
        },

        // ==========================================
        // USER ROLE
        // ==========================================

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        // ==========================================
        // ACCOUNT STATUS
        // ==========================================

        status: {
            type: String,
            enum: [
                "active",
                "blocked",
                "closed"
            ],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.models.User ||
    mongoose.model("User", userSchema);
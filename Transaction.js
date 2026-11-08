const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        // ==========================================
        // USER
        // ==========================================

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // ==========================================
        // TRANSACTION ID
        // ==========================================

        transactionId: {
            type: String,
            required: true,
            unique: true
        },

        // ==========================================
        // TRANSACTION TYPE
        // ==========================================

        type: {
            type: String,
            enum: [
                "Deposit",
                "Withdrawal",
                "Transfer"
            ],
            required: true
        },

        // ==========================================
        // AMOUNT
        // ==========================================

        amount: {
            type: Number,
            required: true,
            min: 1
        },

        // ==========================================
        // BALANCE AFTER TRANSACTION
        // ==========================================

        balanceAfter: {
            type: Number,
            required: true
        },

        // ==========================================
        // CREDIT / DEBIT
        // ==========================================

        direction: {
            type: String,
            enum: [
                "Credit",
                "Debit"
            ],
            default: null
        },

        // ==========================================
        // OTHER ACCOUNT
        // ==========================================

        otherAccountNumber: {
            type: String,
            default: ""
        },

        // ==========================================
        // DESCRIPTION
        // ==========================================

        description: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.models.Transaction ||
    mongoose.model("Transaction", transactionSchema);
const mongoose = require("mongoose");
const User = require("../Models/User");
const Transaction = require("../Models/Transaction");
const bcrypt = require("bcryptjs");

// ==========================================
// GENERATE UNIQUE TRANSACTION ID
// ==========================================

const generateTransactionId = () => {
    return (
        "TXN" +
        Date.now() +
        Math.random()
            .toString(36)
            .substring(2, 7)
            .toUpperCase()
    );
};

// ==========================================
// GET MY ACCOUNT
// ==========================================

const getMyAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                accountNumber: user.accountNumber,
                balance: user.balance
            }
        });

    } catch (error) {
        console.log("Account Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// ==========================================
// UPDATE MY PROFILE
// ==========================================

const updateMyProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;

        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: "Name and phone are required"
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.name = name.trim();
        user.phone = phone.trim();

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                accountNumber: user.accountNumber,
                balance: user.balance
            }
        });

    } catch (error) {
        console.log("Update Profile Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to update profile"
        });
    }
};

// ==========================================
// CHECK BALANCE
// ==========================================

const checkBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Balance fetched successfully",
            accountNumber: user.accountNumber,
            balance: user.balance
        });

    } catch (error) {
        console.log("Balance Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to check balance"
        });
    }
};

// ==========================================
// DEPOSIT MONEY
// ==========================================

const depositMoney = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid amount"
            });
        }

        const depositAmount = Number(amount);

        if (!Number.isFinite(depositAmount)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid amount"
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.balance += depositAmount;

        await user.save();

        const transaction = new Transaction({
            user: user._id,

            transactionId: generateTransactionId(),

            type: "Deposit",

            amount: depositAmount,

            balanceAfter: user.balance,

            direction: "Credit",

            otherAccountNumber: "",

            description: "Money deposited"
        });

        await transaction.save();

        res.status(200).json({
            success: true,
            message: "Money deposited successfully",
            balance: user.balance,
            transaction
        });

    } catch (error) {
        console.log("Deposit Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Deposit failed"
        });
    }
};

// ==========================================
// WITHDRAW MONEY
// ==========================================

const withdrawMoney = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid amount"
            });
        }

        const withdrawalAmount = Number(amount);

        if (!Number.isFinite(withdrawalAmount)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid amount"
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.balance < withdrawalAmount) {
            return res.status(400).json({
                success: false,
                message: "Insufficient balance"
            });
        }

        user.balance -= withdrawalAmount;

        await user.save();

        const transaction = new Transaction({
            user: user._id,

            transactionId: generateTransactionId(),

            type: "Withdrawal",

            amount: withdrawalAmount,

            balanceAfter: user.balance,

            direction: "Debit",

            otherAccountNumber: "",

            description: "Money withdrawn"
        });

        await transaction.save();

        res.status(200).json({
            success: true,
            message: "Money withdrawn successfully",
            balance: user.balance,
            transaction
        });

    } catch (error) {
        console.log("Withdrawal Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Withdrawal failed"
        });
    }
};

// ==========================================
// TRANSFER MONEY
// ==========================================

const transferMoney = async (req, res) => {

    const session = await mongoose.startSession();

    try {
        const {
            receiverAccountNumber,
            amount
        } = req.body;

        // ------------------------------------------
        // VALIDATION
        // ------------------------------------------

        if (!receiverAccountNumber || !amount) {
            return res.status(400).json({
                success: false,
                message:
                    "Receiver account number and amount are required"
            });
        }

        const transferAmount = Number(amount);

        if (
            !Number.isFinite(transferAmount) ||
            transferAmount <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid transfer amount"
            });
        }

        const receiverNumber =
            receiverAccountNumber.trim();

        // ------------------------------------------
        // START SESSION
        // ------------------------------------------

        session.startTransaction();

        // ------------------------------------------
        // GET SENDER
        // ------------------------------------------

        const sender = await User.findById(
            req.user.id
        ).session(session);

        if (!sender) {

            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "Sender account not found"
            });
        }

        // ------------------------------------------
        // SELF TRANSFER CHECK
        // ------------------------------------------

        if (
            sender.accountNumber ===
            receiverNumber
        ) {

            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message:
                    "You cannot transfer money to your own account"
            });
        }

        // ------------------------------------------
        // GET RECEIVER
        // ------------------------------------------

        const receiver = await User.findOne({
            accountNumber: receiverNumber
        }).session(session);

        if (!receiver) {

            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "Receiver account not found"
            });
        }

        // ------------------------------------------
        // CHECK BALANCE
        // ------------------------------------------

        if (sender.balance < transferAmount) {

            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "Insufficient balance"
            });
        }

        // ------------------------------------------
        // UPDATE BALANCES
        // ------------------------------------------

        sender.balance -= transferAmount;

        receiver.balance += transferAmount;

        await sender.save({
            session
        });

        await receiver.save({
            session
        });

        // ------------------------------------------
        // CREATE TRANSACTION IDs
        // ------------------------------------------

        const senderTransactionId =
            generateTransactionId();

        const receiverTransactionId =
            generateTransactionId();

        // ------------------------------------------
        // SENDER TRANSACTION
        // ------------------------------------------

        const senderTransaction =
            new Transaction({

                user: sender._id,

                transactionId:
                    senderTransactionId,

                type: "Transfer",

                amount: transferAmount,

                balanceAfter: sender.balance,

                direction: "Debit",

                otherAccountNumber:
                    receiver.accountNumber,

                description:
                    `Money transferred to ${receiver.accountNumber}`
            });

        // ------------------------------------------
        // RECEIVER TRANSACTION
        // ------------------------------------------

        const receiverTransaction =
            new Transaction({

                user: receiver._id,

                transactionId:
                    receiverTransactionId,

                type: "Transfer",

                amount: transferAmount,

                balanceAfter: receiver.balance,

                direction: "Credit",

                otherAccountNumber:
                    sender.accountNumber,

                description:
                    `Money received from ${sender.accountNumber}`
            });

        await senderTransaction.save({
            session
        });

        await receiverTransaction.save({
            session
        });

        // ------------------------------------------
        // COMMIT
        // ------------------------------------------

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message:
                "Money transferred successfully",

            transfer: {
                transactionId:
                    senderTransactionId,

                amount:
                    transferAmount,

                from:
                    sender.accountNumber,

                to:
                    receiver.accountNumber,

                balance:
                    sender.balance
            }
        });

    } catch (error) {

        try {
            await session.abortTransaction();
        } catch (abortError) {
            console.log(
                "Abort Transaction Error:",
                abortError.message
            );
        }

        console.log(
            "Transfer Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Money transfer failed"
        });

    } finally {

        await session.endSession();
    }
};

// ==========================================
// GET TRANSACTION HISTORY
// ==========================================

const getTransactionHistory = async (req, res) => {
    try {
        const transactions =
            await Transaction.find({
                user: req.user.id
            })
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions
        });

    } catch (error) {
        console.log(
            "Transaction History Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to fetch transaction history"
        });
    }
};

// ==========================================
// CHANGE PASSWORD
// ==========================================

const changePassword = async (req, res) => {
    try {
        const {
            currentPassword,
            newPassword
        } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "Current password and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must be at least 6 characters"
            });
        }

        const user = await User.findById(
            req.user.id
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch =
            await bcrypt.compare(
                currentPassword,
                user.password
            );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message:
                    "Current password is incorrect"
            });
        }

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );

        user.password = hashedPassword;

        await user.save();

        res.status(200).json({
            success: true,
            message:
                "Password changed successfully"
        });

    } catch (error) {
        console.log(
            "Change Password Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to change password"
        });
    }
};

// ==========================================
// FORGOT PASSWORD
// ==========================================

const forgotPassword = async (req, res) => {
    try {
        const {
            email,
            newPassword
        } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must be at least 6 characters"
            });
        }

        const user = await User.findOne({
            email:
                email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "No account found with this email"
            });
        }

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );

        user.password = hashedPassword;

        await user.save();

        res.status(200).json({
            success: true,
            message:
                "Password reset successfully"
        });

    } catch (error) {
        console.log(
            "Forgot Password Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to reset password"
        });
    }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
    getMyAccount,
    updateMyProfile,
    checkBalance,
    depositMoney,
    withdrawMoney,
    transferMoney,
    getTransactionHistory,
    changePassword,
    forgotPassword
};
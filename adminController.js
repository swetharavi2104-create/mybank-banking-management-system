const bcrypt = require("bcryptjs");

const User = require("../Models/User");
const Transaction = require("../Models/Transaction");

// ==========================================
// GET ALL USERS
// ==========================================

const getAllUsers = async (req, res) => {
    try {

        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {

        console.log(
            "Get All Users Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch users"
        });
    }
};


// ==========================================
// GET USER BY ID
// ==========================================

const getUserById = async (req, res) => {
    try {

        const user = await User.findById(
            req.params.id
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {

        console.log(
            "Get User Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch user"
        });
    }
};


// ==========================================
// GET ALL TRANSACTIONS
// ==========================================

const getAllTransactions = async (req, res) => {
    try {

        const transactions =
            await Transaction.find()
                .populate(
                    "user",
                    "name email accountNumber"
                )
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
            "Get All Transactions Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to fetch transactions"
        });
    }
};


// ==========================================
// ADMIN DASHBOARD STATISTICS
// ==========================================

const getDashboardStats = async (req, res) => {
    try {

        // ==========================================
        // TOTAL USERS
        // ==========================================

        const totalUsers =
            await User.countDocuments({
                role: "user"
            });


        // ==========================================
        // TOTAL ADMINS
        // ==========================================

        const totalAdmins =
            await User.countDocuments({
                role: "admin"
            });


        // ==========================================
        // TOTAL BALANCE
        // ==========================================

        const balanceResult =
            await User.aggregate([
                {
                    $match: {
                        role: "user"
                    }
                },
                {
                    $group: {
                        _id: null,

                        totalBalance: {
                            $sum: {
                                $convert: {
                                    input: "$balance",
                                    to: "double",
                                    onError: 0,
                                    onNull: 0
                                }
                            }
                        }
                    }
                }
            ]);


        const totalBalance =
            balanceResult[0]?.totalBalance || 0;


        // ==========================================
        // TOTAL DEPOSITS
        // ==========================================

        const depositStats =
            await Transaction.aggregate([
                {
                    $match: {
                        type: "Deposit"
                    }
                },
                {
                    $group: {
                        _id: null,

                        totalAmount: {
                            $sum: {
                                $convert: {
                                    input: "$amount",
                                    to: "double",
                                    onError: 0,
                                    onNull: 0
                                }
                            }
                        },

                        count: {
                            $sum: 1
                        }
                    }
                }
            ]);


        // ==========================================
        // TOTAL WITHDRAWALS
        // ==========================================

        const withdrawalStats =
            await Transaction.aggregate([
                {
                    $match: {
                        type: "Withdrawal"
                    }
                },
                {
                    $group: {
                        _id: null,

                        totalAmount: {
                            $sum: {
                                $convert: {
                                    input: "$amount",
                                    to: "double",
                                    onError: 0,
                                    onNull: 0
                                }
                            }
                        },

                        count: {
                            $sum: 1
                        }
                    }
                }
            ]);


        // ==========================================
        // TOTAL TRANSFERS
        // ==========================================

        const transferStats =
            await Transaction.aggregate([
                {
                    $match: {
                        type: "Transfer",
                        direction: "Debit"
                    }
                },
                {
                    $group: {
                        _id: null,

                        totalAmount: {
                            $sum: {
                                $convert: {
                                    input: "$amount",
                                    to: "double",
                                    onError: 0,
                                    onNull: 0
                                }
                            }
                        },

                        count: {
                            $sum: 1
                        }
                    }
                }
            ]);


        // ==========================================
        // PREPARE STATISTICS
        // ==========================================

        const deposits = {
            count:
                depositStats[0]?.count || 0,

            totalAmount:
                depositStats[0]?.totalAmount || 0
        };


        const withdrawals = {
            count:
                withdrawalStats[0]?.count || 0,

            totalAmount:
                withdrawalStats[0]?.totalAmount || 0
        };


        const transfers = {
            count:
                transferStats[0]?.count || 0,

            totalAmount:
                transferStats[0]?.totalAmount || 0
        };


        // ==========================================
        // SEND RESPONSE
        // ==========================================

        res.status(200).json({

            success: true,

            stats: {

                totalUsers,

                totalAdmins,

                totalBalance,

                deposits,

                withdrawals,

                transfers

            }

        });

    } catch (error) {

        console.log(
            "Dashboard Stats Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to fetch dashboard statistics"
        });
    }
};


// ==========================================
// BLOCK / UNBLOCK USER
// ==========================================

const toggleUserStatus = async (req, res) => {
    try {

        const user =
            await User.findById(
                req.params.id
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.role === "admin") {
            return res.status(400).json({
                success: false,
                message:
                    "Admin account cannot be blocked"
            });
        }

        if (user.status === "closed") {
            return res.status(400).json({
                success: false,
                message:
                    "Closed account cannot be changed here"
            });
        }

        const currentStatus =
            user.status || "active";

        user.status =
            currentStatus === "active"
                ? "blocked"
                : "active";

        await user.save();

        res.status(200).json({
            success: true,

            message:
                user.status === "blocked"
                    ? "User blocked successfully"
                    : "User unblocked successfully",

            status:
                user.status
        });

    } catch (error) {

        console.log(
            "Toggle User Status Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to update user status"
        });
    }
};


// ==========================================
// ADMIN CREATE USER
// ==========================================

const createUserByAdmin = async (req, res) => {
    try {

        const {
            name,
            email,
            phone,
            password
        } = req.body;

        if (
            !name ||
            !email ||
            !phone ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please fill all fields"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 6 characters"
            });
        }

        const cleanEmail =
            email.toLowerCase().trim();

        const existingUser =
            await User.findOne({
                email: cleanEmail
            });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message:
                    "Email already exists"
            });
        }

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );

        // ==========================================
        // GENERATE UNIQUE ACCOUNT NUMBER
        // ==========================================

        let accountNumber;
        let accountExists = true;

        while (accountExists) {

            accountNumber =
                "BANK" +
                Math.floor(
                    10000000 +
                    Math.random() * 90000000
                );

            const existingAccount =
                await User.findOne({
                    accountNumber
                });

            accountExists =
                !!existingAccount;
        }


        // ==========================================
        // CREATE USER
        // ==========================================

        const user =
            await User.create({

                name:
                    name.trim(),

                email:
                    cleanEmail,

                phone:
                    phone.trim(),

                password:
                    hashedPassword,

                balance:
                    0,

                accountNumber,

                role:
                    "user",

                status:
                    "active"
            });


        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(201).json({

            success: true,

            message:
                "User created successfully",

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                phone:
                    user.phone,

                accountNumber:
                    user.accountNumber,

                balance:
                    user.balance,

                role:
                    user.role,

                status:
                    user.status
            }
        });

    } catch (error) {

        console.log(
            "Create User Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to create user"
        });
    }
};


// ==========================================
// ADMIN UPDATE USER
// ==========================================

const updateUserByAdmin = async (req, res) => {
    try {

        const {
            name,
            email,
            phone
        } = req.body;

        if (
            !name ||
            !email ||
            !phone
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, email and phone are required"
            });
        }

        const user =
            await User.findById(
                req.params.id
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });
        }

        if (user.role === "admin") {
            return res.status(400).json({
                success: false,
                message:
                    "Admin account cannot be edited here"
            });
        }

        if (user.status === "closed") {
            return res.status(400).json({
                success: false,
                message:
                    "Closed account cannot be edited"
            });
        }

        const cleanEmail =
            email.toLowerCase().trim();

        const existingEmail =
            await User.findOne({
                email: cleanEmail,

                _id: {
                    $ne: user._id
                }
            });

        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message:
                    "Email already belongs to another user"
            });
        }

        user.name =
            name.trim();

        user.email =
            cleanEmail;

        user.phone =
            phone.trim();

        await user.save();

        res.status(200).json({

            success: true,

            message:
                "User updated successfully",

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                phone:
                    user.phone,

                accountNumber:
                    user.accountNumber,

                balance:
                    user.balance,

                role:
                    user.role,

                status:
                    user.status || "active"
            }
        });

    } catch (error) {

        console.log(
            "Update User Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to update user"
        });
    }
};


// ==========================================
// CLOSE USER ACCOUNT
// ==========================================

const closeUserAccount = async (req, res) => {
    try {

        const user =
            await User.findById(
                req.params.id
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });
        }

        if (user.role === "admin") {
            return res.status(400).json({
                success: false,
                message:
                    "Admin account cannot be closed"
            });
        }

        if (user.status === "closed") {
            return res.status(400).json({
                success: false,
                message:
                    "Account is already closed"
            });
        }

        user.status =
            "closed";

        await user.save();

        res.status(200).json({
            success: true,

            message:
                "User account closed successfully",

            status:
                user.status
        });

    } catch (error) {

        console.log(
            "Close User Account Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to close user account"
        });
    }
};


// ==========================================
// REOPEN CLOSED USER ACCOUNT
// ==========================================

const reopenUserAccount = async (req, res) => {
    try {

        const user =
            await User.findById(
                req.params.id
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });
        }

        if (user.role === "admin") {
            return res.status(400).json({
                success: false,
                message:
                    "Admin account does not need to be reopened"
            });
        }

        if (user.status !== "closed") {
            return res.status(400).json({
                success: false,
                message:
                    "This account is not closed"
            });
        }

        user.status =
            "active";

        await user.save();

        res.status(200).json({

            success: true,

            message:
                "User account reopened successfully",

            status:
                user.status
        });

    } catch (error) {

        console.log(
            "Reopen User Account Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to reopen user account"
        });
    }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    getAllUsers,

    getUserById,

    getAllTransactions,

    getDashboardStats,

    toggleUserStatus,

    createUserByAdmin,

    updateUserByAdmin,

    closeUserAccount,

    reopenUserAccount
};
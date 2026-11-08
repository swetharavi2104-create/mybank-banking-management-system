const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getAllUsers,
    getUserById,
    getAllTransactions,
    getDashboardStats,
    toggleUserStatus,
    createUserByAdmin,
    updateUserByAdmin,
    closeUserAccount,
    reopenUserAccount
} = require("../Controllers/adminController");

// ==========================================
// ADMIN HOME / TEST
// ==========================================

router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    (req, res) => {
        res.json({
            success: true,
            message: "Admin route working"
        });
    }
);

// ==========================================
// ADMIN DASHBOARD STATISTICS
// ==========================================

router.get(
    "/stats",
    authMiddleware,
    adminMiddleware,
    getDashboardStats
);

// ==========================================
// GET ALL USERS
// ==========================================

router.get(
    "/users",
    authMiddleware,
    adminMiddleware,
    getAllUsers
);

// ==========================================
// GET USER BY ID
// ==========================================

router.get(
    "/users/:id",
    authMiddleware,
    adminMiddleware,
    getUserById
);

// ==========================================
// CREATE USER BY ADMIN
// ==========================================

router.post(
    "/users",
    authMiddleware,
    adminMiddleware,
    createUserByAdmin
);

// ==========================================
// UPDATE USER BY ADMIN
// ==========================================

router.put(
    "/users/:id",
    authMiddleware,
    adminMiddleware,
    updateUserByAdmin
);

// ==========================================
// BLOCK / UNBLOCK USER
// ==========================================

router.put(
    "/users/:id/status",
    authMiddleware,
    adminMiddleware,
    toggleUserStatus
);

// ==========================================
// CLOSE USER ACCOUNT
// ==========================================

router.put(
    "/users/:id/close",
    authMiddleware,
    adminMiddleware,
    closeUserAccount
);

// ==========================================
// REOPEN CLOSED USER ACCOUNT
// ==========================================

router.put(
    "/users/:id/reopen",
    authMiddleware,
    adminMiddleware,
    reopenUserAccount
);

// ==========================================
// GET ALL TRANSACTIONS
// ==========================================

router.get(
    "/transactions",
    authMiddleware,
    adminMiddleware,
    getAllTransactions
);

// ==========================================
// EXPORT
// ==========================================

module.exports = router;
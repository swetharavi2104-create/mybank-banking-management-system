const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getMyAccount,
    updateMyProfile,
    checkBalance,
    depositMoney,
    withdrawMoney,
    transferMoney,
    getTransactionHistory,
    changePassword,
    forgotPassword
} = require("../Controllers/accountController");

// ==========================================
// GET MY ACCOUNT
// ==========================================

router.get(
    "/me",
    authMiddleware,
    getMyAccount
);

// ==========================================
// UPDATE MY PROFILE
// ==========================================

router.put(
    "/update-profile",
    authMiddleware,
    updateMyProfile
);

// ==========================================
// CHECK BALANCE
// ==========================================

router.get(
    "/balance",
    authMiddleware,
    checkBalance
);

// ==========================================
// DEPOSIT MONEY
// ==========================================

router.post(
    "/deposit",
    authMiddleware,
    depositMoney
);

// ==========================================
// WITHDRAW MONEY
// ==========================================

router.post(
    "/withdraw",
    authMiddleware,
    withdrawMoney
);

// ==========================================
// TRANSFER MONEY
// ==========================================

router.post(
    "/transfer",
    authMiddleware,
    transferMoney
);

// ==========================================
// TRANSACTION HISTORY
// ==========================================

router.get(
    "/transactions",
    authMiddleware,
    getTransactionHistory
);

// ==========================================
// CHANGE PASSWORD
// ==========================================

router.put(
    "/change-password",
    authMiddleware,
    changePassword
);

// ==========================================
// FORGOT PASSWORD
// ==========================================

router.put(
    "/forgot-password",
    forgotPassword
);

// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;
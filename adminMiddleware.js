const adminMiddleware = (req, res, next) => {
    try {

        // ==========================================
        // CHECK LOGIN
        // ==========================================

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // ==========================================
        // CHECK ADMIN ROLE
        // ==========================================

        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access denied"
            });
        }

        // ==========================================
        // ALLOW ADMIN
        // ==========================================

        next();

    } catch (error) {

        console.log(
            "Admin Middleware Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Admin authorization failed"
        });
    }
};

module.exports = adminMiddleware;
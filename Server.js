const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");



require("dotenv").config();

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);

const authRoutes = require("./Routes/authRoutes");
const accountRoutes = require("./Routes/accountRoutes");
const adminRoutes = require("./Routes/adminRoutes");

const app = express();


// =========================================
// BASIC MIDDLEWARE
// =========================================

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// =========================================
// API ROUTES
// =========================================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/account",
    accountRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);


// =========================================
// HOME ROUTE
// =========================================

app.get("/", (req, res) => {

    res.status(200).json({
        success: true,
        message:
            "Banking Management System API is Running"
    });

});


// =========================================
// 404 - ROUTE NOT FOUND
// =========================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message:
            `Route not found: ${req.method} ${req.originalUrl}`
    });

});


// =========================================
// GLOBAL ERROR HANDLER
// =========================================

app.use((err, req, res, next) => {

    console.log(
        "❌ Global Server Error:",
        err.message
    );

    res.status(
        err.status || 500
    ).json({
        success: false,
        message:
            err.message ||
            "Internal Server Error"
    });

});


// =========================================
// CHECK MONGODB URI
// =========================================

if (!process.env.MONGODB_URI) {

    console.log(
        "❌ MONGODB_URI is missing in .env"
    );

    process.exit(1);

}


// =========================================
// MONGODB CONNECTION
// =========================================

mongoose
    .connect(
        process.env.MONGODB_URI,
        {
            serverSelectionTimeoutMS: 10000
        }
    )

    .then(() => {

        console.log(
            "✅ MongoDB Connected Successfully"
        );


        // =========================================
        // START SERVER
        // =========================================

        const PORT =
            process.env.PORT || 5000;

        app.listen(
            PORT,
            () => {

                console.log(
                    `✅ Server running on http://localhost:${PORT}`
                );

                console.log(
                    "✅ Auth routes: /api/auth"
                );

                console.log(
                    "✅ Account routes: /api/account"
                );

                console.log(
                    "✅ Admin routes: /api/admin"
                );

            }
        );

    })

    .catch((error) => {

        console.log(
            "❌ MongoDB Connection Error:"
        );

        console.log(
            error.message
        );

    });
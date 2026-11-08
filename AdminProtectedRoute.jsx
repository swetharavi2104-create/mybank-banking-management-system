import { Navigate } from "react-router-dom";

function AdminProtectedRoute({ children }) {

    const token = localStorage.getItem("adminToken");

    // Admin token இல்லையென்றால்
    // Admin Login page-க்கு அனுப்பும்
    if (!token) {
        return (
            <Navigate
                to="/admin-login"
                replace
            />
        );
    }

    try {

        // JWT format:
        // header.payload.signature

        const parts = token.split(".");

        if (parts.length !== 3) {

            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");

            return (
                <Navigate
                    to="/admin-login"
                    replace
                />
            );
        }

        // JWT payload decode
        const payload = JSON.parse(
            atob(
                parts[1]
                    .replace(/-/g, "+")
                    .replace(/_/g, "/")
            )
        );

        // Check admin role
        if (payload.role !== "admin") {

            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");

            return (
                <Navigate
                    to="/admin-login"
                    replace
                />
            );
        }

        // Check token expiry
        if (
            payload.exp &&
            payload.exp * 1000 < Date.now()
        ) {

            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");

            return (
                <Navigate
                    to="/admin-login"
                    replace
                />
            );
        }

    } catch (error) {

        console.log(
            "Admin token validation error:",
            error.message
        );

        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");

        return (
            <Navigate
                to="/admin-login"
                replace
            />
        );
    }

    return children;
}

export default AdminProtectedRoute;
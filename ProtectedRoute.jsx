import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {

    const token = localStorage.getItem("token");

    // Token இல்லையென்றால் login page
    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    try {

        // JWT format:
        // header.payload.signature

        const parts = token.split(".");

        if (parts.length !== 3) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            return (
                <Navigate
                    to="/login"
                    replace
                />
            );
        }

        // Decode payload
        const payload = JSON.parse(
            atob(
                parts[1]
                    .replace(/-/g, "+")
                    .replace(/_/g, "/")
            )
        );

        // Check expiry
        if (
            payload.exp &&
            payload.exp * 1000 < Date.now()
        ) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            return (
                <Navigate
                    to="/login"
                    replace
                />
            );
        }

    } catch (error) {

        console.log(
            "Token validation error:",
            error.message
        );

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return children;
}

export default ProtectedRoute;
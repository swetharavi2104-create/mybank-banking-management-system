import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function AdminLogin() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        const email =
            formData.email.trim().toLowerCase();

        const password =
            formData.password;

        if (!email || !password) {
            setError(
                "Please enter admin email and password."
            );
            return;
        }

        try {

            setLoading(true);

            const response = await axios.post(
                "http://localhost:5000/api/auth/admin-login",
                {
                    email,
                    password
                }
            );

            if (response.data.success) {

                // Clear normal user session
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                // Save admin session
                localStorage.setItem(
                    "adminToken",
                    response.data.token
                );

                localStorage.setItem(
                    "adminUser",
                    JSON.stringify(
                        response.data.user
                    )
                );

                setSuccess(
                    "Admin login successful. Redirecting..."
                );

                setTimeout(() => {
                    navigate("/admin-dashboard");
                }, 500);
            }

        } catch (error) {

            console.log(
                "Admin Login Error:",
                error.response?.data ||
                error.message
            );

            setError(
                error.response?.data?.message ||
                "Admin login failed. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="admin-login-page">

            <div className="admin-login-container">

                {/* HEADER */}

                <div className="admin-login-brand">

                    <div className="admin-login-icon">
                        🔐
                    </div>

                    <h1>
                        MyBank Admin
                    </h1>

                    <p>
                        Secure Administrator Login
                    </p>

                </div>


                {/* LOGIN CARD */}

                <div className="admin-login-card">

                    <h2>
                        Admin Login
                    </h2>

                    <p className="admin-login-subtitle">
                        Login to manage users and banking operations
                    </p>


                    {/* ERROR */}

                    {error && (
                        <div className="admin-login-error">
                            ❌ {error}
                        </div>
                    )}


                    {/* SUCCESS */}

                    {success && (
                        <div className="admin-login-success">
                            ✅ {success}
                        </div>
                    )}


                    <form onSubmit={handleSubmit}>

                        {/* EMAIL */}

                        <div className="admin-form-group">

                            <label htmlFor="admin-email">
                                Admin Email
                            </label>

                            <input
                                id="admin-email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter admin email"
                                autoComplete="username"
                                disabled={loading}
                            />

                        </div>


                        {/* PASSWORD */}

                        <div className="admin-form-group">

                            <label htmlFor="admin-password">
                                Password
                            </label>

                            <input
                                id="admin-password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter admin password"
                                autoComplete="current-password"
                                disabled={loading}
                            />

                        </div>


                        {/* BUTTON */}

                        <button
                            type="submit"
                            className="admin-login-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Logging in..."
                                : "Admin Login"}
                        </button>

                    </form>


                    {/* USER LOGIN */}

                    <div className="admin-back-login">

                        <Link to="/login">
                            ← Back to User Login
                        </Link>

                    </div>

                </div>


                {/* FOOTER */}

                <p className="admin-login-footer">
                    © 2026 MyBank | Administrator Panel
                </p>

            </div>

        </div>
    );
}

export default AdminLogin;
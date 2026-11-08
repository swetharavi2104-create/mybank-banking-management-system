import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {

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

        const email = formData.email.trim().toLowerCase();
        const password = formData.password;

        if (!email || !password) {
            setError("Please enter email and password.");
            return;
        }

        try {

            setLoading(true);

            const response = await axios.post(
                "http://localhost:5000/api/auth/login",
                {
                    email,
                    password
                }
            );

            if (response.data.success) {

                /*
                    Clear old admin session
                    before starting user session
                */
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminUser");

                // Save user token
                localStorage.setItem(
                    "token",
                    response.data.token
                );

                // Save user details
                localStorage.setItem(
                    "user",
                    JSON.stringify(response.data.user)
                );

                setSuccess(
                    "Login successful. Redirecting..."
                );

                setTimeout(() => {
                    navigate("/dashboard");
                }, 500);
            }

        } catch (error) {

            const message =
                error.response?.data?.message ||
                "Login failed. Please try again.";

            setError(message);

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-container">

                {/* LEFT / TOP SECTION */}

                <div className="auth-brand">

                    <div className="bank-icon">
                        🏦
                    </div>

                    <h1>
                        MyBank
                    </h1>

                    <p>
                        Secure Online Banking
                    </p>

                </div>


                {/* LOGIN CARD */}

                <div className="auth-card">

                    <h2>
                        Welcome Back
                    </h2>

                    <p className="auth-subtitle">
                        Login to access your bank account
                    </p>


                    {/* ERROR */}

                    {error && (
                        <div className="auth-error">
                            ❌ {error}
                        </div>
                    )}


                    {/* SUCCESS */}

                    {success && (
                        <div className="auth-success">
                            ✅ {success}
                        </div>
                    )}


                    <form onSubmit={handleSubmit}>

                        {/* EMAIL */}

                        <div className="form-group">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                autoComplete="email"
                                disabled={loading}
                            />

                        </div>


                        {/* PASSWORD */}

                        <div className="form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                disabled={loading}
                            />

                        </div>


                        {/* FORGOT PASSWORD */}

                        <div className="forgot-password-row">

                            <Link
                                to="/forgot-password"
                                className="forgot-password-link"
                            >
                                Forgot Password?
                            </Link>

                        </div>


                        {/* LOGIN BUTTON */}

                        <button
                            type="submit"
                            className="auth-btn"
                            disabled={loading}
                        >

                            {loading
                                ? "Logging in..."
                                : "Login"}

                        </button>

                    </form>


                    {/* REGISTER */}

                    <div className="auth-switch">

                        <span>
                            Don't have an account?
                        </span>

                        <Link to="/register">
                            Register
                        </Link>

                    </div>


                    {/* ADMIN LOGIN */}

                    <div className="admin-login-link">

                        <Link to="/admin-login">
                            🔐 Admin Login
                        </Link>

                    </div>

                </div>


                {/* FOOTER */}

                <p className="auth-footer">
                    © 2026 MyBank. Secure Banking System.
                </p>

            </div>

        </div>
    );
}

export default Login;
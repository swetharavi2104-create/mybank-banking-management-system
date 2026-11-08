import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function ForgotPassword() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        newPassword: "",
        confirmPassword: ""
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

    const validateForm = () => {

        const email =
            formData.email.trim().toLowerCase();

        if (!email) {
            return "Please enter your registered email.";
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return "Please enter a valid email address.";
        }

        if (!formData.newPassword) {
            return "Please enter your new password.";
        }

        if (formData.newPassword.length < 6) {
            return "New password must be at least 6 characters.";
        }

        if (!formData.confirmPassword) {
            return "Please confirm your new password.";
        }

        if (
            formData.newPassword !==
            formData.confirmPassword
        ) {
            return "Passwords do not match.";
        }

        return "";
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        const validationError =
            validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {

            setLoading(true);

            const response = await axios.put(
                "http://localhost:5000/api/account/forgot-password",
                {
                    email:
                        formData.email
                            .trim()
                            .toLowerCase(),

                    newPassword:
                        formData.newPassword
                }
            );

            if (response.data.success) {

                setSuccess(
                    "Password reset successful. Redirecting to login..."
                );

                setFormData({
                    email: "",
                    newPassword: "",
                    confirmPassword: ""
                });

                setTimeout(() => {
                    navigate("/login");
                }, 1500);
            }

        } catch (error) {

            console.log(
                "Forgot Password Error:",
                error.response?.data ||
                error.message
            );

            setError(
                error.response?.data?.message ||
                "Unable to reset password."
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="forgot-page">

            <div className="forgot-container">

                {/* BRAND */}

                <div className="forgot-brand">

                    <div className="forgot-icon">
                        🔑
                    </div>

                    <h1>
                        MyBank
                    </h1>

                    <p>
                        Secure Password Recovery
                    </p>

                </div>


                {/* CARD */}

                <div className="forgot-card">

                    <h2>
                        Forgot Password?
                    </h2>

                    <p className="forgot-subtitle">
                        Enter your registered email and create a new password
                    </p>


                    {/* ERROR */}

                    {error && (
                        <div className="forgot-error">
                            ❌ {error}
                        </div>
                    )}


                    {/* SUCCESS */}

                    {success && (
                        <div className="forgot-success">
                            ✅ {success}
                        </div>
                    )}


                    <form onSubmit={handleSubmit}>

                        {/* EMAIL */}

                        <div className="forgot-form-group">

                            <label htmlFor="forgot-email">
                                Registered Email
                            </label>

                            <input
                                id="forgot-email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your registered email"
                                autoComplete="email"
                                disabled={loading}
                            />

                        </div>


                        {/* NEW PASSWORD */}

                        <div className="forgot-form-group">

                            <label htmlFor="newPassword">
                                New Password
                            </label>

                            <input
                                id="newPassword"
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Minimum 6 characters"
                                autoComplete="new-password"
                                disabled={loading}
                            />

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div className="forgot-form-group">

                            <label htmlFor="confirmPassword">
                                Confirm New Password
                            </label>

                            <input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Re-enter new password"
                                autoComplete="new-password"
                                disabled={loading}
                            />

                        </div>


                        {/* BUTTON */}

                        <button
                            type="submit"
                            className="forgot-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Resetting Password..."
                                : "Reset Password"}
                        </button>

                    </form>


                    {/* BACK TO LOGIN */}

                    <div className="forgot-login-link">

                        <Link to="/login">
                            ← Back to Login
                        </Link>

                    </div>

                </div>


                {/* FOOTER */}

                <p className="forgot-footer">
                    © 2026 MyBank. Secure Banking System.
                </p>

            </div>

        </div>
    );
}

export default ForgotPassword;
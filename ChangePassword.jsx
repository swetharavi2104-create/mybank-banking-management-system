import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function ChangePassword() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        currentPassword: "",
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

        if (!formData.currentPassword) {
            return "Please enter your current password.";
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
            return "New passwords do not match.";
        }

        if (
            formData.currentPassword ===
            formData.newPassword
        ) {
            return "New password must be different from current password.";
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

            const token =
                localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.put(
                "http://localhost:5000/api/account/change-password",
                {
                    currentPassword:
                        formData.currentPassword,

                    newPassword:
                        formData.newPassword
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {

                setSuccess(
                    "Password changed successfully. Please login again."
                );

                setFormData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });

                /*
                    Clear current session after
                    password change
                */
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                setTimeout(() => {
                    navigate("/login");
                }, 1500);
            }

        } catch (error) {

            console.log(
                "Change Password Error:",
                error.response?.data ||
                error.message
            );

            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");
                return;
            }

            setError(
                error.response?.data?.message ||
                "Unable to change password."
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="change-password-page">

            <div className="change-password-container">

                {/* BRAND */}

                <div className="change-password-brand">

                    <div className="change-password-icon">
                        🔐
                    </div>

                    <h1>
                        MyBank
                    </h1>

                    <p>
                        Secure Account Settings
                    </p>

                </div>


                {/* CARD */}

                <div className="change-password-card">

                    <h2>
                        Change Password
                    </h2>

                    <p className="change-password-subtitle">
                        Update your password to keep your account secure
                    </p>


                    {/* ERROR */}

                    {error && (
                        <div className="change-password-error">
                            ❌ {error}
                        </div>
                    )}


                    {/* SUCCESS */}

                    {success && (
                        <div className="change-password-success">
                            ✅ {success}
                        </div>
                    )}


                    <form onSubmit={handleSubmit}>

                        {/* CURRENT PASSWORD */}

                        <div className="change-password-form-group">

                            <label htmlFor="currentPassword">
                                Current Password
                            </label>

                            <input
                                id="currentPassword"
                                type="password"
                                name="currentPassword"
                                value={
                                    formData.currentPassword
                                }
                                onChange={handleChange}
                                placeholder="Enter current password"
                                autoComplete="current-password"
                                disabled={loading}
                            />

                        </div>


                        {/* NEW PASSWORD */}

                        <div className="change-password-form-group">

                            <label htmlFor="newPassword">
                                New Password
                            </label>

                            <input
                                id="newPassword"
                                type="password"
                                name="newPassword"
                                value={
                                    formData.newPassword
                                }
                                onChange={handleChange}
                                placeholder="Minimum 6 characters"
                                autoComplete="new-password"
                                disabled={loading}
                            />

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div className="change-password-form-group">

                            <label htmlFor="confirmPassword">
                                Confirm New Password
                            </label>

                            <input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                value={
                                    formData.confirmPassword
                                }
                                onChange={handleChange}
                                placeholder="Re-enter new password"
                                autoComplete="new-password"
                                disabled={loading}
                            />

                        </div>


                        {/* BUTTON */}

                        <button
                            type="submit"
                            className="change-password-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Updating Password..."
                                : "Change Password"}
                        </button>

                    </form>


                    {/* BACK TO DASHBOARD */}

                    <div className="change-password-back">

                        <Link to="/dashboard">
                            ← Back to Dashboard
                        </Link>

                    </div>

                </div>


                {/* FOOTER */}

                <p className="change-password-footer">
                    © 2026 MyBank. Secure Banking System.
                </p>

            </div>

        </div>
    );
}

export default ChangePassword;
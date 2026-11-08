import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
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

        const name = formData.name.trim();
        const email = formData.email.trim().toLowerCase();
        const phone = formData.phone.trim();
        const password = formData.password;
        const confirmPassword = formData.confirmPassword;

        if (!name) {
            return "Please enter your full name.";
        }

        if (name.length < 3) {
            return "Name must be at least 3 characters.";
        }

        if (!email) {
            return "Please enter your email.";
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return "Please enter a valid email address.";
        }

        if (!phone) {
            return "Please enter your phone number.";
        }

        const phonePattern = /^[0-9]{10}$/;

        if (!phonePattern.test(phone)) {
            return "Phone number must contain exactly 10 digits.";
        }

        if (!password) {
            return "Please enter a password.";
        }

        if (password.length < 6) {
            return "Password must be at least 6 characters.";
        }

        if (!confirmPassword) {
            return "Please confirm your password.";
        }

        if (password !== confirmPassword) {
            return "Passwords do not match.";
        }

        return "";
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {

            setLoading(true);

            const response = await axios.post(
                "http://localhost:5000/api/auth/register",
                {
                    name: formData.name.trim(),
                    email: formData.email
                        .trim()
                        .toLowerCase(),
                    phone: formData.phone.trim(),
                    password: formData.password
                }
            );

            if (response.data.success) {

                setSuccess(
                    "Registration successful! Redirecting to login..."
                );

                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    password: "",
                    confirmPassword: ""
                });

                setTimeout(() => {
                    navigate("/login");
                }, 1200);
            }

        } catch (error) {

            console.log(
                "Register Error:",
                error.response?.data ||
                error.message
            );

            setError(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="register-page">

            <div className="register-container">

                {/* =================================
                    BRAND
                ================================= */}

                <div className="register-brand">

                    <div className="register-icon">
                        🏦
                    </div>

                    <h1>
                        MyBank
                    </h1>

                    <p>
                        Create Your Bank Account
                    </p>

                </div>


                {/* =================================
                    REGISTER CARD
                ================================= */}

                <div className="register-card">

                    <h2>
                        Create Account
                    </h2>

                    <p className="register-subtitle">
                        Register to start using secure online banking
                    </p>


                    {/* ERROR */}

                    {error && (
                        <div className="register-error">
                            ❌ {error}
                        </div>
                    )}


                    {/* SUCCESS */}

                    {success && (
                        <div className="register-success">
                            ✅ {success}
                        </div>
                    )}


                    <form onSubmit={handleSubmit}>

                        {/* NAME */}

                        <div className="register-form-group">

                            <label htmlFor="name">
                                Full Name
                            </label>

                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                autoComplete="name"
                                disabled={loading}
                            />

                        </div>


                        {/* EMAIL */}

                        <div className="register-form-group">

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


                        {/* PHONE */}

                        <div className="register-form-group">

                            <label htmlFor="phone">
                                Phone Number
                            </label>

                            <input
                                id="phone"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={(e) => {

                                    const value =
                                        e.target.value.replace(
                                            /\D/g,
                                            ""
                                        );

                                    if (value.length <= 10) {

                                        setFormData((prev) => ({
                                            ...prev,
                                            phone: value
                                        }));

                                    }

                                    setError("");
                                    setSuccess("");
                                }}
                                placeholder="Enter 10 digit phone number"
                                inputMode="numeric"
                                maxLength="10"
                                autoComplete="tel"
                                disabled={loading}
                            />

                        </div>


                        {/* PASSWORD */}

                        <div className="register-form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Minimum 6 characters"
                                autoComplete="new-password"
                                disabled={loading}
                            />

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div className="register-form-group">

                            <label htmlFor="confirmPassword">
                                Confirm Password
                            </label>

                            <input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Re-enter your password"
                                autoComplete="new-password"
                                disabled={loading}
                            />

                        </div>


                        {/* BUTTON */}

                        <button
                            type="submit"
                            className="register-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating Account..."
                                : "Create Account"}
                        </button>

                    </form>


                    {/* LOGIN LINK */}

                    <div className="register-login-link">

                        <span>
                            Already have an account?
                        </span>

                        <Link to="/login">
                            Login
                        </Link>

                    </div>


                    {/* ADMIN LOGIN */}

                    <div className="register-admin-link">

                        <Link to="/admin-login">
                            🔐 Admin Login
                        </Link>

                    </div>

                </div>


                {/* FOOTER */}

                <p className="register-footer">
                    © 2026 MyBank. Secure Banking System.
                </p>

            </div>

        </div>
    );
}

export default Register;
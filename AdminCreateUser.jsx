import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function AdminCreateUser() {

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

    const [createdUser, setCreatedUser] = useState(null);

    const getToken = () => {
        return localStorage.getItem("adminToken");
    };

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setError("");
        setSuccess("");
        setCreatedUser(null);
    };

    const handlePhoneChange = (e) => {

        const value =
            e.target.value.replace(/\D/g, "");

        if (value.length <= 10) {

            setFormData((prev) => ({
                ...prev,
                phone: value
            }));
        }

        setError("");
        setSuccess("");
        setCreatedUser(null);
    };

    const validateForm = () => {

        const name = formData.name.trim();
        const email =
            formData.email.trim().toLowerCase();
        const phone = formData.phone.trim();

        if (!name) {
            return "Please enter the user's name.";
        }

        if (name.length < 3) {
            return "Name must be at least 3 characters.";
        }

        if (!email) {
            return "Please enter the user's email.";
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return "Please enter a valid email address.";
        }

        if (!phone) {
            return "Please enter the user's phone number.";
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            return "Phone number must contain exactly 10 digits.";
        }

        if (!formData.password) {
            return "Please enter a password.";
        }

        if (formData.password.length < 6) {
            return "Password must be at least 6 characters.";
        }

        if (!formData.confirmPassword) {
            return "Please confirm the password.";
        }

        if (
            formData.password !==
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
        setCreatedUser(null);

        const validationError =
            validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {

            setLoading(true);

            const token = getToken();

            if (!token) {
                navigate("/admin-login");
                return;
            }

            const response = await axios.post(
                "http://localhost:5000/api/admin/users",
                {
                    name: formData.name.trim(),
                    email:
                        formData.email
                            .trim()
                            .toLowerCase(),
                    phone: formData.phone.trim(),
                    password: formData.password
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
                    response.data.message ||
                    "User created successfully."
                );

                setCreatedUser(
                    response.data.user
                );

                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    password: "",
                    confirmPassword: ""
                });
            }

        } catch (error) {

            console.log(
                "Admin Create User Error:",
                error.response?.data ||
                error.message
            );

            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {

                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminUser");

                navigate("/admin-login");
                return;
            }

            setError(
                error.response?.data?.message ||
                "Unable to create user."
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="admin-create-user-page">

            <div className="admin-create-user-container">

                {/* HEADER */}

                <div className="admin-create-user-header">

                    <div>
                        <h1>
                            ➕ Create New User
                        </h1>

                        <p>
                            Create a new customer bank account
                        </p>
                    </div>

                    <Link
                        to="/admin-dashboard"
                        className="admin-create-user-back-btn"
                    >
                        ← Dashboard
                    </Link>

                </div>


                {/* CARD */}

                <div className="admin-create-user-card">

                    <div className="admin-create-user-icon">
                        👤
                    </div>

                    <h2>
                        New Customer Account
                    </h2>

                    <p className="admin-create-user-subtitle">
                        Enter the customer's details below
                    </p>


                    {/* ERROR */}

                    {error && (
                        <div className="admin-create-user-error">
                            ❌ {error}
                        </div>
                    )}


                    {/* SUCCESS */}

                    {success && (
                        <div className="admin-create-user-success">
                            ✅ {success}
                        </div>
                    )}


                    <form onSubmit={handleSubmit}>

                        {/* NAME */}

                        <div className="admin-create-user-form-group">

                            <label htmlFor="create-name">
                                Full Name
                            </label>

                            <input
                                id="create-name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter full name"
                                autoComplete="name"
                                disabled={loading}
                            />

                        </div>


                        {/* EMAIL */}

                        <div className="admin-create-user-form-group">

                            <label htmlFor="create-email">
                                Email Address
                            </label>

                            <input
                                id="create-email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter email address"
                                autoComplete="email"
                                disabled={loading}
                            />

                        </div>


                        {/* PHONE */}

                        <div className="admin-create-user-form-group">

                            <label htmlFor="create-phone">
                                Phone Number
                            </label>

                            <input
                                id="create-phone"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                placeholder="Enter 10 digit phone number"
                                maxLength="10"
                                inputMode="numeric"
                                autoComplete="tel"
                                disabled={loading}
                            />

                        </div>


                        {/* PASSWORD */}

                        <div className="admin-create-user-form-group">

                            <label htmlFor="create-password">
                                Password
                            </label>

                            <input
                                id="create-password"
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

                        <div className="admin-create-user-form-group">

                            <label htmlFor="create-confirm-password">
                                Confirm Password
                            </label>

                            <input
                                id="create-confirm-password"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Re-enter password"
                                autoComplete="new-password"
                                disabled={loading}
                            />

                        </div>


                        {/* BUTTONS */}

                        <div className="admin-create-user-buttons">

                            <button
                                type="button"
                                className="admin-create-user-cancel-btn"
                                onClick={() =>
                                    navigate("/admin-dashboard")
                                }
                                disabled={loading}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="admin-create-user-submit-btn"
                                disabled={loading}
                            >
                                {loading
                                    ? "Creating User..."
                                    : "Create User"}
                            </button>

                        </div>

                    </form>


                    {/* CREATED ACCOUNT DETAILS */}

                    {createdUser && (
                        <div className="admin-created-user-result">

                            <h3>
                                ✅ Account Created
                            </h3>

                            <div className="admin-created-user-row">

                                <span>
                                    Name
                                </span>

                                <strong>
                                    {createdUser.name}
                                </strong>

                            </div>

                            <div className="admin-created-user-row">

                                <span>
                                    Email
                                </span>

                                <strong>
                                    {createdUser.email}
                                </strong>

                            </div>

                            <div className="admin-created-user-row">

                                <span>
                                    Account Number
                                </span>

                                <strong>
                                    {createdUser.accountNumber}
                                </strong>

                            </div>

                            <div className="admin-created-user-row">

                                <span>
                                    Initial Balance
                                </span>

                                <strong>
                                    ₹{Number(
                                        createdUser.balance || 0
                                    ).toLocaleString(
                                        "en-IN",
                                        {
                                            minimumFractionDigits: 2
                                        }
                                    )}
                                </strong>

                            </div>

                            <div className="admin-created-user-row">

                                <span>
                                    Status
                                </span>

                                <strong>
                                    {createdUser.status || "active"}
                                </strong>

                            </div>

                            <button
                                className="admin-created-user-view-btn"
                                onClick={() =>
                                    navigate(
                                        `/admin-user/${createdUser.id}`
                                    )
                                }
                            >
                                View User
                            </button>

                        </div>
                    )}

                </div>


                <p className="admin-create-user-footer">
                    © 2026 MyBank Admin Panel
                </p>

            </div>

        </div>
    );
}

export default AdminCreateUser;
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function AdminEditUser() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: ""
    });

    const [originalUser, setOriginalUser] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const getToken = () => {
        return localStorage.getItem("adminToken");
    };

    const fetchUser = async () => {

        try {

            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                navigate("/admin-login");
                return;
            }

            const response = await axios.get(
                `http://localhost:5000/api/admin/users/${id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {

                const user =
                    response.data.user;

                setOriginalUser(user);

                setFormData({
                    name: user.name || "",
                    email: user.email || "",
                    phone: user.phone || ""
                });
            }

        } catch (error) {

            console.log(
                "Admin Edit User Load Error:",
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
                "Unable to load user."
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [id]);


    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setError("");
        setSuccess("");
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
    };


    const validateForm = () => {

        const name =
            formData.name.trim();

        const email =
            formData.email.trim().toLowerCase();

        const phone =
            formData.phone.trim();

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

            setSaving(true);

            const token = getToken();

            if (!token) {
                navigate("/admin-login");
                return;
            }

            const response = await axios.put(
                `http://localhost:5000/api/admin/users/${id}`,
                {
                    name:
                        formData.name.trim(),

                    email:
                        formData.email
                            .trim()
                            .toLowerCase(),

                    phone:
                        formData.phone.trim()
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
                    "User updated successfully."
                );

                const updatedUser =
                    response.data.user;

                setOriginalUser(updatedUser);

                setFormData({
                    name:
                        updatedUser.name || "",

                    email:
                        updatedUser.email || "",

                    phone:
                        updatedUser.phone || ""
                });

                setTimeout(() => {
                    navigate(
                        `/admin-user/${id}`
                    );
                }, 800);
            }

        } catch (error) {

            console.log(
                "Admin Edit User Error:",
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
                "Unable to update user."
            );

        } finally {

            setSaving(false);
        }
    };


    const cancelEdit = () => {

        navigate(
            `/admin-user/${id}`
        );
    };


    if (loading) {

        return (
            <div className="admin-edit-user-loading-page">

                <div className="admin-edit-user-loading-card">
                    Loading user details...
                </div>

            </div>
        );
    }


    if (!originalUser) {

        return (
            <div className="admin-edit-user-page">

                <div className="admin-edit-user-container">

                    <div className="admin-edit-user-error">
                        ❌ User not found.
                    </div>

                    <Link
                        to="/admin-dashboard"
                        className="admin-edit-user-back-btn"
                    >
                        ← Back to Dashboard
                    </Link>

                </div>

            </div>
        );
    }


    return (
        <div className="admin-edit-user-page">

            <div className="admin-edit-user-container">

                {/* HEADER */}

                <div className="admin-edit-user-header">

                    <div>
                        <h1>
                            ✏️ Edit User
                        </h1>

                        <p>
                            Update customer account information
                        </p>
                    </div>

                    <Link
                        to={`/admin-user/${id}`}
                        className="admin-edit-user-back-btn"
                    >
                        ← User Details
                    </Link>

                </div>


                {/* CARD */}

                <div className="admin-edit-user-card">

                    <div className="admin-edit-user-avatar">
                        {formData.name
                            ?.charAt(0)
                            .toUpperCase()}
                    </div>

                    <h2>
                        Edit Account
                    </h2>

                    <p className="admin-edit-user-subtitle">
                        Account Number:{" "}
                        {originalUser.accountNumber || "-"}
                    </p>


                    {/* ERROR */}

                    {error && (
                        <div className="admin-edit-user-error">
                            ❌ {error}
                        </div>
                    )}


                    {/* SUCCESS */}

                    {success && (
                        <div className="admin-edit-user-success">
                            ✅ {success}
                        </div>
                    )}


                    <form onSubmit={handleSubmit}>

                        {/* NAME */}

                        <div className="admin-edit-user-form-group">

                            <label htmlFor="edit-name">
                                Full Name
                            </label>

                            <input
                                id="edit-name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter full name"
                                disabled={saving}
                            />

                        </div>


                        {/* EMAIL */}

                        <div className="admin-edit-user-form-group">

                            <label htmlFor="edit-email">
                                Email Address
                            </label>

                            <input
                                id="edit-email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter email address"
                                disabled={saving}
                            />

                        </div>


                        {/* PHONE */}

                        <div className="admin-edit-user-form-group">

                            <label htmlFor="edit-phone">
                                Phone Number
                            </label>

                            <input
                                id="edit-phone"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                placeholder="Enter 10 digit phone number"
                                maxLength="10"
                                inputMode="numeric"
                                disabled={saving}
                            />

                        </div>


                        {/* ACCOUNT NUMBER */}

                        <div className="admin-edit-user-form-group">

                            <label>
                                Account Number
                            </label>

                            <input
                                type="text"
                                value={
                                    originalUser.accountNumber ||
                                    "-"
                                }
                                disabled
                            />

                        </div>


                        {/* BALANCE */}

                        <div className="admin-edit-user-form-group">

                            <label>
                                Current Balance
                            </label>

                            <input
                                type="text"
                                value={
                                    `₹${Number(
                                        originalUser.balance || 0
                                    ).toLocaleString(
                                        "en-IN",
                                        {
                                            minimumFractionDigits: 2
                                        }
                                    )}`
                                }
                                disabled
                            />

                        </div>


                        {/* ACTIONS */}

                        <div className="admin-edit-user-buttons">

                            <button
                                type="button"
                                className="admin-edit-user-cancel-btn"
                                onClick={cancelEdit}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="admin-edit-user-save-btn"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                        </div>

                    </form>

                </div>


                <p className="admin-edit-user-footer">
                    © 2026 MyBank Admin Panel
                </p>

            </div>

        </div>
    );
}

export default AdminEditUser;
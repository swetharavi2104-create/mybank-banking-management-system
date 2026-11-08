import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Profile() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        phone: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const getToken = () => {
        return localStorage.getItem("token");
    };

    const loadProfile = async () => {

        try {

            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.get(
                "http://localhost:5000/api/account/me",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {

                const accountUser =
                    response.data.user;

                setUser(accountUser);

                setFormData({
                    name: accountUser.name || "",
                    phone: accountUser.phone || ""
                });

                localStorage.setItem(
                    "user",
                    JSON.stringify(accountUser)
                );
            }

        } catch (error) {

            console.log(
                "Profile Load Error:",
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
                "Unable to load profile."
            );

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

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

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        const name =
            formData.name.trim();

        const phone =
            formData.phone.trim();

        if (!name) {
            setError(
                "Please enter your name."
            );
            return;
        }

        if (name.length < 3) {
            setError(
                "Name must be at least 3 characters."
            );
            return;
        }

        if (!phone) {
            setError(
                "Please enter your phone number."
            );
            return;
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            setError(
                "Phone number must contain exactly 10 digits."
            );
            return;
        }

        try {

            setSaving(true);

            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.put(
                "http://localhost:5000/api/account/update-profile",
                {
                    name,
                    phone
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {

                const updatedUser =
                    response.data.user;

                setUser(updatedUser);

                setFormData({
                    name: updatedUser.name || "",
                    phone: updatedUser.phone || ""
                });

                localStorage.setItem(
                    "user",
                    JSON.stringify(updatedUser)
                );

                setSuccess(
                    "Profile updated successfully."
                );
            }

        } catch (error) {

            console.log(
                "Profile Update Error:",
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
                "Unable to update profile."
            );

        } finally {

            setSaving(false);

        }
    };

    if (loading) {

        return (
            <div className="profile-loading-page">
                <div className="profile-loading-card">
                    Loading profile...
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="profile-page">

            <div className="profile-container">

                {/* HEADER */}

                <div className="profile-header">

                    <div>
                        <h1>
                            👤 My Profile
                        </h1>

                        <p>
                            Manage your personal account information
                        </p>
                    </div>

                    <Link
                        to="/dashboard"
                        className="profile-back-btn"
                    >
                        ← Dashboard
                    </Link>

                </div>


                {/* PROFILE CARD */}

                <div className="profile-card">

                    {/* AVATAR */}

                    <div className="profile-avatar">
                        {user.name
                            ?.charAt(0)
                            .toUpperCase()}
                    </div>

                    <h2 className="profile-name">
                        {user.name}
                    </h2>

                    <p className="profile-role">
                        {user.role || "user"}
                    </p>


                    {/* ERROR */}

                    {error && (
                        <div className="profile-error">
                            ❌ {error}
                        </div>
                    )}


                    {/* SUCCESS */}

                    {success && (
                        <div className="profile-success">
                            ✅ {success}
                        </div>
                    )}


                    <form
                        onSubmit={handleSubmit}
                        className="profile-form"
                    >

                        {/* NAME */}

                        <div className="profile-form-group">

                            <label htmlFor="profile-name">
                                Full Name
                            </label>

                            <input
                                id="profile-name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                disabled={saving}
                            />

                        </div>


                        {/* EMAIL */}

                        <div className="profile-form-group">

                            <label>
                                Email Address
                            </label>

                            <input
                                type="email"
                                value={user.email || ""}
                                disabled
                            />

                        </div>


                        {/* PHONE */}

                        <div className="profile-form-group">

                            <label htmlFor="profile-phone">
                                Phone Number
                            </label>

                            <input
                                id="profile-phone"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                placeholder="Enter 10 digit phone number"
                                inputMode="numeric"
                                maxLength="10"
                                disabled={saving}
                            />

                        </div>


                        {/* ACCOUNT NUMBER */}

                        <div className="profile-form-group">

                            <label>
                                Account Number
                            </label>

                            <input
                                type="text"
                                value={
                                    user.accountNumber || "-"
                                }
                                disabled
                            />

                        </div>


                        {/* BALANCE */}

                        <div className="profile-form-group">

                            <label>
                                Current Balance
                            </label>

                            <input
                                type="text"
                                value={
                                    `₹${Number(
                                        user.balance || 0
                                    ).toLocaleString("en-IN")}`
                                }
                                disabled
                            />

                        </div>


                        {/* STATUS */}

                        <div className="profile-form-group">

                            <label>
                                Account Status
                            </label>

                            <input
                                type="text"
                                value={
                                    user.status || "active"
                                }
                                disabled
                            />

                        </div>


                        {/* SAVE */}

                        <button
                            type="submit"
                            className="profile-save-btn"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving Changes..."
                                : "Save Changes"}
                        </button>

                    </form>


                    {/* CHANGE PASSWORD */}

                    <div className="profile-password-link">

                        <Link to="/change-password">
                            🔐 Change Password
                        </Link>

                    </div>

                </div>


                {/* FOOTER */}

                <p className="profile-footer">
                    © 2026 MyBank. Secure Banking System.
                </p>

            </div>

        </div>
    );
}

export default Profile;
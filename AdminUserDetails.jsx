import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function AdminUserDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const getToken = () => {
        return localStorage.getItem("adminToken");
    };

    const fetchUserDetails = async () => {

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
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {

                setUser(response.data.user);

                // Fetch all transactions for this user
                const transactionResponse =
                    await axios.get(
                        "http://localhost:5000/api/admin/transactions",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                if (
                    transactionResponse.data.success
                ) {

                    const allTransactions =
                        transactionResponse.data.transactions ||
                        [];

                    const userTransactions =
                        allTransactions.filter(
                            (transaction) =>
                                transaction.user?._id === id ||
                                transaction.user === id
                        );

                    setTransactions(
                        userTransactions
                    );
                }
            }

        } catch (error) {

            console.log(
                "Admin User Details Error:",
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
                "Unable to load user details."
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        fetchUserDetails();

    }, [id]);


    const updateUserStatus = async () => {

        if (!user) {
            return;
        }

        try {

            setActionLoading(true);
            setError("");
            setSuccess("");

            const token = getToken();

            const response = await axios.put(
                `http://localhost:5000/api/admin/users/${id}/status`,
                {},
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {

                setUser((prev) => ({
                    ...prev,
                    status: response.data.status
                }));

                setSuccess(
                    response.data.message
                );
            }

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Unable to update user status."
            );

        } finally {

            setActionLoading(false);
        }
    };


    const closeAccount = async () => {

        const confirmed =
            window.confirm(
                "Are you sure you want to close this user account?"
            );

        if (!confirmed) {
            return;
        }

        try {

            setActionLoading(true);
            setError("");
            setSuccess("");

            const token = getToken();

            const response = await axios.put(
                `http://localhost:5000/api/admin/users/${id}/close`,
                {},
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {

                setUser((prev) => ({
                    ...prev,
                    status: response.data.status
                }));

                setSuccess(
                    response.data.message
                );
            }

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Unable to close account."
            );

        } finally {

            setActionLoading(false);
        }
    };


    const reopenAccount = async () => {

        try {

            setActionLoading(true);
            setError("");
            setSuccess("");

            const token = getToken();

            const response = await axios.put(
                `http://localhost:5000/api/admin/users/${id}/reopen`,
                {},
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {

                setUser((prev) => ({
                    ...prev,
                    status: response.data.status
                }));

                setSuccess(
                    response.data.message
                );
            }

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Unable to reopen account."
            );

        } finally {

            setActionLoading(false);
        }
    };


    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }

        return parsedDate.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };


    if (loading) {

        return (
            <div className="admin-user-details-loading-page">

                <div className="admin-user-details-loading-card">
                    Loading user details...
                </div>

            </div>
        );
    }


    if (!user) {

        return (
            <div className="admin-user-details-page">

                <div className="admin-user-details-container">

                    <div className="admin-user-details-error">
                        ❌ User not found
                    </div>

                    <Link
                        to="/admin-dashboard"
                        className="admin-user-back-btn"
                    >
                        ← Back to Dashboard
                    </Link>

                </div>

            </div>
        );
    }


    const currentStatus =
        user.status || "active";


    return (
        <div className="admin-user-details-page">

            <div className="admin-user-details-container">

                {/* HEADER */}

                <div className="admin-user-details-header">

                    <div>
                        <h1>
                            👤 User Details
                        </h1>

                        <p>
                            View and manage customer account
                        </p>
                    </div>

                    <Link
                        to="/admin-dashboard"
                        className="admin-user-back-btn"
                    >
                        ← Dashboard
                    </Link>

                </div>


                {/* ERROR */}

                {error && (
                    <div className="admin-user-details-error">
                        ❌ {error}
                    </div>
                )}


                {/* SUCCESS */}

                {success && (
                    <div className="admin-user-details-success">
                        ✅ {success}
                    </div>
                )}


                {/* PROFILE CARD */}

                <div className="admin-user-profile-card">

                    <div className="admin-user-avatar">
                        {user.name
                            ?.charAt(0)
                            .toUpperCase()}
                    </div>

                    <div className="admin-user-profile-main">

                        <h2>
                            {user.name}
                        </h2>

                        <p>
                            {user.email}
                        </p>

                        <span
                            className={
                                `admin-user-status ${currentStatus}`
                            }
                        >
                            {currentStatus}
                        </span>

                    </div>

                </div>


                {/* INFORMATION */}

                <div className="admin-user-info-card">

                    <div className="admin-user-section-heading">
                        <h2>
                            Account Information
                        </h2>
                    </div>


                    <div className="admin-user-info-grid">

                        <div className="admin-user-info-item">

                            <span>
                                Full Name
                            </span>

                            <strong>
                                {user.name || "-"}
                            </strong>

                        </div>


                        <div className="admin-user-info-item">

                            <span>
                                Email
                            </span>

                            <strong>
                                {user.email || "-"}
                            </strong>

                        </div>


                        <div className="admin-user-info-item">

                            <span>
                                Phone
                            </span>

                            <strong>
                                {user.phone || "-"}
                            </strong>

                        </div>


                        <div className="admin-user-info-item">

                            <span>
                                Account Number
                            </span>

                            <strong>
                                {user.accountNumber || "-"}
                            </strong>

                        </div>


                        <div className="admin-user-info-item">

                            <span>
                                Current Balance
                            </span>

                            <strong className="admin-balance-value">
                                ₹{Number(
                                    user.balance || 0
                                ).toLocaleString(
                                    "en-IN",
                                    {
                                        minimumFractionDigits: 2
                                    }
                                )}
                            </strong>

                        </div>


                        <div className="admin-user-info-item">

                            <span>
                                Role
                            </span>

                            <strong>
                                {user.role || "user"}
                            </strong>

                        </div>


                        <div className="admin-user-info-item">

                            <span>
                                Account Status
                            </span>

                            <strong
                                className={
                                    `admin-status-text ${currentStatus}`
                                }
                            >
                                {currentStatus}
                            </strong>

                        </div>


                        <div className="admin-user-info-item">

                            <span>
                                Created At
                            </span>

                            <strong>
                                {formatDate(
                                    user.createdAt
                                )}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* ACTIONS */}

                {user.role !== "admin" && (

                    <div className="admin-user-actions-card">

                        <h2>
                            Account Actions
                        </h2>

                        <div className="admin-user-action-buttons">

                            {/* EDIT */}

                            <button
                                className="admin-user-edit-btn"
                                onClick={() =>
                                    navigate(
                                        `/admin-edit-user/${user._id}`
                                    )
                                }
                                disabled={actionLoading}
                            >
                                ✏️ Edit User
                            </button>


                            {/* BLOCK / UNBLOCK */}

                            {currentStatus !== "closed" && (

                                <button
                                    className={
                                        currentStatus === "blocked"
                                            ? "admin-user-unblock-btn"
                                            : "admin-user-block-btn"
                                    }
                                    onClick={
                                        updateUserStatus
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                >
                                    {currentStatus === "blocked"
                                        ? "🔓 Unblock User"
                                        : "🔒 Block User"}
                                </button>

                            )}


                            {/* CLOSE */}

                            {currentStatus !== "closed" && (

                                <button
                                    className="admin-user-close-btn"
                                    onClick={
                                        closeAccount
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                >
                                    🚫 Close Account
                                </button>

                            )}


                            {/* REOPEN */}

                            {currentStatus === "closed" && (

                                <button
                                    className="admin-user-reopen-btn"
                                    onClick={
                                        reopenAccount
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                >
                                    🔓 Reopen Account
                                </button>

                            )}

                        </div>

                    </div>

                )}


                {/* TRANSACTIONS */}

                <div className="admin-user-transactions-card">

                    <div className="admin-user-section-heading">

                        <h2>
                            Transaction History
                        </h2>

                        <span>
                            {transactions.length} transactions
                        </span>

                    </div>


                    {transactions.length === 0 ? (

                        <div className="admin-user-no-transactions">

                            <div>
                                🧾
                            </div>

                            <p>
                                No transactions found for this user.
                            </p>

                        </div>

                    ) : (

                        <div className="admin-user-transactions-wrapper">

                            <table className="admin-user-transactions-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Transaction ID
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Type
                                        </th>

                                        <th>
                                            Direction
                                        </th>

                                        <th>
                                            Amount
                                        </th>

                                        <th>
                                            Balance After
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {transactions.map(
                                        (transaction) => {

                                            const direction =
                                                transaction.direction ||
                                                (
                                                    transaction.type === "Deposit"
                                                        ? "Credit"
                                                        : "Debit"
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        transaction._id
                                                    }
                                                >

                                                    <td>
                                                        {transaction.transactionId ||
                                                            "N/A"}
                                                    </td>

                                                    <td>
                                                        {formatDate(
                                                            transaction.createdAt
                                                        )}
                                                    </td>

                                                    <td>
                                                        {transaction.type ||
                                                            "-"}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={
                                                                direction === "Credit"
                                                                    ? "admin-transaction-credit"
                                                                    : "admin-transaction-debit"
                                                            }
                                                        >
                                                            {direction}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <strong
                                                            className={
                                                                direction === "Credit"
                                                                    ? "admin-transaction-credit-amount"
                                                                    : "admin-transaction-debit-amount"
                                                            }
                                                        >
                                                            {direction === "Credit"
                                                                ? "+"
                                                                : "-"
                                                            }₹{Number(
                                                                transaction.amount ||
                                                                0
                                                            ).toLocaleString(
                                                                "en-IN",
                                                                {
                                                                    minimumFractionDigits:
                                                                        2
                                                                }
                                                            )}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        ₹{Number(
                                                            transaction.balanceAfter ||
                                                            0
                                                        ).toLocaleString(
                                                            "en-IN",
                                                            {
                                                                minimumFractionDigits:
                                                                    2
                                                            }
                                                        )}
                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>
                    )}

                </div>


                {/* FOOTER */}

                <p className="admin-user-details-footer">
                    © 2026 MyBank Admin Panel
                </p>

            </div>

        </div>
    );
}

export default AdminUserDetails;
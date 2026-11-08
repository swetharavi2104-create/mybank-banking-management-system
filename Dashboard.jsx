import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getToken = () => {
        return localStorage.getItem("token");
    };

    const loadAccount = async () => {

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
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {

                setUser(
                    response.data.user
                );

                // Keep localStorage user data updated
                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        response.data.user
                    )
                );
            }

        } catch (error) {

            console.log(
                "Dashboard Error:",
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
            }

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {

        loadAccount();

    }, []);

    const logoutUser = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    if (loading) {

        return (
            <div className="dashboard-loading-page">
                <div className="dashboard-loading-card">
                    Loading your account...
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="dashboard-page">

            {/* =================================
                HEADER
            ================================= */}

            <div className="dashboard-header">

                <div>
                    <h1>
                        🏦 MyBank
                    </h1>

                    <p>
                        Welcome, {user.name}
                    </p>
                </div>

                <button
                    className="dashboard-logout-btn"
                    onClick={logoutUser}
                >
                    Logout
                </button>

            </div>


            {/* =================================
                ACCOUNT SUMMARY
            ================================= */}

            <div className="dashboard-welcome-card">

                <div>
                    <span className="dashboard-label">
                        Account Holder
                    </span>

                    <h2>
                        {user.name}
                    </h2>
                </div>

                <div>
                    <span className="dashboard-label">
                        Account Number
                    </span>

                    <h3>
                        {user.accountNumber || "-"}
                    </h3>
                </div>

            </div>


            {/* =================================
                BALANCE
            ================================= */}

            <div className="dashboard-balance-card">

                <div>

                    <span className="dashboard-label">
                        Available Balance
                    </span>

                    <h2>
                        ₹{Number(
                            user.balance || 0
                        ).toLocaleString("en-IN")}
                    </h2>

                </div>

                <button
                    onClick={() =>
                        navigate("/balance")
                    }
                >
                    View Balance
                </button>

            </div>


            {/* =================================
                QUICK ACTIONS
            ================================= */}

            <div className="dashboard-section">

                <h2>
                    Banking Services
                </h2>

                <div className="dashboard-action-grid">

                    {/* DEPOSIT */}

                    <button
                        className="dashboard-action-card"
                        onClick={() =>
                            navigate("/deposit")
                        }
                    >
                        <div className="dashboard-action-icon">
                            💰
                        </div>

                        <h3>
                            Deposit
                        </h3>

                        <p>
                            Add money to your account
                        </p>
                    </button>


                    {/* WITHDRAW */}

                    <button
                        className="dashboard-action-card"
                        onClick={() =>
                            navigate("/withdraw")
                        }
                    >
                        <div className="dashboard-action-icon">
                            💸
                        </div>

                        <h3>
                            Withdrawal
                        </h3>

                        <p>
                            Withdraw money from account
                        </p>
                    </button>


                    {/* TRANSFER */}

                    <button
                        className="dashboard-action-card"
                        onClick={() =>
                            navigate("/transfer")
                        }
                    >
                        <div className="dashboard-action-icon">
                            🔄
                        </div>

                        <h3>
                            Money Transfer
                        </h3>

                        <p>
                            Transfer money to another account
                        </p>
                    </button>


                    {/* BALANCE */}

                    <button
                        className="dashboard-action-card"
                        onClick={() =>
                            navigate("/balance")
                        }
                    >
                        <div className="dashboard-action-icon">
                            📊
                        </div>

                        <h3>
                            Balance Check
                        </h3>

                        <p>
                            Check your current balance
                        </p>
                    </button>


                    {/* TRANSACTIONS */}

                    <button
                        className="dashboard-action-card"
                        onClick={() =>
                            navigate("/transactions")
                        }
                    >
                        <div className="dashboard-action-icon">
                            🧾
                        </div>

                        <h3>
                            Transactions
                        </h3>

                        <p>
                            View your transaction history
                        </p>
                    </button>


                    {/* STATEMENT */}

                    <button
                        className="dashboard-action-card"
                        onClick={() =>
                            navigate("/statement")
                        }
                    >
                        <div className="dashboard-action-icon">
                            📄
                        </div>

                        <h3>
                            Account Statement
                        </h3>

                        <p>
                            View and download statement
                        </p>
                    </button>


                    {/* PROFILE */}

                    <button
                        className="dashboard-action-card"
                        onClick={() =>
                            navigate("/profile")
                        }
                    >
                        <div className="dashboard-action-icon">
                            👤
                        </div>

                        <h3>
                            My Profile
                        </h3>

                        <p>
                            View and update profile
                        </p>
                    </button>


                    {/* CHANGE PASSWORD */}

                    <button
                        className="dashboard-action-card"
                        onClick={() =>
                            navigate("/change-password")
                        }
                    >
                        <div className="dashboard-action-icon">
                            🔐
                        </div>

                        <h3>
                            Change Password
                        </h3>

                        <p>
                            Update your account password
                        </p>
                    </button>

                </div>

            </div>


            {/* =================================
                USER INFORMATION
            ================================= */}

            <div className="dashboard-section">

                <h2>
                    Account Information
                </h2>

                <div className="dashboard-info-card">

                    <div className="dashboard-info-row">

                        <span>
                            Name
                        </span>

                        <strong>
                            {user.name}
                        </strong>

                    </div>

                    <div className="dashboard-info-row">

                        <span>
                            Email
                        </span>

                        <strong>
                            {user.email}
                        </strong>

                    </div>

                    <div className="dashboard-info-row">

                        <span>
                            Phone
                        </span>

                        <strong>
                            {user.phone}
                        </strong>

                    </div>

                    <div className="dashboard-info-row">

                        <span>
                            Account Number
                        </span>

                        <strong>
                            {user.accountNumber || "-"}
                        </strong>

                    </div>

                    <div className="dashboard-info-row">

                        <span>
                            Account Status
                        </span>

                        <strong
                            className={
                                user.status === "blocked"
                                    ? "dashboard-status-blocked"
                                    : user.status === "closed"
                                        ? "dashboard-status-closed"
                                        : "dashboard-status-active"
                            }
                        >
                            {user.status || "active"}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================
                FOOTER
            ================================= */}

            <footer className="dashboard-footer">

                © 2026 MyBank. Secure Banking System.

            </footer>

        </div>
    );
}

export default Dashboard;
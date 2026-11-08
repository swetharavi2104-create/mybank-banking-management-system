import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Balance() {

    const navigate = useNavigate();

    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState("");

    const getToken = () => {
        return localStorage.getItem("token");
    };

    const fetchBalance = async (isRefresh = false) => {

        try {

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.get(
                "http://localhost:5000/api/account/balance",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {

                const balanceData =
                    response.data;

                const storedUser =
                    localStorage.getItem("user");

                let currentUser = {};

                if (storedUser) {
                    try {
                        currentUser =
                            JSON.parse(storedUser);
                    } catch {
                        currentUser = {};
                    }
                }

                const updatedAccount = {
                    ...currentUser,
                    ...balanceData.user,
                    name:
                        balanceData.user?.name ||
                        balanceData.name ||
                        currentUser.name ||
                        "",
                    email:
                        balanceData.user?.email ||
                        balanceData.email ||
                        currentUser.email ||
                        "",
                    phone:
                        balanceData.user?.phone ||
                        balanceData.phone ||
                        currentUser.phone ||
                        "",
                    accountNumber:
                        balanceData.user?.accountNumber ||
                        balanceData.accountNumber ||
                        currentUser.accountNumber ||
                        "",
                    balance:
                        balanceData.balance ??
                        balanceData.user?.balance ??
                        currentUser.balance ??
                        0,
                    status:
                        balanceData.user?.status ||
                        balanceData.status ||
                        currentUser.status ||
                        "active"
                };

                setAccount(updatedAccount);

                localStorage.setItem(
                    "user",
                    JSON.stringify(updatedAccount)
                );
            }

        } catch (error) {

            console.log(
                "Balance Error:",
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
                "Unable to fetch account balance."
            );

        } finally {

            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, []);

    if (loading) {

        return (
            <div className="balance-loading-page">
                <div className="balance-loading-card">
                    Loading balance...
                </div>
            </div>
        );
    }

    return (
        <div className="balance-page">

            <div className="balance-container">

                {/* HEADER */}

                <div className="balance-header">

                    <div>
                        <h1>
                            📊 Account Balance
                        </h1>

                        <p>
                            Check your current bank account balance
                        </p>
                    </div>

                    <Link
                        to="/dashboard"
                        className="balance-back-btn"
                    >
                        ← Dashboard
                    </Link>

                </div>


                {/* ERROR */}

                {error && (
                    <div className="balance-error">
                        ❌ {error}
                    </div>
                )}


                {account && (
                    <>
                        {/* BALANCE CARD */}

                        <div className="balance-main-card">

                            <div className="balance-main-icon">
                                ₹
                            </div>

                            <p className="balance-main-label">
                                Available Balance
                            </p>

                            <h2>
                                ₹{Number(
                                    account.balance || 0
                                ).toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </h2>

                            <button
                                className="balance-refresh-btn"
                                onClick={() =>
                                    fetchBalance(true)
                                }
                                disabled={refreshing}
                            >
                                {refreshing
                                    ? "Refreshing..."
                                    : "🔄 Refresh Balance"}
                            </button>

                        </div>


                        {/* ACCOUNT DETAILS */}

                        <div className="balance-details-card">

                            <h2>
                                Account Details
                            </h2>

                            <div className="balance-detail-row">

                                <span>
                                    Account Holder
                                </span>

                                <strong>
                                    {account.name || "-"}
                                </strong>

                            </div>

                            <div className="balance-detail-row">

                                <span>
                                    Account Number
                                </span>

                                <strong>
                                    {account.accountNumber || "-"}
                                </strong>

                            </div>

                            <div className="balance-detail-row">

                                <span>
                                    Email
                                </span>

                                <strong>
                                    {account.email || "-"}
                                </strong>

                            </div>

                            <div className="balance-detail-row">

                                <span>
                                    Phone
                                </span>

                                <strong>
                                    {account.phone || "-"}
                                </strong>

                            </div>

                            <div className="balance-detail-row">

                                <span>
                                    Account Status
                                </span>

                                <strong
                                    className={
                                        account.status === "blocked"
                                            ? "balance-status-blocked"
                                            : account.status === "closed"
                                                ? "balance-status-closed"
                                                : "balance-status-active"
                                    }
                                >
                                    {account.status || "active"}
                                </strong>

                            </div>

                        </div>


                        {/* QUICK LINKS */}

                        <div className="balance-quick-links">

                            <Link to="/deposit">
                                💰 Deposit
                            </Link>

                            <Link to="/withdraw">
                                💸 Withdraw
                            </Link>

                            <Link to="/transfer">
                                🔄 Transfer
                            </Link>

                            <Link to="/transactions">
                                🧾 Transactions
                            </Link>

                        </div>
                    </>
                )}


                <p className="balance-footer">
                    © 2026 MyBank. Secure Banking System.
                </p>

            </div>

        </div>
    );
}

export default Balance;
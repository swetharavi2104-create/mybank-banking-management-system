import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function AdminTransactions() {

    const navigate = useNavigate();

    const [transactions, setTransactions] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [directionFilter, setDirectionFilter] = useState("all");

    const getToken = () => {
        return localStorage.getItem("adminToken");
    };

    const fetchTransactions = async () => {

        try {

            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                navigate("/admin-login");
                return;
            }

            const response = await axios.get(
                "http://localhost:5000/api/admin/transactions",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {

                setTransactions(
                    response.data.transactions || []
                );
            }

        } catch (error) {

            console.log(
                "Admin Transactions Error:",
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
                "Unable to load transactions."
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
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

    const getDirection = (transaction) => {

        if (transaction.direction) {
            return transaction.direction;
        }

        if (
            transaction.type === "Deposit"
        ) {
            return "Credit";
        }

        return "Debit";
    };

    const filteredTransactions = useMemo(() => {

        const searchText =
            search.trim().toLowerCase();

        return transactions.filter(
            (transaction) => {

                const user =
                    transaction.user || {};

                const transactionId =
                    transaction.transactionId
                        ?.toLowerCase() || "";

                const type =
                    transaction.type
                        ?.toLowerCase() || "";

                const description =
                    transaction.description
                        ?.toLowerCase() || "";

                const otherAccount =
                    transaction.otherAccountNumber
                        ?.toLowerCase() || "";

                const userName =
                    user.name
                        ?.toLowerCase() || "";

                const userEmail =
                    user.email
                        ?.toLowerCase() || "";

                const accountNumber =
                    user.accountNumber
                        ?.toLowerCase() || "";

                const matchesSearch =
                    !searchText ||
                    transactionId.includes(searchText) ||
                    type.includes(searchText) ||
                    description.includes(searchText) ||
                    otherAccount.includes(searchText) ||
                    userName.includes(searchText) ||
                    userEmail.includes(searchText) ||
                    accountNumber.includes(searchText);

                const matchesType =
                    typeFilter === "all" ||
                    transaction.type === typeFilter;

                const direction =
                    getDirection(transaction);

                const matchesDirection =
                    directionFilter === "all" ||
                    direction === directionFilter;

                return (
                    matchesSearch &&
                    matchesType &&
                    matchesDirection
                );
            }
        );

    }, [
        transactions,
        search,
        typeFilter,
        directionFilter
    ]);

    const totals = useMemo(() => {

        let credit = 0;
        let debit = 0;

        filteredTransactions.forEach(
            (transaction) => {

                const amount =
                    Number(
                        transaction.amount || 0
                    );

                const direction =
                    getDirection(transaction);

                if (direction === "Credit") {
                    credit += amount;
                } else {
                    debit += amount;
                }
            }
        );

        return {
            credit,
            debit
        };

    }, [filteredTransactions]);

    const clearFilters = () => {

        setSearch("");
        setTypeFilter("all");
        setDirectionFilter("all");
    };

    const refreshTransactions = () => {
        fetchTransactions();
    };

    return (
        <div className="admin-transactions-page">

            <div className="admin-transactions-container">

                {/* HEADER */}

                <div className="admin-transactions-header">

                    <div>
                        <h1>
                            💳 Transaction Monitoring
                        </h1>

                        <p>
                            Monitor all customer banking transactions
                        </p>
                    </div>

                    <Link
                        to="/admin-dashboard"
                        className="admin-transactions-back-btn"
                    >
                        ← Dashboard
                    </Link>

                </div>


                {/* ERROR */}

                {error && (
                    <div className="admin-transactions-error">
                        ❌ {error}
                    </div>
                )}


                {/* SUMMARY */}

                <div className="admin-transactions-summary">

                    <div className="admin-transactions-summary-card">

                        <span>
                            Total Transactions
                        </span>

                        <strong>
                            {filteredTransactions.length}
                        </strong>

                    </div>


                    <div className="admin-transactions-summary-card">

                        <span>
                            Total Credit
                        </span>

                        <strong className="admin-total-credit">
                            +₹{totals.credit.toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits: 2
                                }
                            )}
                        </strong>

                    </div>


                    <div className="admin-transactions-summary-card">

                        <span>
                            Total Debit
                        </span>

                        <strong className="admin-total-debit">
                            -₹{totals.debit.toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits: 2
                                }
                            )}
                        </strong>

                    </div>

                </div>


                {/* FILTERS */}

                <div className="admin-transactions-filter-card">

                    <div className="admin-transactions-filter-group">

                        <label>
                            Search
                        </label>

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search user, email, account or transaction..."
                        />

                    </div>


                    <div className="admin-transactions-filter-group">

                        <label>
                            Type
                        </label>

                        <select
                            value={typeFilter}
                            onChange={(e) =>
                                setTypeFilter(e.target.value)
                            }
                        >
                            <option value="all">
                                All Types
                            </option>

                            <option value="Deposit">
                                Deposit
                            </option>

                            <option value="Withdrawal">
                                Withdrawal
                            </option>

                            <option value="Transfer">
                                Transfer
                            </option>

                        </select>

                    </div>


                    <div className="admin-transactions-filter-group">

                        <label>
                            Direction
                        </label>

                        <select
                            value={directionFilter}
                            onChange={(e) =>
                                setDirectionFilter(
                                    e.target.value
                                )
                            }
                        >
                            <option value="all">
                                All
                            </option>

                            <option value="Credit">
                                Credit
                            </option>

                            <option value="Debit">
                                Debit
                            </option>

                        </select>

                    </div>


                    <button
                        className="admin-transactions-clear-btn"
                        onClick={clearFilters}
                    >
                        Clear
                    </button>


                    <button
                        className="admin-transactions-refresh-btn"
                        onClick={refreshTransactions}
                        disabled={loading}
                    >
                        {loading
                            ? "Loading..."
                            : "🔄 Refresh"}
                    </button>

                </div>


                {/* TABLE */}

                <div className="admin-transactions-card">

                    {loading ? (

                        <div className="admin-transactions-loading">
                            Loading transactions...
                        </div>

                    ) : filteredTransactions.length === 0 ? (

                        <div className="admin-transactions-empty">

                            <div className="admin-transactions-empty-icon">
                                💳
                            </div>

                            <h3>
                                No Transactions Found
                            </h3>

                            <p>
                                No transactions match your current filters.
                            </p>

                            <button
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </button>

                        </div>

                    ) : (

                        <div className="admin-transactions-table-wrapper">

                            <table className="admin-transactions-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Transaction ID
                                        </th>

                                        <th>
                                            User
                                        </th>

                                        <th>
                                            Account
                                        </th>

                                        <th>
                                            Date & Time
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
                                            Other Account
                                        </th>

                                        <th>
                                            Balance After
                                        </th>

                                        <th>
                                            Description
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredTransactions.map(
                                        (transaction) => {

                                            const user =
                                                transaction.user || {};

                                            const direction =
                                                getDirection(
                                                    transaction
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        transaction._id
                                                    }
                                                >

                                                    <td>
                                                        <span className="admin-transaction-id">
                                                            {
                                                                transaction.transactionId ||
                                                                "N/A"
                                                            }
                                                        </span>
                                                    </td>


                                                    <td>

                                                        <div className="admin-transaction-user">

                                                            <strong>
                                                                {user.name || "-"}
                                                            </strong>

                                                            <span>
                                                                {user.email || "-"}
                                                            </span>

                                                        </div>

                                                    </td>


                                                    <td>
                                                        {
                                                            user.accountNumber ||
                                                            "-"
                                                        }
                                                    </td>


                                                    <td>
                                                        {formatDate(
                                                            transaction.createdAt
                                                        )}
                                                    </td>


                                                    <td>

                                                        <span
                                                            className={
                                                                `admin-transaction-type ${transaction.type?.toLowerCase()}`
                                                            }
                                                        >
                                                            {
                                                                transaction.type ||
                                                                "-"
                                                            }
                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={
                                                                direction === "Credit"
                                                                    ? "admin-transaction-direction-credit"
                                                                    : "admin-transaction-direction-debit"
                                                            }
                                                        >
                                                            {direction}
                                                        </span>

                                                    </td>


                                                    <td>

                                                        <strong
                                                            className={
                                                                direction === "Credit"
                                                                    ? "admin-credit-amount"
                                                                    : "admin-debit-amount"
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
                                                        {
                                                            transaction.otherAccountNumber ||
                                                            "-"
                                                        }
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


                                                    <td>
                                                        {
                                                            transaction.description ||
                                                            "-"
                                                        }
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


                {/* BOTTOM LINK */}

                <div className="admin-transactions-bottom-links">

                    <Link to="/admin-dashboard">
                        ← Back to Admin Dashboard
                    </Link>

                </div>


                <p className="admin-transactions-footer">
                    © 2026 MyBank Admin Panel
                </p>

            </div>

        </div>
    );
}

export default AdminTransactions;
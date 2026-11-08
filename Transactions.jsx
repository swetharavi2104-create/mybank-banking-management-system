import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Transactions() {

    const navigate = useNavigate();

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [directionFilter, setDirectionFilter] = useState("all");

    const [error, setError] = useState("");

    const getToken = () => {
        return localStorage.getItem("token");
    };

    const fetchTransactions = async () => {

        try {

            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.get(
                "http://localhost:5000/api/account/transactions",
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
                "Transactions Error:",
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

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }

        return parsedDate.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getTransactionDirection = (transaction) => {

        if (transaction.direction) {
            return transaction.direction;
        }

        if (transaction.type === "Deposit") {
            return "Credit";
        }

        return "Debit";
    };

    const getOtherAccountText = (transaction) => {

        if (
            transaction.otherAccountNumber
        ) {
            return transaction.otherAccountNumber;
        }

        return "-";
    };

    const filteredTransactions =
        transactions.filter((transaction) => {

            const searchText =
                search.trim().toLowerCase();

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

            const matchesSearch =
                !searchText ||
                transactionId.includes(searchText) ||
                type.includes(searchText) ||
                description.includes(searchText) ||
                otherAccount.includes(searchText);

            const matchesType =
                typeFilter === "all" ||
                transaction.type === typeFilter;

            const direction =
                getTransactionDirection(transaction);

            const matchesDirection =
                directionFilter === "all" ||
                direction === directionFilter;

            return (
                matchesSearch &&
                matchesType &&
                matchesDirection
            );
        });

    const clearFilters = () => {

        setSearch("");
        setTypeFilter("all");
        setDirectionFilter("all");
    };

    const viewReceipt = (transaction) => {

        sessionStorage.setItem(
            "selectedTransaction",
            JSON.stringify(transaction)
        );

        navigate("/transaction-receipt");
    };

    return (
        <div className="transactions-page">

            <div className="transactions-container">

                {/* HEADER */}

                <div className="transactions-header">

                    <div>
                        <h1>
                            🧾 Transaction History
                        </h1>

                        <p>
                            View and manage your banking transactions
                        </p>
                    </div>

                    <Link
                        to="/dashboard"
                        className="transactions-back-btn"
                    >
                        ← Dashboard
                    </Link>

                </div>


                {/* ERROR */}

                {error && (
                    <div className="transactions-error">
                        ❌ {error}
                    </div>
                )}


                {/* FILTERS */}

                <div className="transactions-filter-card">

                    <div className="transactions-search-box">

                        <label htmlFor="transaction-search">
                            Search
                        </label>

                        <input
                            id="transaction-search"
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search transaction ID, description or account..."
                        />

                    </div>


                    <div className="transactions-filter-box">

                        <label htmlFor="transaction-type">
                            Transaction Type
                        </label>

                        <select
                            id="transaction-type"
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


                    <div className="transactions-filter-box">

                        <label htmlFor="transaction-direction">
                            Direction
                        </label>

                        <select
                            id="transaction-direction"
                            value={directionFilter}
                            onChange={(e) =>
                                setDirectionFilter(e.target.value)
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
                        className="transactions-clear-btn"
                        onClick={clearFilters}
                    >
                        Clear Filters
                    </button>

                </div>


                {/* SUMMARY */}

                <div className="transactions-summary">

                    <div className="transactions-summary-item">
                        <span>
                            Total Transactions
                        </span>

                        <strong>
                            {transactions.length}
                        </strong>
                    </div>

                    <div className="transactions-summary-item">
                        <span>
                            Showing
                        </span>

                        <strong>
                            {filteredTransactions.length}
                        </strong>
                    </div>

                </div>


                {/* TABLE */}

                <div className="transactions-card">

                    {loading ? (

                        <div className="transactions-loading">
                            Loading transactions...
                        </div>

                    ) : filteredTransactions.length === 0 ? (

                        <div className="transactions-empty">

                            <div className="transactions-empty-icon">
                                🧾
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

                        <div className="transactions-table-wrapper">

                            <table className="transactions-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Transaction ID
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

                                        <th>
                                            Receipt
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredTransactions.map(
                                        (transaction) => {

                                            const direction =
                                                getTransactionDirection(
                                                    transaction
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        transaction._id ||
                                                        transaction.transactionId
                                                    }
                                                >

                                                    <td>
                                                        <span className="transaction-id">
                                                            {
                                                                transaction.transactionId ||
                                                                "N/A"
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {formatDate(
                                                            transaction.createdAt
                                                        )}
                                                    </td>

                                                    <td>

                                                        <span
                                                            className={
                                                                `transaction-type ${transaction.type?.toLowerCase()}`
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
                                                                    ? "transaction-credit"
                                                                    : "transaction-debit"
                                                            }
                                                        >
                                                            {direction}
                                                        </span>

                                                    </td>

                                                    <td>

                                                        <strong
                                                            className={
                                                                direction === "Credit"
                                                                    ? "transaction-amount-credit"
                                                                    : "transaction-amount-debit"
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
                                                        {getOtherAccountText(
                                                            transaction
                                                        )}
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

                                                    <td>

                                                        <button
                                                            className="transaction-receipt-btn"
                                                            onClick={() =>
                                                                viewReceipt(
                                                                    transaction
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>

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


                {/* LINKS */}

                <div className="transactions-bottom-links">

                    <Link to="/deposit">
                        💰 Deposit
                    </Link>

                    <Link to="/withdraw">
                        💸 Withdraw
                    </Link>

                    <Link to="/transfer">
                        🔄 Transfer
                    </Link>

                    <Link to="/statement">
                        📄 Statement
                    </Link>

                </div>


                <p className="transactions-footer">
                    © 2026 MyBank. Secure Banking System.
                </p>

            </div>

        </div>
    );
}

export default Transactions;
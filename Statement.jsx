import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Statement() {

    const navigate = useNavigate();

    const [transactions, setTransactions] = useState([]);
    const [account, setAccount] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    const getToken = () => {
        return localStorage.getItem("token");
    };

    const loadStatement = async () => {

        try {

            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const [transactionResponse, accountResponse] =
                await Promise.all([
                    axios.get(
                        "http://localhost:5000/api/account/transactions",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    ),

                    axios.get(
                        "http://localhost:5000/api/account/me",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    )
                ]);

            if (
                transactionResponse.data.success
            ) {
                setTransactions(
                    transactionResponse.data.transactions || []
                );
            }

            if (
                accountResponse.data.success
            ) {
                setAccount(
                    accountResponse.data.user
                );

                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        accountResponse.data.user
                    )
                );
            }

        } catch (error) {

            console.log(
                "Statement Error:",
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
                "Unable to load account statement."
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        loadStatement();
    }, []);

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        const parsedDate = new Date(date);

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

        return transaction.type === "Deposit"
            ? "Credit"
            : "Debit";
    };

    const filteredTransactions = useMemo(() => {

        const searchText =
            search.trim().toLowerCase();

        return transactions.filter(
            (transaction) => {

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

                return (
                    matchesSearch &&
                    matchesType
                );
            }
        );

    }, [
        transactions,
        search,
        typeFilter
    ]);

    const totals = useMemo(() => {

        let totalCredit = 0;
        let totalDebit = 0;

        filteredTransactions.forEach(
            (transaction) => {

                const amount =
                    Number(
                        transaction.amount || 0
                    );

                const direction =
                    getDirection(transaction);

                if (direction === "Credit") {
                    totalCredit += amount;
                } else {
                    totalDebit += amount;
                }
            }
        );

        return {
            totalCredit,
            totalDebit
        };

    }, [filteredTransactions]);

    const downloadCSV = () => {

        if (filteredTransactions.length === 0) {
            alert(
                "There are no transactions to download."
            );
            return;
        }

        const headers = [
            "Transaction ID",
            "Date",
            "Type",
            "Direction",
            "Amount",
            "Other Account",
            "Balance After",
            "Description"
        ];

        const rows =
            filteredTransactions.map(
                (transaction) => {

                    const direction =
                        getDirection(transaction);

                    return [
                        transaction.transactionId || "N/A",
                        formatDate(
                            transaction.createdAt
                        ),
                        transaction.type || "",
                        direction,
                        transaction.amount || 0,
                        transaction.otherAccountNumber || "",
                        transaction.balanceAfter || 0,
                        transaction.description || ""
                    ];
                }
            );

        const csvData = [
            headers,
            ...rows
        ]
            .map((row) =>
                row
                    .map((value) => {
                        const text =
                            String(value)
                                .replace(/"/g, '""');

                        return `"${text}"`;
                    })
                    .join(",")
            )
            .join("\n");

        const blob = new Blob(
            [csvData],
            {
                type: "text/csv;charset=utf-8;"
            }
        );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "mybank-account-statement.csv";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    const clearFilters = () => {
        setSearch("");
        setTypeFilter("all");
    };

    const printStatement = () => {
        window.print();
    };

    if (loading) {

        return (
            <div className="statement-loading-page">

                <div className="statement-loading-card">
                    Loading account statement...
                </div>

            </div>
        );
    }

    return (
        <div className="statement-page">

            <div className="statement-container">

                {/* HEADER */}

                <div className="statement-header no-print">

                    <div>
                        <h1>
                            📄 Account Statement
                        </h1>

                        <p>
                            View and download your banking statement
                        </p>
                    </div>

                    <Link
                        to="/dashboard"
                        className="statement-back-btn"
                    >
                        ← Dashboard
                    </Link>

                </div>


                {/* ERROR */}

                {error && (
                    <div className="statement-error no-print">
                        ❌ {error}
                    </div>
                )}


                {/* ACCOUNT SUMMARY */}

                {account && (
                    <div className="statement-account-card">

                        <div>
                            <span>
                                Account Holder
                            </span>

                            <strong>
                                {account.name || "-"}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Account Number
                            </span>

                            <strong>
                                {account.accountNumber || "-"}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Current Balance
                            </span>

                            <strong>
                                ₹{Number(
                                    account.balance || 0
                                ).toLocaleString(
                                    "en-IN",
                                    {
                                        minimumFractionDigits: 2
                                    }
                                )}
                            </strong>
                        </div>

                    </div>
                )}


                {/* SUMMARY CARDS */}

                <div className="statement-summary-grid">

                    <div className="statement-summary-card">

                        <span>
                            Total Transactions
                        </span>

                        <strong>
                            {filteredTransactions.length}
                        </strong>

                    </div>

                    <div className="statement-summary-card credit-summary">

                        <span>
                            Total Credit
                        </span>

                        <strong>
                            +₹{totals.totalCredit.toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits: 2
                                }
                            )}
                        </strong>

                    </div>

                    <div className="statement-summary-card debit-summary">

                        <span>
                            Total Debit
                        </span>

                        <strong>
                            -₹{totals.totalDebit.toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits: 2
                                }
                            )}
                        </strong>

                    </div>

                </div>


                {/* FILTERS */}

                <div className="statement-filter-card no-print">

                    <div className="statement-filter-group">

                        <label>
                            Search
                        </label>

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search transaction..."
                        />

                    </div>


                    <div className="statement-filter-group">

                        <label>
                            Transaction Type
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


                    <button
                        className="statement-clear-btn"
                        onClick={clearFilters}
                    >
                        Clear
                    </button>


                    <button
                        className="statement-download-btn"
                        onClick={downloadCSV}
                    >
                        ⬇️ Download CSV
                    </button>


                    <button
                        className="statement-print-btn"
                        onClick={printStatement}
                    >
                        🖨️ Print
                    </button>

                </div>


                {/* STATEMENT TABLE */}

                <div className="statement-card">

                    <div className="statement-title-row">

                        <h2>
                            Transaction Statement
                        </h2>

                        <span>
                            {filteredTransactions.length} records
                        </span>

                    </div>


                    {filteredTransactions.length === 0 ? (

                        <div className="statement-empty">

                            <div className="statement-empty-icon">
                                📄
                            </div>

                            <h3>
                                No Transactions Found
                            </h3>

                            <p>
                                There are no transactions matching your current filters.
                            </p>

                        </div>

                    ) : (

                        <div className="statement-table-wrapper">

                            <table className="statement-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Transaction ID
                                        </th>

                                        <th>
                                            Type
                                        </th>

                                        <th>
                                            Credit
                                        </th>

                                        <th>
                                            Debit
                                        </th>

                                        <th>
                                            Balance
                                        </th>

                                        <th>
                                            Description
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredTransactions.map(
                                        (transaction) => {

                                            const direction =
                                                getDirection(
                                                    transaction
                                                );

                                            const amount =
                                                Number(
                                                    transaction.amount ||
                                                    0
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        transaction._id ||
                                                        transaction.transactionId
                                                    }
                                                >

                                                    <td>
                                                        {formatDate(
                                                            transaction.createdAt
                                                        )}
                                                    </td>

                                                    <td>
                                                        <span className="statement-transaction-id">
                                                            {transaction.transactionId ||
                                                                "N/A"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={
                                                                `statement-type ${transaction.type?.toLowerCase()}`
                                                            }
                                                        >
                                                            {transaction.type ||
                                                                "-"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {direction === "Credit" ? (
                                                            <strong className="statement-credit">
                                                                +₹{amount.toLocaleString(
                                                                    "en-IN",
                                                                    {
                                                                        minimumFractionDigits: 2
                                                                    }
                                                                )}
                                                            </strong>
                                                        ) : (
                                                            <span className="statement-dash">
                                                                -
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td>
                                                        {direction === "Debit" ? (
                                                            <strong className="statement-debit">
                                                                -₹{amount.toLocaleString(
                                                                    "en-IN",
                                                                    {
                                                                        minimumFractionDigits: 2
                                                                    }
                                                                )}
                                                            </strong>
                                                        ) : (
                                                            <span className="statement-dash">
                                                                -
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td>
                                                        ₹{Number(
                                                            transaction.balanceAfter ||
                                                            0
                                                        ).toLocaleString(
                                                            "en-IN",
                                                            {
                                                                minimumFractionDigits: 2
                                                            }
                                                        )}
                                                    </td>

                                                    <td>
                                                        {transaction.description ||
                                                            "-"}
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


                {/* FOOTER LINKS */}

                <div className="statement-bottom-links no-print">

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


                <p className="statement-footer no-print">
                    © 2026 MyBank. Secure Banking System.
                </p>

            </div>

        </div>
    );
}

export default Statement;
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function TransactionReceipt() {

    const navigate = useNavigate();

    const [transaction, setTransaction] = useState(null);

    useEffect(() => {

        const savedTransaction =
            sessionStorage.getItem(
                "selectedTransaction"
            );

        if (!savedTransaction) {
            navigate("/transactions");
            return;
        }

        try {

            const parsedTransaction =
                JSON.parse(savedTransaction);

            setTransaction(parsedTransaction);

        } catch (error) {

            console.log(
                "Receipt Data Error:",
                error.message
            );

            sessionStorage.removeItem(
                "selectedTransaction"
            );

            navigate("/transactions");
        }

    }, [navigate]);

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
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };

    const getDirection = () => {

        if (transaction?.direction) {
            return transaction.direction;
        }

        if (
            transaction?.type === "Deposit"
        ) {
            return "Credit";
        }

        return "Debit";
    };

    const printReceipt = () => {
        window.print();
    };

    if (!transaction) {

        return (
            <div className="receipt-loading-page">

                <div className="receipt-loading-card">
                    Loading receipt...
                </div>

            </div>
        );
    }

    const direction = getDirection();

    return (
        <div className="receipt-page">

            <div className="receipt-container">

                {/* HEADER */}

                <div className="receipt-top-bar">

                    <Link
                        to="/transactions"
                        className="receipt-back-btn no-print"
                    >
                        ← Transactions
                    </Link>

                    <button
                        className="receipt-print-btn no-print"
                        onClick={printReceipt}
                    >
                        🖨️ Print Receipt
                    </button>

                </div>


                {/* RECEIPT */}

                <div className="receipt-card">

                    {/* BANK HEADER */}

                    <div className="receipt-bank-header">

                        <div className="receipt-bank-icon">
                            🏦
                        </div>

                        <h1>
                            MyBank
                        </h1>

                        <p>
                            Banking Management System
                        </p>

                    </div>


                    <div className="receipt-divider" />


                    {/* TITLE */}

                    <div className="receipt-title-section">

                        <h2>
                            Transaction Receipt
                        </h2>

                        <span
                            className={
                                direction === "Credit"
                                    ? "receipt-success-badge"
                                    : "receipt-debit-badge"
                            }
                        >
                            {direction}
                        </span>

                    </div>


                    {/* AMOUNT */}

                    <div className="receipt-amount-section">

                        <span>
                            Transaction Amount
                        </span>

                        <h3
                            className={
                                direction === "Credit"
                                    ? "receipt-credit-amount"
                                    : "receipt-debit-amount"
                            }
                        >
                            {direction === "Credit"
                                ? "+"
                                : "-"
                            }₹{Number(
                                transaction.amount || 0
                            ).toLocaleString(
                                "en-IN",
                                {
                                    minimumFractionDigits:
                                        2,
                                    maximumFractionDigits:
                                        2
                                }
                            )}
                        </h3>

                    </div>


                    {/* DETAILS */}

                    <div className="receipt-details">

                        <div className="receipt-row">

                            <span>
                                Transaction ID
                            </span>

                            <strong>
                                {transaction.transactionId ||
                                    "N/A"}
                            </strong>

                        </div>


                        <div className="receipt-row">

                            <span>
                                Date & Time
                            </span>

                            <strong>
                                {formatDate(
                                    transaction.createdAt
                                )}
                            </strong>

                        </div>


                        <div className="receipt-row">

                            <span>
                                Transaction Type
                            </span>

                            <strong>
                                {transaction.type ||
                                    "-"}
                            </strong>

                        </div>


                        <div className="receipt-row">

                            <span>
                                Direction
                            </span>

                            <strong>
                                {direction}
                            </strong>

                        </div>


                        {transaction.otherAccountNumber && (
                            <div className="receipt-row">

                                <span>
                                    Other Account
                                </span>

                                <strong>
                                    {
                                        transaction.otherAccountNumber
                                    }
                                </strong>

                            </div>
                        )}


                        <div className="receipt-row">

                            <span>
                                Balance After
                            </span>

                            <strong>
                                ₹{Number(
                                    transaction.balanceAfter ||
                                    0
                                ).toLocaleString(
                                    "en-IN",
                                    {
                                        minimumFractionDigits:
                                            2,
                                        maximumFractionDigits:
                                            2
                                    }
                                )}
                            </strong>

                        </div>


                        {transaction.description && (
                            <div className="receipt-row">

                                <span>
                                    Description
                                </span>

                                <strong>
                                    {
                                        transaction.description
                                    }
                                </strong>

                            </div>
                        )}

                    </div>


                    {/* STATUS */}

                    <div className="receipt-status-box">

                        <span>
                            Transaction Status
                        </span>

                        <strong>
                            ✅ Successful
                        </strong>

                    </div>


                    {/* FOOTER */}

                    <div className="receipt-note">

                        <p>
                            This is a system-generated transaction receipt.
                        </p>

                        <p>
                            Please keep this receipt for your records.
                        </p>

                    </div>

                </div>


                {/* BOTTOM LINKS */}

                <div className="receipt-bottom-actions no-print">

                    <Link to="/dashboard">
                        Dashboard
                    </Link>

                    <Link to="/transactions">
                        Transaction History
                    </Link>

                    <Link to="/statement">
                        Account Statement
                    </Link>

                </div>


                <p className="receipt-footer no-print">
                    © 2026 MyBank. Secure Banking System.
                </p>

            </div>

        </div>
    );
}

export default TransactionReceipt;
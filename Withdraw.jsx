import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Withdraw() {

    const navigate = useNavigate();

    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [transaction, setTransaction] = useState(null);

    const handleAmountChange = (e) => {

        const value = e.target.value;

        if (/^\d*\.?\d*$/.test(value)) {
            setAmount(value);
        }

        setError("");
        setSuccess("");
        setTransaction(null);
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");
        setTransaction(null);

        const numericAmount = Number(amount);

        if (!amount || numericAmount <= 0) {
            setError(
                "Please enter a valid withdrawal amount."
            );
            return;
        }

        if (!Number.isFinite(numericAmount)) {
            setError(
                "Please enter a valid amount."
            );
            return;
        }

        try {

            setLoading(true);

            const token =
                localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.post(
                "http://localhost:5000/api/account/withdraw",
                {
                    amount: numericAmount
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
                    "Money withdrawn successfully."
                );

                setTransaction(
                    response.data.transaction || null
                );

                setAmount("");

                // Update local user balance
                const storedUser =
                    localStorage.getItem("user");

                if (storedUser) {

                    const user =
                        JSON.parse(storedUser);

                    user.balance =
                        response.data.balance ??
                        response.data.user?.balance ??
                        response.data.transaction?.balanceAfter ??
                        user.balance;

                    localStorage.setItem(
                        "user",
                        JSON.stringify(user)
                    );
                }
            }

        } catch (error) {

            console.log(
                "Withdraw Error:",
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
                "Unable to withdraw money."
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="withdraw-page">

            <div className="withdraw-container">

                {/* HEADER */}

                <div className="withdraw-header">

                    <div>
                        <h1>
                            💸 Withdraw Money
                        </h1>

                        <p>
                            Withdraw money securely from your bank account
                        </p>
                    </div>

                    <Link
                        to="/dashboard"
                        className="withdraw-back-btn"
                    >
                        ← Dashboard
                    </Link>

                </div>


                {/* CARD */}

                <div className="withdraw-card">

                    <div className="withdraw-icon">
                        💸
                    </div>

                    <h2>
                        Make a Withdrawal
                    </h2>

                    <p className="withdraw-subtitle">
                        Enter the amount you want to withdraw
                    </p>


                    {/* ERROR */}

                    {error && (
                        <div className="withdraw-error">
                            ❌ {error}
                        </div>
                    )}


                    {/* SUCCESS */}

                    {success && (
                        <div className="withdraw-success">
                            ✅ {success}
                        </div>
                    )}


                    <form onSubmit={handleSubmit}>

                        <div className="withdraw-form-group">

                            <label htmlFor="withdrawAmount">
                                Withdrawal Amount
                            </label>

                            <div className="withdraw-input-wrapper">

                                <span>
                                    ₹
                                </span>

                                <input
                                    id="withdrawAmount"
                                    type="text"
                                    inputMode="decimal"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    placeholder="Enter amount"
                                    disabled={loading}
                                />

                            </div>

                        </div>


                        <button
                            type="submit"
                            className="withdraw-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Processing Withdrawal..."
                                : "Withdraw Money"}
                        </button>

                    </form>


                    {/* TRANSACTION RESULT */}

                    {transaction && (
                        <div className="withdraw-result">

                            <h3>
                                Withdrawal Successful
                            </h3>

                            {transaction.transactionId && (
                                <div className="withdraw-result-row">

                                    <span>
                                        Transaction ID
                                    </span>

                                    <strong>
                                        {transaction.transactionId}
                                    </strong>

                                </div>
                            )}

                            {transaction.amount !== undefined && (
                                <div className="withdraw-result-row">

                                    <span>
                                        Withdrawn Amount
                                    </span>

                                    <strong>
                                        ₹{Number(
                                            transaction.amount
                                        ).toLocaleString("en-IN")}
                                    </strong>

                                </div>
                            )}

                            {transaction.balanceAfter !== undefined && (
                                <div className="withdraw-result-row">

                                    <span>
                                        Remaining Balance
                                    </span>

                                    <strong>
                                        ₹{Number(
                                            transaction.balanceAfter
                                        ).toLocaleString("en-IN")}
                                    </strong>

                                </div>
                            )}

                        </div>
                    )}


                    {/* LINKS */}

                    <div className="withdraw-links">

                        <Link to="/balance">
                            📊 Check Balance
                        </Link>

                        <Link to="/transactions">
                            🧾 View Transactions
                        </Link>

                    </div>

                </div>


                <p className="withdraw-footer">
                    © 2026 MyBank. Secure Banking System.
                </p>

            </div>

        </div>
    );
}

export default Withdraw;
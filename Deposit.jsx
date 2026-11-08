import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Deposit() {

    const navigate = useNavigate();

    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [transaction, setTransaction] = useState(null);

    const handleAmountChange = (e) => {

        const value = e.target.value;

        // Allow only numbers and decimal point
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
                "Please enter a valid deposit amount."
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
                "http://localhost:5000/api/account/deposit",
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
                    "Money deposited successfully."
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
                        user.balance;

                    localStorage.setItem(
                        "user",
                        JSON.stringify(user)
                    );
                }
            }

        } catch (error) {

            console.log(
                "Deposit Error:",
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
                "Unable to deposit money."
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="deposit-page">

            <div className="deposit-container">

                {/* HEADER */}

                <div className="deposit-header">

                    <div>
                        <h1>
                            💰 Deposit Money
                        </h1>

                        <p>
                            Add money securely to your bank account
                        </p>
                    </div>

                    <Link
                        to="/dashboard"
                        className="deposit-back-btn"
                    >
                        ← Dashboard
                    </Link>

                </div>


                {/* CARD */}

                <div className="deposit-card">

                    <div className="deposit-icon">
                        💰
                    </div>

                    <h2>
                        Make a Deposit
                    </h2>

                    <p className="deposit-subtitle">
                        Enter the amount you want to add to your account
                    </p>


                    {/* ERROR */}

                    {error && (
                        <div className="deposit-error">
                            ❌ {error}
                        </div>
                    )}


                    {/* SUCCESS */}

                    {success && (
                        <div className="deposit-success">
                            ✅ {success}
                        </div>
                    )}


                    <form onSubmit={handleSubmit}>

                        <div className="deposit-form-group">

                            <label htmlFor="depositAmount">
                                Deposit Amount
                            </label>

                            <div className="deposit-input-wrapper">

                                <span>
                                    ₹
                                </span>

                                <input
                                    id="depositAmount"
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
                            className="deposit-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Processing Deposit..."
                                : "Deposit Money"}
                        </button>

                    </form>


                    {/* TRANSACTION RESULT */}

                    {transaction && (
                        <div className="deposit-result">

                            <h3>
                                Transaction Successful
                            </h3>

                            {transaction.transactionId && (
                                <div className="deposit-result-row">

                                    <span>
                                        Transaction ID
                                    </span>

                                    <strong>
                                        {transaction.transactionId}
                                    </strong>

                                </div>
                            )}

                            {transaction.amount !== undefined && (
                                <div className="deposit-result-row">

                                    <span>
                                        Deposited Amount
                                    </span>

                                    <strong>
                                        ₹{Number(
                                            transaction.amount
                                        ).toLocaleString("en-IN")}
                                    </strong>

                                </div>
                            )}

                            {transaction.balanceAfter !== undefined && (
                                <div className="deposit-result-row">

                                    <span>
                                        New Balance
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


                    {/* TRANSACTION HISTORY */}

                    <div className="deposit-links">

                        <Link to="/transactions">
                            🧾 View Transactions
                        </Link>

                        <Link to="/balance">
                            📊 Check Balance
                        </Link>

                    </div>

                </div>


                <p className="deposit-footer">
                    © 2026 MyBank. Secure Banking System.
                </p>

            </div>

        </div>
    );
}

export default Deposit;
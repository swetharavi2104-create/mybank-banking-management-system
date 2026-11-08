import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Transfer() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        accountNumber: "",
        amount: "",
        description: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [transaction, setTransaction] = useState(null);

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setError("");
        setSuccess("");
        setTransaction(null);
    };

    const handleAmountChange = (e) => {

        const value = e.target.value;

        if (/^\d*\.?\d*$/.test(value)) {

            setFormData((prev) => ({
                ...prev,
                amount: value
            }));

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

        const accountNumber =
            formData.accountNumber.trim();

        const numericAmount =
            Number(formData.amount);

        const description =
            formData.description.trim();

        if (!accountNumber) {
            setError(
                "Please enter the receiver account number."
            );
            return;
        }

        if (!formData.amount || numericAmount <= 0) {
            setError(
                "Please enter a valid transfer amount."
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
                "http://localhost:5000/api/account/transfer",
                {
                    accountNumber,
                    amount: numericAmount,
                    description
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
                    "Money transferred successfully."
                );

                const transferTransaction =
                    response.data.transaction ||
                    response.data.senderTransaction ||
                    null;

                setTransaction(
                    transferTransaction
                );

                setFormData({
                    accountNumber: "",
                    amount: "",
                    description: ""
                });

                // Update local balance
                const storedUser =
                    localStorage.getItem("user");

                if (storedUser) {

                    try {

                        const user =
                            JSON.parse(storedUser);

                        user.balance =
                            response.data.balance ??
                            response.data.senderBalance ??
                            response.data.user?.balance ??
                            response.data.transaction?.balanceAfter ??
                            response.data.senderTransaction?.balanceAfter ??
                            user.balance;

                        localStorage.setItem(
                            "user",
                            JSON.stringify(user)
                        );

                    } catch (storageError) {

                        console.log(
                            "Local User Update Error:",
                            storageError.message
                        );
                    }
                }
            }

        } catch (error) {

            console.log(
                "Transfer Error:",
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
                "Unable to transfer money."
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="transfer-page">

            <div className="transfer-container">

                {/* HEADER */}

                <div className="transfer-header">

                    <div>
                        <h1>
                            🔄 Money Transfer
                        </h1>

                        <p>
                            Transfer money securely to another bank account
                        </p>
                    </div>

                    <Link
                        to="/dashboard"
                        className="transfer-back-btn"
                    >
                        ← Dashboard
                    </Link>

                </div>


                {/* TRANSFER CARD */}

                <div className="transfer-card">

                    <div className="transfer-icon">
                        🔄
                    </div>

                    <h2>
                        Send Money
                    </h2>

                    <p className="transfer-subtitle">
                        Enter the receiver details and transfer amount
                    </p>


                    {/* ERROR */}

                    {error && (
                        <div className="transfer-error">
                            ❌ {error}
                        </div>
                    )}


                    {/* SUCCESS */}

                    {success && (
                        <div className="transfer-success">
                            ✅ {success}
                        </div>
                    )}


                    <form onSubmit={handleSubmit}>

                        {/* ACCOUNT NUMBER */}

                        <div className="transfer-form-group">

                            <label htmlFor="accountNumber">
                                Receiver Account Number
                            </label>

                            <input
                                id="accountNumber"
                                type="text"
                                name="accountNumber"
                                value={
                                    formData.accountNumber
                                }
                                onChange={handleChange}
                                placeholder="Example: BANK12345678"
                                disabled={loading}
                            />

                        </div>


                        {/* AMOUNT */}

                        <div className="transfer-form-group">

                            <label htmlFor="transferAmount">
                                Transfer Amount
                            </label>

                            <div className="transfer-input-wrapper">

                                <span>
                                    ₹
                                </span>

                                <input
                                    id="transferAmount"
                                    type="text"
                                    inputMode="decimal"
                                    value={
                                        formData.amount
                                    }
                                    onChange={handleAmountChange}
                                    placeholder="Enter amount"
                                    disabled={loading}
                                />

                            </div>

                        </div>


                        {/* DESCRIPTION */}

                        <div className="transfer-form-group">

                            <label htmlFor="description">
                                Description
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                value={
                                    formData.description
                                }
                                onChange={handleChange}
                                placeholder="Example: Monthly payment"
                                rows="3"
                                maxLength="200"
                                disabled={loading}
                            />

                        </div>


                        {/* BUTTON */}

                        <button
                            type="submit"
                            className="transfer-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Processing Transfer..."
                                : "Transfer Money"}
                        </button>

                    </form>


                    {/* RESULT */}

                    {transaction && (
                        <div className="transfer-result">

                            <h3>
                                Transfer Successful
                            </h3>

                            {transaction.transactionId && (
                                <div className="transfer-result-row">

                                    <span>
                                        Transaction ID
                                    </span>

                                    <strong>
                                        {
                                            transaction.transactionId
                                        }
                                    </strong>

                                </div>
                            )}

                            {transaction.otherAccountNumber && (
                                <div className="transfer-result-row">

                                    <span>
                                        Receiver Account
                                    </span>

                                    <strong>
                                        {
                                            transaction.otherAccountNumber
                                        }
                                    </strong>

                                </div>
                            )}

                            {transaction.amount !== undefined && (
                                <div className="transfer-result-row">

                                    <span>
                                        Transfer Amount
                                    </span>

                                    <strong>
                                        ₹{Number(
                                            transaction.amount
                                        ).toLocaleString("en-IN")}
                                    </strong>

                                </div>
                            )}

                            {transaction.balanceAfter !== undefined && (
                                <div className="transfer-result-row">

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

                            {transaction.description && (
                                <div className="transfer-result-row">

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
                    )}


                    {/* LINKS */}

                    <div className="transfer-links">

                        <Link to="/balance">
                            📊 Check Balance
                        </Link>

                        <Link to="/transactions">
                            🧾 View Transactions
                        </Link>

                    </div>

                </div>


                <p className="transfer-footer">
                    © 2026 MyBank. Secure Banking System.
                </p>

            </div>

        </div>
    );
}

export default Transfer;
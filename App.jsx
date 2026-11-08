import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";
import "./App.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AdminLogin from "./pages/AdminLogin";

import Dashboard from "./pages/Dashboard";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import Balance from "./pages/Balance";
import Transfer from "./pages/Transfer";
import Transactions from "./pages/Transactions";
import TransactionReceipt from "./pages/TransactionReceipt";
import Statement from "./pages/Statement";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUserDetails from "./pages/AdminUserDetails";
import AdminTransactions from "./pages/AdminTransactions";
import AdminCreateUser from "./pages/AdminCreateUser";
import AdminEditUser from "./pages/AdminEditUser";

import ProtectedRoute from "./ProtectedRoute";
import AdminProtectedRoute from "./AdminProtectedRoute";


function App() {

    return (
        <BrowserRouter>

            <Routes>

                {/* =====================================
                    USER AUTH ROUTES
                ===================================== */}

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />


                {/* =====================================
                    ADMIN LOGIN
                ===================================== */}

                <Route
                    path="/admin-login"
                    element={<AdminLogin />}
                />


                {/* =====================================
                    USER PROTECTED ROUTES
                ===================================== */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/deposit"
                    element={
                        <ProtectedRoute>
                            <Deposit />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/withdraw"
                    element={
                        <ProtectedRoute>
                            <Withdraw />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/transfer"
                    element={
                        <ProtectedRoute>
                            <Transfer />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/balance"
                    element={
                        <ProtectedRoute>
                            <Balance />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/transactions"
                    element={
                        <ProtectedRoute>
                            <Transactions />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/transaction-receipt"
                    element={
                        <ProtectedRoute>
                            <TransactionReceipt />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/statement"
                    element={
                        <ProtectedRoute>
                            <Statement />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/change-password"
                    element={
                        <ProtectedRoute>
                            <ChangePassword />
                        </ProtectedRoute>
                    }
                />


                {/* =====================================
                    ADMIN PROTECTED ROUTES
                ===================================== */}

                <Route
                    path="/admin-dashboard"
                    element={
                        <AdminProtectedRoute>
                            <AdminDashboard />
                        </AdminProtectedRoute>
                    }
                />

                <Route
                    path="/admin-user/:id"
                    element={
                        <AdminProtectedRoute>
                            <AdminUserDetails />
                        </AdminProtectedRoute>
                    }
                />

                <Route
                    path="/admin-edit-user/:id"
                    element={
                        <AdminProtectedRoute>
                            <AdminEditUser />
                        </AdminProtectedRoute>
                    }
                />

                <Route
                    path="/admin-transactions"
                    element={
                        <AdminProtectedRoute>
                            <AdminTransactions />
                        </AdminProtectedRoute>
                    }
                />

                <Route
                    path="/admin-create-user"
                    element={
                        <AdminProtectedRoute>
                            <AdminCreateUser />
                        </AdminProtectedRoute>
                    }
                />


                {/* =====================================
                    404 PAGE
                ===================================== */}

                <Route
                    path="*"
                    element={
                        <div
                            style={{
                                textAlign: "center",
                                marginTop: "100px"
                            }}
                        >
                            <h1>
                                404
                            </h1>

                            <h2>
                                Page Not Found
                            </h2>

                            <p>
                                The page you are looking for
                                does not exist.
                            </p>
                        </div>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;
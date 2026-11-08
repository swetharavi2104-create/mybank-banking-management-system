import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminDashboard() {

    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const getToken = () => {
        return localStorage.getItem("adminToken");
    };

    const fetchUsers = async () => {
        try {

            const token = getToken();

            if (!token) {
                navigate("/admin-login");
                return;
            }

            const response = await axios.get(
                "http://localhost:5000/api/admin/users",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setUsers(response.data.users);
            }

        } catch (error) {

            console.log(
                "Fetch Users Error:",
                error.response?.data || error.message
            );

            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminUser");

                navigate("/admin-login");
            }

        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {

            const token = getToken();

            if (!token) {
                return;
            }

            const response = await axios.get(
                "http://localhost:5000/api/admin/stats",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setStats(response.data.stats);
            }

        } catch (error) {

            console.log(
                "Fetch Stats Error:",
                error.response?.data || error.message
            );

        }
    };

    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, []);

    const refreshDashboard = () => {
        setLoading(true);
        fetchUsers();
        fetchStats();
    };

    const toggleUserStatus = async (userId) => {

        try {

            setActionLoading(userId);

            const token = getToken();

            const response = await axios.put(
                `http://localhost:5000/api/admin/users/${userId}/status`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {

                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user._id === userId
                            ? {
                                ...user,
                                status: response.data.status
                            }
                            : user
                    )
                );

            }

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Unable to update user status"
            );

        } finally {
            setActionLoading("");
        }
    };

    const reopenUser = async (userId) => {

        try {

            setActionLoading(userId);

            const token = getToken();

            const response = await axios.put(
                `http://localhost:5000/api/admin/users/${userId}/reopen`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {

                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user._id === userId
                            ? {
                                ...user,
                                status: response.data.status
                            }
                            : user
                    )
                );

                alert(
                    "User account reopened successfully"
                );
            }

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Unable to reopen account"
            );

        } finally {
            setActionLoading("");
        }
    };

    const logoutAdmin = () => {

        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");

        navigate("/admin-login");
    };

    const filteredUsers = users.filter((user) => {

        const userStatus =
            user.status || "active";

        const searchText =
            search.toLowerCase().trim();

        const matchesSearch =
            user.name
                ?.toLowerCase()
                .includes(searchText) ||

            user.email
                ?.toLowerCase()
                .includes(searchText) ||

            user.phone
                ?.toLowerCase()
                .includes(searchText) ||

            user.accountNumber
                ?.toLowerCase()
                .includes(searchText);

        const matchesStatus =
            statusFilter === "all" ||
            userStatus === statusFilter;

        return (
            matchesSearch &&
            matchesStatus
        );
    });

    return (
        <div className="admin-dashboard-page">

            {/* HEADER */}

            <div className="admin-header">

                <div>
                    <h1>
                        🏦 Banking Admin Dashboard
                    </h1>

                    <p>
                        Manage users, accounts and transactions
                    </p>
                </div>

                <button
                    className="admin-logout-btn"
                    onClick={logoutAdmin}
                >
                    Logout
                </button>

            </div>


            {/* STATISTICS */}

            <div className="admin-stats-grid">

                <div className="admin-stat-card">
                    <h3>Total Users</h3>

                    <h2>
                        {stats?.totalUsers ?? 0}
                    </h2>
                </div>

                <div className="admin-stat-card">
                    <h3>Total Admins</h3>

                    <h2>
                        {stats?.totalAdmins ?? 0}
                    </h2>
                </div>

                <div className="admin-stat-card">
                    <h3>Total Balance</h3>

                    <h2>
                        ₹{Number(
                            stats?.totalBalance || 0
                        ).toLocaleString("en-IN")}
                    </h2>
                </div>

                <div className="admin-stat-card">
                    <h3>Total Deposits</h3>

                    <h2>
                        ₹{Number(
                            stats?.deposits?.totalAmount || 0
                        ).toLocaleString("en-IN")}
                    </h2>
                </div>

                <div className="admin-stat-card">
                    <h3>Total Withdrawals</h3>

                    <h2>
                        ₹{Number(
                            stats?.withdrawals?.totalAmount || 0
                        ).toLocaleString("en-IN")}
                    </h2>
                </div>

                <div className="admin-stat-card">
                    <h3>Total Transfers</h3>

                    <h2>
                        ₹{Number(
                            stats?.transfers?.totalAmount || 0
                        ).toLocaleString("en-IN")}
                    </h2>
                </div>

            </div>


            {/* QUICK ACTIONS */}

            <div className="admin-quick-actions">

                <button
                    onClick={() =>
                        navigate("/admin-create-user")
                    }
                >
                    ➕ Create User
                </button>

                <button
                    onClick={() =>
                        navigate("/admin-transactions")
                    }
                >
                    💳 Transactions
                </button>

                <button
                    onClick={refreshDashboard}
                >
                    🔄 Refresh
                </button>

            </div>


            {/* SEARCH + FILTER */}

            <div className="admin-search-filter">

                <input
                    type="text"
                    placeholder="Search by name, email, phone or account number..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

                <select
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(e.target.value)
                    }
                >
                    <option value="all">
                        All Accounts
                    </option>

                    <option value="active">
                        Active
                    </option>

                    <option value="blocked">
                        Blocked
                    </option>

                    <option value="closed">
                        Closed
                    </option>
                </select>

            </div>


            {/* USER TABLE */}

            <div className="admin-users-section">

                <div className="admin-section-title">

                    <h2>
                        User Management
                    </h2>

                    <span>
                        {filteredUsers.length} users
                    </span>

                </div>


                {loading ? (

                    <div className="admin-loading">
                        Loading users...
                    </div>

                ) : filteredUsers.length === 0 ? (

                    <div className="admin-empty">
                        No users found
                    </div>

                ) : (

                    <div className="admin-table-wrapper">

                        <table className="admin-users-table">

                            <thead>

                                <tr>

                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Account Number</th>
                                    <th>Balance</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredUsers.map((user) => {

                                    const userStatus =
                                        user.status || "active";

                                    const isActionLoading =
                                        actionLoading === user._id;

                                    return (
                                        <tr key={user._id}>

                                            <td>
                                                {user.name}
                                            </td>

                                            <td>
                                                {user.email}
                                            </td>

                                            <td>
                                                {user.phone}
                                            </td>

                                            <td>
                                                {user.accountNumber || "-"}
                                            </td>

                                            <td>
                                                ₹{Number(
                                                    user.balance || 0
                                                ).toLocaleString("en-IN")}
                                            </td>

                                            <td>

                                                <span
                                                    className={
                                                        user.role === "admin"
                                                            ? "role-admin"
                                                            : "role-user"
                                                    }
                                                >
                                                    {user.role}
                                                </span>

                                            </td>

                                            <td>

                                                <span
                                                    className={`user-status ${userStatus}`}
                                                >
                                                    {userStatus}
                                                </span>

                                            </td>

                                            <td>

                                                <div className="admin-action-buttons">

                                                    <button
                                                        className="admin-view-btn"
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin-user/${user._id}`
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>


                                                    {user.role !== "admin" && (
                                                        <>
                                                            {userStatus === "closed" ? (

                                                                <button
                                                                    className="admin-reopen-btn"
                                                                    onClick={() =>
                                                                        reopenUser(
                                                                            user._id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isActionLoading
                                                                    }
                                                                >
                                                                    {isActionLoading
                                                                        ? "Opening..."
                                                                        : "Reopen"}
                                                                </button>

                                                            ) : (

                                                                <button
                                                                    className={
                                                                        userStatus === "blocked"
                                                                            ? "admin-unblock-btn"
                                                                            : "admin-block-btn"
                                                                    }
                                                                    onClick={() =>
                                                                        toggleUserStatus(
                                                                            user._id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isActionLoading
                                                                    }
                                                                >
                                                                    {isActionLoading
                                                                        ? "Updating..."
                                                                        : userStatus === "blocked"
                                                                            ? "Unblock"
                                                                            : "Block"}
                                                                </button>

                                                            )}
                                                        </>
                                                    )}

                                                </div>

                                            </td>

                                        </tr>
                                    );

                                })}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}

export default AdminDashboard;
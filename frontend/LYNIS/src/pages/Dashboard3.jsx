import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import "./Dashboard.css";

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await api.get("/users", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching user database:", error);
                if (error.response?.status === 403 || error.response?.status === 401) {
                    alert("Access Restricted: Administrator privileges required.");
                    navigate("/home");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [navigate]);

    const filteredUsers = users.filter(user => 
        (user.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-page-wrapper">
            <Navbar />

            <div className="admin-workspace">
                <div className="admin-header">
                    <div>
                        <h1>Administrator Control Vault</h1>
                        <p>Manage platform records, user directory memberships, and permissions</p>
                    </div>
                    <div className="admin-badge">Secure Admin Portal</div>
                </div>

                <div className="admin-metrics-grid">
                    <div className="metric-card">
                        <span className="metric-title">Total Registered Users</span>
                        <span className="metric-value">{users.length}</span>
                    </div>
                    <div className="metric-card">
                        <span className="metric-title">Administrators</span>
                        <span className="metric-value">
                            {users.filter(u => u.role === 'admin').length}
                        </span>
                    </div>
                    <div className="metric-card">
                        <span className="metric-title">Standard Readers</span>
                        <span className="metric-value">
                            {users.filter(u => u.role === 'user').length}
                        </span>
                    </div>
                </div>

                <div className="admin-toolbar">
                    <div className="search-box-wrapper">
                        <input 
                            type="text" 
                            placeholder="Search by username or email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="admin-search-input"
                        />
                    </div>
                </div>

                <div className="admin-table-container">
                    {loading ? (
                        <div className="admin-status-msg">Decrypting user ledger...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="admin-status-msg">No user profiles matched your query.</div>
                    ) : (
                        <table className="user-info-table">
                            <thead>
                                <tr>
                                    <th>User Profile</th>
                                    <th>Username</th>
                                    <th>Email Address</th>
                                    <th>Assigned Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user._id || user.username}>
                                        <td className="user-cell-profile">
                                            <div className="user-avatar-circle">
                                                {user.avatarUrl ? (
                                                    <img src={user.avatarUrl} alt={user.username} />
                                                ) : (
                                                    <span>{(user.username || "U").charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="user-name-text"><strong>{user.username}</strong></td>
                                        <td className="user-email-text">{user.email}</td>
                                        <td>
                                            <span className={`role-pill ${user.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                                                {user.role || 'user'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
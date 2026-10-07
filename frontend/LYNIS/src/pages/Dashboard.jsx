import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import './Dashboard.css'

function Dashboard() {
    const [users, setUsers] = useState([])
    const [logs, setLogs] = useState([])
    const [activeTab, setActiveTab] = useState("users") // 'users' or 'feedback'
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const currentUserId = localStorage.getItem("userId")

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("token")
                const headers = { Authorization: `Bearer ${token}` }

                // Fetch users and activity logs concurrently
                const [usersRes, logsRes] = await Promise.all([
                    api.get("/users", { headers }),
                    api.get("/activityLogs", { headers })
                ])

                setUsers(usersRes.data)
                setLogs(logsRes.data)
            } catch (error) {
                setError('Failed to fetch dashboard data. Please try again')
                console.error("Fetch error: ", error)
                alert("Access Restricted: Administrator privileges required.")
                navigate('/home')
            } finally {
                setLoading(false)
            }
        }
        fetchDashboardData()
    }, [navigate])

    const handleEdit = async (userId, newRole) => {
        const firstUser = users[0]; 
        if ((firstUser && firstUser._id === userId) || userId === currentUserId) { 
            alert("Account cannot be modified.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await api.put(`/users/${userId}`, { role: newRole }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setUsers(users.map(user => user._id === userId ? { ...user, role: newRole } : user));    
            alert("User role updated successfully.");
        } catch (error) {
            console.error(error);
            alert("Failed to edit user. Please check your connection.");
        }
    };

    const handleDeleteUser = async (userToDelete) => {
        const firstUser = users[0];
        const isSelf = userToDelete._id === currentUserId;

        if ((firstUser && firstUser._id === userToDelete._id) || isSelf || userToDelete.role === 'admin') {
            alert("Administrator accounts cannot be deleted.");
            return;
        }

        if (!window.confirm(`Are you sure you want to delete user "${userToDelete.username}"?`)) return;

        try {
            await api.delete(`/users/${userToDelete._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setUsers(users.filter(user => user._id !== userToDelete._id));
            alert("User deleted successfully.");
        } catch (error) {
            console.log(error);
            alert("Failed to delete user. Please check your connection.");
        }
    };

    const handleDeleteFeedback = async (logId) => {
        if (!window.confirm("Are you sure you want to delete this feedback log?")) return;

        try {
            const token = localStorage.getItem("token");
            await api.delete(`/activityLogs/${logId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setLogs(logs.filter(log => log._id !== logId));
            alert("Feedback log deleted successfully.");
        } catch (error) {
            console.error("Failed to delete feedback log:", error);
            alert("Failed to delete feedback log. Please check your connection.");
        }
    };
    
    const filteredUsers = users.filter(user => 
        (user.username && user.username.toLowerCase().includes(search.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(search.toLowerCase()))
    );

    const feedbackLogs = logs.filter(log => log.action === 'FEEDBACK_REVIEWED');
    const filteredFeedback = feedbackLogs.filter(log => 
        (log.details && log.details.toLowerCase().includes(search.toLowerCase())) ||
        (log.userId?.username && log.userId.username.toLowerCase().includes(search.toLowerCase()))
    );

    return(
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

                {/* Original 3 Metric Cards */}
                <div className="admin-metrics-grid">
                    <div className="metric-card">
                        <span className="metric-title">TOTAL REGISTERED USERS</span>
                        <span className="metric-value">{users.length}</span>
                    </div>
                    <div className="metric-card">
                        <span className="metric-title">ADMINISTRATORS</span>
                        <span className="metric-value">
                            {users.filter(user => user.role === 'admin').length}
                        </span>
                    </div>
                    <div className="metric-card">
                        <span className="metric-title">STANDARD READERS</span>
                        <span className="metric-value">
                            {users.filter(user => user.role === 'user' || !user.role).length}
                        </span>
                    </div>
                </div>

                {/* Tab Navigation & Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 15px 0', gap: '15px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={() => { setActiveTab("users"); setSearch(""); }}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: activeTab === 'users' ? '#b45309' : '#1a1a1e',
                                color: '#fff',
                                border: '1px solid #374151',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            👥 Manage Users
                        </button>
                        <button 
                            onClick={() => { setActiveTab("feedback"); setSearch(""); }}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: activeTab === 'feedback' ? '#b45309' : '#1a1a1e',
                                color: '#fff',
                                border: '1px solid #374151',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            💬 User Feedback ({feedbackLogs.length})
                        </button>
                    </div>

                    <div className="search-box-wrapper" style={{ margin: 0 }}>
                        <input 
                            type="text" 
                            placeholder={activeTab === 'users' ? "Search by username or email..." : "Search feedback details..."} 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} 
                            className="admin-search-input" 
                        />
                    </div>
                </div>

                {/* Table Container */}
                <div className="admin-table-container">
                    {loading && <div className="admin-status-msg">Loading...</div>}
                    {error && <div className="admin-status-msg error-msg">{error}</div>}

                    {!loading && !error && activeTab === 'users' && (
                        <>
                            {filteredUsers.length === 0 ? (
                                <div className="admin-status-msg">No user profiles found.</div>
                            ) : (
                                <table className="user-info-table">
                                    <thead>
                                        <tr>
                                            <th>User Profile</th>
                                            <th>Username</th>
                                            <th>Email Address</th>
                                            <th>Assigned Role</th>
                                            <th></th>   
                                            <th></th>   
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((user) => {
                                            const isSelf = user._id === currentUserId;
                                            const isFirstAccount = users[0]?._id === user._id;

                                            return (
                                                <tr key={user._id || user.username}>
                                                    <td className="user-cell-profile">
                                                        <div className="user-avatar-circle">
                                                            <img src={user.avatarUrl || "/default-avatar.png"} alt={user.username} />
                                                        </div>
                                                    </td>
                                                    <td className="user-name-text"><strong>{user.username}</strong></td>
                                                    <td className="user-email-text">{user.email}</td>
                                                    <td>
                                                        <span className={`role-pill ${user.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                                                            {user.role || 'user'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {isFirstAccount || isSelf ? (
                                                            <span className="admin-protected-label">Locked🛡️</span>
                                                        ) : (
                                                            <select
                                                                value={user.role || 'user'}
                                                                onChange={(e) => handleEdit(user._id, e.target.value)}
                                                                className="role-select-dropdown"
                                                            >
                                                                <option value="user">User</option>
                                                                <option value="admin">Admin</option>
                                                            </select>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {isFirstAccount || isSelf || user.role === 'admin' ? (
                                                            <span className="admin-protected-label">Protected 🛡️</span>
                                                        ) : (
                                                            <button onClick={() => handleDeleteUser(user)} className="delete-user-btn">
                                                                Delete 🗑️
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}

                    {!loading && !error && activeTab === 'feedback' && (
                        <>
                            {filteredFeedback.length === 0 ? (
                                <div className="admin-status-msg">No feedback submissions yet.</div>
                            ) : (
                                <table className="user-info-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Email</th>
                                            <th>Feedback Message</th>
                                            <th>Action Type</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredFeedback.map((log) => (
                                            <tr key={log._id}>
                                                <td className="user-name-text">
                                                    <strong>{log.userId?.username || "Unknown User"}</strong>
                                                </td>
                                                <td className="user-email-text">
                                                    {log.userId?.email || "N/A"}
                                                </td>
                                                <td style={{ 
                                                        color: '#f3f4f6', 
                                                        wordBreak: 'break-word', 
                                                        maxWidth: '450px',
                                                        maxHeight: '120px',
                                                        overflowY: 'auto',
                                                        display: 'block',
                                                        padding: '12px 8px'
                                                        }}>
                                                    {log.details}
                                                </td>
                                                <td>
                                                    <span className="role-pill role-admin" style={{ backgroundColor: '#b45309' }}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button 
                                                        onClick={() => handleDeleteFeedback(log._id)} 
                                                        className="delete-user-btn"
                                                    >
                                                        Delete 🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
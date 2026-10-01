import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import './Dashboard.css'

function Dashboard() {
    const [users,setUsers] = useState([])
    const [search, setSearch] = useState("")
    const [loading,setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const currentUserId = localStorage.getItem("userId")

    useEffect(() => {
        const fetchUsers = async () => {
            try{
                const token = localStorage.getItem("token")
                const response = await api.get("/users", {
                    headers: {Authorization: `Bearer ${token}`}
                })
                setUsers(response.data)
            } catch (error) {
                setError('Failed to fetch. Please try again')
                console.error("Fetch error: ", error)
                alert("Access Restricted: Administrator provileges required.")
                navigate('/home')
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
    }, [navigate])

    const handleEdit = async (userId, newRole) => {
        const firstUser = users[0]; //Let my first account cant be edit :) 
        if ((firstUser && firstUser._id === userId) || userId === currentUserId) { //Cannot edit myself to user 
            alert("Account cannot be modified.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await api.put(`/users/${userId}`, { role: newRole }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const updatedUsers = users.map((user) => {
                if (user._id === userId) {
                    return { ...user, role: newRole };
                }
                return user;
            });
            setUsers(updatedUsers);    
            alert("User role updated successfully.");
        } catch (error) {
            console.error(error);
            alert("Failed to edit user. Please check your connection.");
        }
    };

    const handleDelete = async (userToDelete) => {
        const firstUser = users[0]; //Let my first account cant be edit or delete :)
        const isSelf = userToDelete._id === currentUserId;  //Cannot delete myself 

        if ((firstUser && firstUser._id === userToDelete._id) || isSelf || userToDelete.role === 'admin') {
            alert("Administrator accounts cannot be deleted.");
            return;
        }

        const confirmDelete = window.confirm(`Are you sure you want to delete user "${userToDelete.username}"?`);
        if (!confirmDelete) return;

        try {
            await api.delete(`/users/${userToDelete._id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const remainingUsers = users.filter((user) => {
                return user._id !== userToDelete._id;
            });
            setUsers(remainingUsers);
            alert("User deleted successfully.");
        } catch (error) {
            console.log(error);
            alert("Failed to delete user. Please check your connection.");
        }
    };
    
    const FilteredUsers = users.filter(user => 
        (user.username && user.username.toLowerCase().includes(search.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(search.toLowerCase()))
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

            <div className="admin-metrics-grid">
                    <div className="metric-card">
                        <span className="metric-title">Total Registered Users</span>
                        <span className="metric-value">{users.length}</span>
                    </div>
                    <div className="metric-card">
                        <span className="metric-title">Administrators</span>
                        <span className="metric-value">
                            {users.filter(user => user.role === 'admin').length}
                        </span>
                    </div>
                    <div className="metric-card">
                        <span className="metric-title">Standard Readers</span>
                        <span className="metric-value">
                            {users.filter(user => user.role === 'user').length}
                        </span>
                    </div>
                    <div className="admin-toolbar">
                        <div className="search-box-wrapper">
                            <input type="text" placeholder="Search by username or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="admin-search-input" />
                        </div>
                    </div>

                    <div className="admin-table-container">
                    {loading && <div className="admin-status-msg">Loading...</div>}
                        
                    {error && <div className="admin-status-msg error-msg">{error}</div>}

                    {!loading && !error && users.length === 0 && (
                        <div className="admin-status-msg">No user profiles found.</div>
                    )}

                    {!loading && !error && users.length > 0 && (
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
                                {FilteredUsers.map((user) => { //bottom 2 line is a must or not it will read the first user only wont read every user
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
                                                <button 
                                                    onClick={() => handleDelete(user)}
                                                    className="delete-user-btn"
                                                >
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
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Dashboard    
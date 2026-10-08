import React from 'react';
import api from '../../utils/api';

function UserManage({ users, setUsers, search, currentUserId }) {
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

    const filteredUsers = users.filter(user => 
        (user.username && user.username.toLowerCase().includes(search.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(search.toLowerCase()))
    );

    if (filteredUsers.length === 0) {
        return <div className="admin-status-msg">No user profiles found.</div>;
    }

    return (
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
                    );
                })}
            </tbody>
        </table>
    );
}

export default UserManage;
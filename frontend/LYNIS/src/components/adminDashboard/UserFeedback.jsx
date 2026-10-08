import React from 'react';
import api from '../../utils/api';

function UserFeedback({ logs, setLogs, search, sortOption, actionFilter }) {
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

    // 1. Filter by action type selection (matching all allowed action types or selected filter)
    const feedbackLogs = logs.filter(log => {
        const matchesAction = actionFilter === 'all' || log.action === actionFilter;
        const isAllowedType = log.action === 'FEEDBACK_REVIEWED' || log.action === 'REPORT' || log.action === 'OTHER';
        return matchesAction && isAllowedType;
    });

    // 2. Filter by search query
    const searchedFeedback = feedbackLogs.filter(log => 
        (log.details && log.details.toLowerCase().includes(search.toLowerCase())) ||
        (log.userId?.username && log.userId.username.toLowerCase().includes(search.toLowerCase()))
    );

    // 3. Sort options logic (Latest as default)
    const sortedFeedback = [...searchedFeedback].sort((a, b) => {
        if (sortOption === 'oldest') {
            return new Date(a.createdAt) - new Date(b.createdAt);
        } else if (sortOption === 'user') {
            const nameA = a.userId?.username || "";
            const nameB = b.userId?.username || "";
            return nameA.localeCompare(nameB);
        } else {
            // Default: 'latest' (newest first)
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });

    if (sortedFeedback.length === 0) {
        return <div className="admin-status-msg">No feedback submissions found matching criteria.</div>;
    }

    return (
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
                {sortedFeedback.map((log) => (
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
    );
}

export default UserFeedback;
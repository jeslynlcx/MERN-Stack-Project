import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import api from '../../utils/api';

function UserFeedback({ logs, setLogs, search, sortOption, actionFilter }) {
    const handleDeleteFeedback = async (logId) => {
        if (!window.confirm("Are you sure you want to delete this feedback log?")) return

        try {
            const token = localStorage.getItem("token")
            await api.delete(`/activityLogs/${logId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setLogs(logs.filter(log => log._id !== logId))
            alert("Feedback log deleted successfully.")
        } catch (error) {
            console.error("Failed to delete feedback log:", error)
            alert("Failed to delete feedback log. Please check your connection.")
        }
    }

    const feedbackLogs = logs.filter(log => {
        const matchesAction = actionFilter === 'all' || log.action === actionFilter
        const isAllowedType = log.action === 'FEEDBACK_REVIEWED' || log.action === 'REPORT' || log.action === 'OTHER'
        return matchesAction && isAllowedType
    })

    const searchedFeedback = feedbackLogs.filter(log => 
        (log.details && log.details.toLowerCase().includes(search.toLowerCase())) ||
        (log.userId?.username && log.userId.username.toLowerCase().includes(search.toLowerCase()))
    )

    const sortedFeedback = [...searchedFeedback].sort((a, b) => {
        if (sortOption === 'oldest') {
            return new Date(a.createdAt) - new Date(b.createdAt)
        } else if (sortOption === 'user') {
            const nameA = a.userId?.username || ""
            const nameB = b.userId?.username || ""
            return nameA.localeCompare(nameB)
        } else {
            return new Date(b.createdAt) - new Date(a.createdAt)
        }
    })

    if (sortedFeedback.length === 0) {
        return <Box sx={{ color: '#9ca3af', fontStyle: 'italic', textAlign: 'center', py: '50px' }}>No feedback submissions found matching criteria.</Box>
    }

    return (
        <TableContainer component={Paper} sx={{ bgcolor: "transparent", boxShadow: "none" }}>
            <Table>
                <TableHead>
                    <TableRow sx={{ borderBottom: "2px solid #321e11" }}>
                        <TableCell sx={{ bgcolor: "#0b0806", color: "#fbbf24", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, py: "16px", px: "20px" }}>User</TableCell>
                        <TableCell sx={{ bgcolor: "#0b0806", color: "#fbbf24", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, py: "16px", px: "20px" }}>Email</TableCell>
                        <TableCell sx={{ bgcolor: "#0b0806", color: "#fbbf24", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, py: "16px", px: "20px" }}>Feedback Message</TableCell>
                        <TableCell sx={{ bgcolor: "#0b0806", color: "#fbbf24", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, py: "16px", px: "20px" }}>Action Type</TableCell>
                        <TableCell sx={{ bgcolor: "#0b0806", color: "#fbbf24", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, py: "16px", px: "20px", textAlign: "right" }}></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedFeedback.map((log) => (
                        <TableRow key={log._id} sx={{ "&:hover": { bgcolor: "rgba(180, 83, 9, 0.08)" }, borderBottom: "1px solid #321e11" }}>
                            <TableCell sx={{ py: "14px", px: "20px", color: "#fef3c7", fontWeight: 700, fontSize: "0.9rem", borderBottom: "inherit" }}>
                                {log.userId?.username || "Unknown User"}
                            </TableCell>
                            <TableCell sx={{ py: "14px", px: "20px", color: "#9ca3af", fontSize: "0.9rem", borderBottom: "inherit" }}>
                                {log.userId?.email || "N/A"}
                            </TableCell>
                            <TableCell sx={{ py: "14px", px: "20px", color: '#f3f4f6', wordBreak: 'break-word', maxWidth: '450px', maxHeight: '120px', overflowY: 'auto', fontSize: '0.9rem', borderBottom: "inherit" }}>
                                {log.details}
                            </TableCell>
                            <TableCell sx={{ py: "14px", px: "20px", borderBottom: "inherit" }}>
                                <Box component="span" sx={{ display: 'inline-block', p: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, backgroundColor: '#b45309', color: '#fef3c7', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                                    {log.action}
                                </Box>
                            </TableCell>
                            <TableCell sx={{ py: "14px", px: "20px", textAlign: "right", borderBottom: "inherit" }}>
                                <Button 
                                    onClick={() => handleDeleteFeedback(log._id)} 
                                    sx={{
                                        backgroundColor: "rgba(239, 68, 68, 0.15)",
                                        color: "#f87171",
                                        border: "1px solid rgba(239, 68, 68, 0.3)",
                                        padding: "6px 12px",
                                        borderRadius: "6px",
                                        fontSize: "0.85rem",
                                        fontWeight: 600,
                                        textTransform: "none",
                                        "&:hover": {
                                            backgroundColor: "rgba(239, 68, 68, 0.3)",
                                            borderColor: "rgba(239, 68, 68, 0.5)"
                                        }
                                    }}
                                >
                                    Delete 🗑️
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default UserFeedback
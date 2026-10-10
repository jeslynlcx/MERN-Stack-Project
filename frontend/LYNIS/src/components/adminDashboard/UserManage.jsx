import { Box, Button, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import api from '../../utils/api';

function UserManage({ users, setUsers, search, currentUserId }) {
    const handleEdit = async (userId, newRole) => {
        const firstUser = users[0] 
        if ((firstUser && firstUser._id === userId) || userId === currentUserId) { 
            alert("Account cannot be modified.")
            return
        }

        try {
            const token = localStorage.getItem("token")
            await api.put(`/users/${userId}`, { role: newRole }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            
            setUsers(users.map(user => user._id === userId ? { ...user, role: newRole } : user))    
            alert("User role updated successfully.")
        } catch (error) {
            console.error(error)
            alert("Failed to edit user. Please check your connection.")
        }
    }

    const handleDeleteUser = async (userToDelete) => {
        const firstUser = users[0]
        const isSelf = userToDelete._id === currentUserId

        if ((firstUser && firstUser._id === userToDelete._id) || isSelf || userToDelete.role === 'admin') {
            alert("Administrator accounts cannot be deleted.")
            return
        }

        if (!window.confirm(`Are you sure you want to delete user "${userToDelete.username}"?`)) return

        try {
            await api.delete(`/users/${userToDelete._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            setUsers(users.filter(user => user._id !== userToDelete._id))
            alert("User deleted successfully.")
        } catch (error) {
            console.log(error)
            alert("Failed to delete user. Please check your connection.")
        }
    }

    const filteredUsers = users.filter(user => 
        (user.username && user.username.toLowerCase().includes(search.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(search.toLowerCase()))
    )

    if (filteredUsers.length === 0) {
        return <Box sx={{ color: '#9ca3af', fontStyle: 'italic', textAlign: 'center', py: '50px' }}>No user profiles found.</Box>
    }

    return (
        <TableContainer component={Paper} sx={{ bgcolor: "transparent", boxShadow: "none" }}>
            <Table>
                <TableHead>
                    <TableRow sx={{ borderBottom: "2px solid #321e11" }}>
                        <TableCell sx={{ bgcolor: "#0b0806", color: "#fbbf24", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, py: "16px", px: "20px" }}>User Profile</TableCell>
                        <TableCell sx={{ bgcolor: "#0b0806", color: "#fbbf24", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, py: "16px", px: "20px" }}>Username</TableCell>
                        <TableCell sx={{ bgcolor: "#0b0806", color: "#fbbf24", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, py: "16px", px: "20px" }}>Email Address</TableCell>
                        <TableCell sx={{ bgcolor: "#0b0806", color: "#fbbf24", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, py: "16px", px: "20px" }}>Assigned Role</TableCell>
                        <TableCell sx={{ bgcolor: "#0b0806", color: "#fbbf24", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, py: "16px", px: "20px" }}></TableCell>   
                        <TableCell sx={{ bgcolor: "#0b0806", color: "#fbbf24", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, py: "16px", px: "20px" }}></TableCell>   
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredUsers.map((user) => {
                        const isSelf = user._id === currentUserId
                        const isFirstAccount = users[0]?._id === user._id

                        return (
                            <TableRow key={user._id || user.username} sx={{ "&:hover": { bgcolor: "rgba(180, 83, 9, 0.08)" }, borderBottom: "1px solid #321e11" }}>
                                <TableCell sx={{ py: "14px", px: "20px", width: "60px", borderBottom: "inherit" }}>
                                    <Box sx={{ width: "38px", height: "38px", backgroundColor: "#321e11", border: "1px solid rgba(217, 119, 6, 0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fef3c7", fontWeight: 700, overflow: "hidden" }}>
                                        <Box component="img" src={user.avatarUrl || "/default-avatar.png"} alt={user.username} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ py: "14px", px: "20px", color: "#e5e7eb", fontSize: "0.9rem", borderBottom: "inherit" }}><Box component="strong" sx={{ color: "#fef3c7" }}>{user.username}</Box></TableCell>
                                <TableCell sx={{ py: "14px", px: "20px", color: "#9ca3af", fontSize: "0.9rem", borderBottom: "inherit" }}>{user.email}</TableCell>
                                <TableCell sx={{ py: "14px", px: "20px", borderBottom: "inherit" }}>
                                    <Box component="span" sx={{ display: 'inline-block', p: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, ...(user.role === 'admin' ? { backgroundColor: 'rgba(180, 83, 9, 0.25)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)' } : { backgroundColor: 'rgba(55, 65, 81, 0.4)', color: '#9ca3af', border: '1px solid rgba(156, 163, 175, 0.2)' }) }}>
                                        {user.role || 'user'}
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ py: "14px", px: "20px", borderBottom: "inherit" }}>
                                    {isFirstAccount || isSelf ? (
                                        <Box component="span" sx={{ color: '#9ca3af', fontSize: '0.85rem' }}>Locked🛡️</Box>
                                    ) : (
                                        <Select
                                            value={user.role || 'user'}
                                            onChange={(e) => handleEdit(user._id, e.target.value)}
                                            size="small"
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        bgcolor: "#17110d",
                                                        color: "#f3f4f6",
                                                        border: "1px solid #321e11",
                                                        "& .MuiMenuItem-root": {
                                                            fontSize: "0.85rem",
                                                            "&:hover": { bgcolor: "#b45309", color: "#fff" },
                                                            "&.Mui-selected": { bgcolor: "#b45309 !important", color: "#fff" }
                                                        }
                                                    }
                                                }
                                            }}
                                            sx={{
                                                backgroundColor: '#0b0806',
                                                color: '#f3f4f6',
                                                border: '1px solid #321e11',
                                                borderRadius: '6px',
                                                fontSize: '0.85rem',
                                                ".MuiOutlinedInput-notchedOutline": { border: "none" },
                                                ".MuiSvgIcon-root": { color: "#9ca3af" }
                                            }}
                                        >
                                            <MenuItem value="user">User</MenuItem>
                                            <MenuItem value="admin">Admin</MenuItem>
                                        </Select>
                                    )}
                                </TableCell>
                                <TableCell sx={{ py: "14px", px: "20px", borderBottom: "inherit" }}>
                                    {isFirstAccount || isSelf || user.role === 'admin' ? (
                                        <Box component="span" sx={{ color: '#9ca3af', fontSize: '0.85rem' }}>Protected 🛡️</Box>
                                    ) : (
                                        <Button 
                                            onClick={() => handleDeleteUser(user)} 
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
                                    )}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default UserManage
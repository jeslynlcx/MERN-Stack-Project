import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Box, Typography, Button, TextField, Select, MenuItem } from '@mui/material'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import UserManage from '../components/adminDashboard/UserManage'
import UserFeedback from '../components/adminDashboard/UserFeedback'
import BookAnalytic from '../components/adminDashboard/BookAnalytic'

function Dashboard() {
    const [users, setUsers] = useState([])
    const [logs, setLogs] = useState([])
    const [books, setBooks] = useState([])
    const [bookmarks, setBookmarks] = useState([])
    const [activeTab, setActiveTab] = useState("users") 
    const [search, setSearch] = useState("")
    const [bookSort, setBookSort] = useState("latest") 
    const [feedbackSort, setFeedbackSort] = useState("latest")
    const [actionFilter, setActionFilter] = useState("all")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const currentUserId = localStorage.getItem("userId")

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("token")
                const headers = { Authorization: `Bearer ${token}` }

                const [usersRes, logsRes, booksRes, bookmarksRes] = await Promise.all([
                    api.get("/users", { headers }),
                    api.get("/activityLogs", { headers }),
                    api.get("/contents", { headers }),
                    api.get("/bookmarks", { headers })
                ])

                setUsers(usersRes.data)
                setLogs(logsRes.data)
                setBooks(booksRes.data)
                setBookmarks(bookmarksRes.data)
            } catch (error) {
                setError('Failed to fetch dashboard data. Please try again')
                navigate('/home')
            } finally {
                setLoading(false)
            }
        }
        fetchDashboardData()
    }, [navigate])

    const feedbackLogs = logs.filter(log => log.action === 'FEEDBACK_REVIEWED')
    const reportLogs = logs.filter(log => log.action === 'REPORT')

    const totalLikesOverall = bookmarks ? bookmarks.filter(b => b.isLiked === true).length : 0

    const allValidRatings = bookmarks ? bookmarks
        .filter(b => b.rating !== undefined && b.rating !== null && b.rating > 0)
        .map(b => Number(b.rating)) : []

    const avgRatingOverall = allValidRatings.length > 0 
        ? (allValidRatings.reduce((sum, rating) => sum + rating, 0) / allValidRatings.length).toFixed(1) 
        : 'N/A'

    return (
        <Box sx={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            minHeight: "100vh", 
            bgcolor: "#060504", 
            color: "#f3f4f6", 
            pb: "60px", 
            overflowX: "hidden" 
        }}>
            <Navbar />
            <Box sx={{ 
                width: "100%", 
                maxWidth: "1100px", 
                mx: "20px", 
                mt: "35px", 
                display: "flex", 
                flexDirection: "column" 
            }}>
                {/* Header */}
                <Box sx={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "flex-start", 
                    mb: "25px", 
                    flexWrap: "wrap", 
                    gap: "15px" 
                }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontSize: "2rem", m: "0 0 6px 0", color: "#fef3c7", fontWeight: 700, letterSpacing: "-0.5px" }}>
                            Administrator Control Vault
                        </Typography>
                        <Typography sx={{ color: "#9ca3af", fontSize: "0.95rem", m: 0 }}>
                            Manage platform records, user directory memberships, and permissions
                        </Typography>
                    </Box>
                    <Box sx={{ 
                        background: "linear-gradient(135deg, #b45309 0%, #78350f 100%)", 
                        color: "#fef3c7", 
                        fontSize: "0.75rem", 
                        textTransform: "uppercase", 
                        letterSpacing: "1px", 
                        px: "14px", 
                        py: "6px", 
                        borderRadius: "20px", 
                        fontWeight: 700, 
                        border: "1px solid rgba(251, 191, 36, 0.3)", 
                        boxShadow: "0 4px 15px rgba(180, 83, 9, 0.4)" 
                    }}>
                        Secure Admin Portal
                    </Box>
                </Box>

                {/* Metrics Grid */}
                {activeTab === 'users' && (
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", mb: "30px" }}>
                        <Box sx={{ background: "linear-gradient(135deg, #17110d 0%, #100b08 100%)", border: "1px solid rgba(217, 119, 6, 0.2)", borderRadius: "12px", p: "20px", display: "flex", flexDirection: "column", gap: "8px", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)" }}>
                            <Typography sx={{ fontSize: "0.8rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>TOTAL REGISTERED USERS</Typography>
                            <Typography sx={{ fontSize: "1.8rem", color: "#fef3c7", fontWeight: 700 }}>{users.length}</Typography>
                        </Box>
                        <Box sx={{ background: "linear-gradient(135deg, #17110d 0%, #100b08 100%)", border: "1px solid rgba(217, 119, 6, 0.2)", borderRadius: "12px", p: "20px", display: "flex", flexDirection: "column", gap: "8px", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)" }}>
                            <Typography sx={{ fontSize: "0.8rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>ADMINISTRATORS</Typography>
                            <Typography sx={{ fontSize: "1.8rem", color: "#fef3c7", fontWeight: 700 }}>{users.filter(u => u.role === 'admin').length}</Typography>
                        </Box>
                        <Box sx={{ background: "linear-gradient(135deg, #17110d 0%, #100b08 100%)", border: "1px solid rgba(217, 119, 6, 0.2)", borderRadius: "12px", p: "20px", display: "flex", flexDirection: "column", gap: "8px", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)" }}>
                            <Typography sx={{ fontSize: "0.8rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>STANDARD READERS</Typography>
                            <Typography sx={{ fontSize: "1.8rem", color: "#fef3c7", fontWeight: 700 }}>{users.filter(u => u.role === 'user' || !u.role).length}</Typography>
                        </Box>
                    </Box>
                )}

                {activeTab === 'feedback' && (
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", mb: "30px" }}>
                        <Box sx={{ background: "linear-gradient(135deg, #17110d 0%, #100b08 100%)", border: "1px solid rgba(217, 119, 6, 0.2)", borderRadius: "12px", p: "20px", display: "flex", flexDirection: "column", gap: "8px", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)" }}>
                            <Typography sx={{ fontSize: "0.8rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>TOTAL FEEDBACK LOGS</Typography>
                            <Typography sx={{ fontSize: "1.8rem", color: "#fef3c7", fontWeight: 700 }}>{feedbackLogs.length}</Typography>
                        </Box>
                        <Box sx={{ background: "linear-gradient(135deg, #17110d 0%, #100b08 100%)", border: "1px solid rgba(217, 119, 6, 0.2)", borderRadius: "12px", p: "20px", display: "flex", flexDirection: "column", gap: "8px", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)" }}>
                            <Typography sx={{ fontSize: "0.8rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>REPORT & ISSUE</Typography>
                            <Typography sx={{ fontSize: "1.8rem", color: "#fef3c7", fontWeight: 700 }}>{reportLogs.length}</Typography>
                        </Box>
                        <Box sx={{ background: "linear-gradient(135deg, #17110d 0%, #100b08 100%)", border: "1px solid rgba(217, 119, 6, 0.2)", borderRadius: "12px", p: "20px", display: "flex", flexDirection: "column", gap: "8px", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)" }}>
                            <Typography sx={{ fontSize: "0.8rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>TOTAL ACTIVITY RECORDS</Typography>
                            <Typography sx={{ fontSize: "1.8rem", color: "#fef3c7", fontWeight: 700 }}>{logs.length}</Typography>
                        </Box>
                    </Box>
                )}

                {activeTab === 'books' && (
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", mb: "30px" }}>
                        <Box sx={{ background: "linear-gradient(135deg, #17110d 0%, #100b08 100%)", border: "1px solid rgba(217, 119, 6, 0.2)", borderRadius: "12px", p: "20px", display: "flex", flexDirection: "column", gap: "8px", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)" }}>
                            <Typography sx={{ fontSize: "0.8rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>TOTAL PUBLISHED BOOKS</Typography>
                            <Typography sx={{ fontSize: "1.8rem", color: "#fef3c7", fontWeight: 700 }}>{books.length}</Typography>
                        </Box>
                        <Box sx={{ background: "linear-gradient(135deg, #17110d 0%, #100b08 100%)", border: "1px solid rgba(217, 119, 6, 0.2)", borderRadius: "12px", p: "20px", display: "flex", flexDirection: "column", gap: "8px", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)" }}>
                            <Typography sx={{ fontSize: "0.8rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>TOTAL LIKES</Typography>
                            <Typography sx={{ fontSize: "1.8rem", color: '#ffb703', fontWeight: 700 }}>❤️ {totalLikesOverall}</Typography>
                        </Box>
                        <Box sx={{ background: "linear-gradient(135deg, #17110d 0%, #100b08 100%)", border: "1px solid rgba(217, 119, 6, 0.2)", borderRadius: "12px", p: "20px", display: "flex", flexDirection: "column", gap: "8px", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)" }}>
                            <Typography sx={{ fontSize: "0.8rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>PLATFORM AVG RATING</Typography>
                            <Typography sx={{ fontSize: "1.8rem", color: '#ffb703', fontWeight: 700 }}>⭐ {avgRatingOverall}</Typography>
                        </Box>
                    </Box>
                )}

                {/* Toolbar */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '15px', gap: '15px', flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', gap: '10px' }}>
                        <Button 
                            onClick={() => { setActiveTab("users"); setSearch(""); }} 
                            sx={{ padding: '10px 20px', backgroundColor: activeTab === 'users' ? '#b45309' : '#1a1a1e', color: '#fff', border: '1px solid #374151', borderRadius: '6px', textTransform: 'none', fontWeight: '600', '&:hover': { backgroundColor: '#d97706' } }}
                        >
                            👥 Manage Users
                        </Button>
                        <Button 
                            onClick={() => { setActiveTab("feedback"); setSearch(""); }} 
                            sx={{ padding: '10px 20px', backgroundColor: activeTab === 'feedback' ? '#b45309' : '#1a1a1e', color: '#fff', border: '1px solid #374151', borderRadius: '6px', textTransform: 'none', fontWeight: '600', '&:hover': { backgroundColor: '#d97706' } }}
                        >
                            💬 User Feedback
                        </Button>
                        <Button 
                            onClick={() => { setActiveTab("books"); setSearch(""); }} 
                            sx={{ padding: '10px 20px', backgroundColor: activeTab === 'books' ? '#b45309' : '#1a1a1e', color: '#fff', border: '1px solid #374151', borderRadius: '6px', textTransform: 'none', fontWeight: '600', '&:hover': { backgroundColor: '#d97706' } }}
                        >
                            📚 Book Analytics
                        </Button>
                    </Box>

                    {/* Right-aligned filters, sort, and search */}
                    <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', ml: 'auto' }}>
                        {activeTab === 'books' && (
                            <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'nowrap' }}>
                                <Select 
                                    value={bookSort} 
                                    onChange={(e) => setBookSort(e.target.value)}
                                    size="small"
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                bgcolor: "#17110d",
                                                color: "#f3f4f6",
                                                border: "1px solid #321e11",
                                                "& .MuiMenuItem-root": {
                                                    fontSize: "0.9rem",
                                                    color: "#ffffff",
                                                    "&:hover": { bgcolor: "#b45309", color: "#fff" },
                                                    "&.Mui-selected": { bgcolor: "#b45309 !important", color: "#fff" }
                                                }
                                            }
                                        }
                                    }}
                                    sx={{
                                        backgroundColor: '#000710',
                                        color: '#ffffff',
                                        border: '1px solid #374151',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        minWidth: '200px',
                                        ".MuiSelect-select": { color: "#ffffff" },
                                        ".MuiOutlinedInput-notchedOutline": { border: "none" },
                                        ".MuiSvgIcon-root": { color: "#9ca3af" }
                                    }}
                                >
                                    <MenuItem value="latest">Sort by: Latest Release</MenuItem>
                                    <MenuItem value="title">Sort by: Title (A-Z)</MenuItem>
                                    <MenuItem value="likes">Sort by: Highest Likes</MenuItem>
                                    <MenuItem value="rating">Sort by: Highest Rating</MenuItem>
                                    <MenuItem value="comments">Sort by: Most Comment</MenuItem>
                                </Select>

                                <Box sx={{ width: '320px', bgcolor: '#0b0806', border: '1px solid #321e11', borderRadius: '8px', px: '12px', py: '4px', '& input::placeholder': { color: '#9ca3af', opacity: 1 }, '& .MuiInput-input': { color: '#ffffff !important' } }}>
                                    <TextField 
                                        variant="standard"
                                        placeholder="Search book title..." 
                                        value={search} 
                                        onChange={(e) => setSearch(e.target.value)} 
                                        InputProps={{ disableUnderline: true }}
                                        inputProps={{ style: { color: "#ffffff", fontSize: "0.9rem" } }}
                                        fullWidth
                                    />
                                </Box>
                            </Box>
                        )}

                        {activeTab === 'feedback' && (
                            <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'nowrap' }}>
                                <Select 
                                    value={feedbackSort} 
                                    onChange={(e) => setFeedbackSort(e.target.value)}
                                    size="small"
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                bgcolor: "#17110d",
                                                color: "#f3f4f6",
                                                border: "1px solid #321e11",
                                                "& .MuiMenuItem-root": {
                                                    fontSize: "0.9rem",
                                                    color: "#ffffff",
                                                    "&:hover": { bgcolor: "#b45309", color: "#fff" },
                                                    "&.Mui-selected": { bgcolor: "#b45309 !important", color: "#fff" }
                                                }
                                            }
                                        }
                                    }}
                                    sx={{
                                        backgroundColor: '#000710',
                                        color: '#ffffff',
                                        border: '1px solid #374151',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        minWidth: '350px',
                                        ".MuiSelect-select": { color: "#ffffff" },
                                        ".MuiOutlinedInput-notchedOutline": { border: "none" },
                                        ".MuiSvgIcon-root": { color: "#9ca3af" }
                                    }}
                                >
                                    <MenuItem value="latest">Sort: Latest (Default)</MenuItem>
                                    <MenuItem value="oldest">Sort: Oldest First</MenuItem>
                                    <MenuItem value="user">Sort by: User (A-Z)</MenuItem>
                                </Select>

                                <Select 
                                    value={actionFilter} 
                                    onChange={(e) => setActionFilter(e.target.value)}
                                    size="small"
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                bgcolor: "#17110d",
                                                color: "#f3f4f6",
                                                border: "1px solid #321e11",
                                                "& .MuiMenuItem-root": {
                                                    fontSize: "0.9rem",
                                                    color: "#ffffff",
                                                    "&:hover": { bgcolor: "#b45309", color: "#fff" },
                                                    "&.Mui-selected": { bgcolor: "#b45309 !important", color: "#fff" }
                                                }
                                            }
                                        }
                                    }}
                                    sx={{
                                        backgroundColor: '#000710',
                                        color: '#ffffff',
                                        border: '1px solid #374151',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        minWidth: '350px',
                                        ".MuiSelect-select": { color: "#ffffff" },
                                        ".MuiOutlinedInput-notchedOutline": { border: "none" },
                                        ".MuiSvgIcon-root": { color: "#9ca3af" }
                                    }}
                                >
                                    <MenuItem value="all">Action Type: All</MenuItem>
                                    <MenuItem value="FEEDBACK_REVIEWED">FEEDBACK_REVIEWED</MenuItem>
                                    <MenuItem value="REPORT">REPORT & ISSUE</MenuItem>
                                    <MenuItem value="OTHER">OTHER</MenuItem>
                                </Select>

                                <Box sx={{ width: '350px', bgcolor: '#0b0806', border: '1px solid #321e11', borderRadius: '8px', px: '12px', py: '4px', '& input::placeholder': { color: '#9ca3af', opacity: 1 }, '& .MuiInput-input': { color: '#ffffff !important' } }}>
                                    <TextField 
                                        variant="standard"
                                        placeholder="Search feedback details..." 
                                        value={search} 
                                        onChange={(e) => setSearch(e.target.value)} 
                                        InputProps={{ disableUnderline: true }}
                                        inputProps={{ style: { color: "#ffffff", fontSize: "0.9rem" } }}
                                        fullWidth
                                    />
                                </Box>
                            </Box>
                        )}

                        {activeTab === 'users' && (
                            <Box sx={{ width: '380px', bgcolor: '#0b0806', border: '1px solid #321e11', borderRadius: '8px', px: '12px', py: '4px', '& input::placeholder': { color: '#9ca3af', opacity: 1 }, '& .MuiInput-input': { color: '#ffffff !important' } }}>
                                <TextField 
                                    variant="standard"
                                    placeholder="Search by username or email..." 
                                    value={search} 
                                    onChange={(e) => setSearch(e.target.value)} 
                                    InputProps={{ disableUnderline: true }}
                                    inputProps={{ style: { color: "#ffffff", fontSize: "0.9rem" } }}
                                    fullWidth
                                />
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Table Container */}
                <Box sx={{ 
                    background: "linear-gradient(135deg, #17110d 0%, #100b08 100%)", 
                    border: "1px solid rgba(217, 119, 6, 0.2)", 
                    borderRadius: "12px", 
                    overflowX: "auto", 
                    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.7)" 
                }}>
                    {loading && <Box sx={{ color: "#9ca3af", fontStyle: "italic", textAlign: "center", py: "50px", fontSize: "1rem" }}>Loading...</Box>}
                    {error && <Box sx={{ color: "#f87171", fontWeight: 500, textAlign: "center", py: "50px", fontSize: "1rem" }}>{error}</Box>}

                    {!loading && !error && activeTab === 'users' && (
                        <UserManage users={users} setUsers={setUsers} search={search} currentUserId={currentUserId} />
                    )}

                    {!loading && !error && activeTab === 'feedback' && (
                        <UserFeedback 
                            logs={logs} 
                            setLogs={setLogs} 
                            search={search} 
                            sortOption={feedbackSort} 
                            actionFilter={actionFilter} 
                        />
                    )}

                    {!loading && !error && activeTab === 'books' && (
                        <BookAnalytic books={books} users={users} logs={logs} bookmarks={bookmarks} search={search} sortOption={bookSort} />
                    )}
                </Box>
            </Box>
        </Box>
    )
}

export default Dashboard
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Box, Typography, Button, TextField, Select, MenuItem, Modal, Fade, Backdrop } from '@mui/material';
import api from '../utils/api';
import Navbar from '../components/Navbar';

function Profile() {
    const [user, setUser] = useState({ username: "", email: "", avatarUrl: "", role: "user" })
    const [items, setItems] = useState([])
    const [activeTab, setActiveTab] = useState("watched") // 'watched' or 'liked'
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    
    // Edit Profile Modal States
    const [isEditing, setIsEditing] = useState(false)
    const [editUsername, setEditUsername] = useState("")
    const [editAvatarUrl, setEditAvatarUrl] = useState("")

    // Filter and Sort states
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [sortBy, setSortBy] = useState("recent")

    const navigate = useNavigate()

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token")
                if (!token) {
                    setLoading(false)
                    setError("No active session found. Please log in.")
                    return
                }

                // Decode user ID directly from the JWT token payload
                let currentUserId = null
                try {
                    const base64Url = token.split('.')[1]
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                    }).join(''))
                    const decoded = JSON.parse(jsonPayload)
                    currentUserId = decoded.id || decoded._id || decoded.userId || decoded.sub
                } catch (e) {
                    console.error("Token decode error:", e)
                }

                if (!currentUserId) {
                    setLoading(false)
                    setError("Could not extract user ID from token session.")
                    return
                }

                // Fetch user data using the decoded ID and token
                const userResponse = await api.get(`/users/${currentUserId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setUser(userResponse.data)
                setEditUsername(userResponse.data.username || "")
                setEditAvatarUrl(userResponse.data.avatarUrl || "")

                // Fetch bookmarks / reading history
                const bookmarksResponse = await api.get("/bookmarks", {
                    headers: { Authorization: `Bearer ${token}` }
                })
                
                // Deduplicate bookmarks by book ID, keeping the most recently updated entry
                const rawBookmarks = bookmarksResponse.data || []
                const uniqueMap = new Map()
                
                rawBookmarks.forEach(b => {
                    const bookObj = b.contentId || b.content || b
                    const bookId = bookObj._id || bookObj.id || (typeof b.contentId === 'string' ? b.contentId : null)
                    if (!bookId) return

                    const existing = uniqueMap.get(bookId)
                    if (!existing) {
                        uniqueMap.set(bookId, b)
                    } else {
                        const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime()
                        const incomingTime = new Date(b.updatedAt || b.createdAt || 0).getTime()
                        
                        const mergedIsLiked = existing.isLiked || b.isLiked || existing.liked || b.liked
                        const mergedLastPage = Math.max(existing.lastReadPage || existing.lastPage || 1, b.lastReadPage || b.lastPage || 1)
                        
                        if (incomingTime >= existingTime) {
                            uniqueMap.set(bookId, { ...b, isLiked: mergedIsLiked, lastReadPage: mergedLastPage })
                        } else {
                            uniqueMap.set(bookId, { ...existing, isLiked: mergedIsLiked, lastReadPage: mergedLastPage })
                        }
                    }
                })

                setItems(Array.from(uniqueMap.values()))

            } catch (err) {
                console.error("Fetch error: ", err)
                setError('Failed to load profile details from server.')
            } finally {
                setLoading(false)
            }
        }

        fetchUserData()
    }, [])

    const handleSaveProfile = async (e) => {
        e.preventDefault()
        try {
            const token = localStorage.getItem("token")
            const currentUserId = user._id || localStorage.getItem("userId") || localStorage.getItem("id")
            
            const response = await api.put(`/users/${currentUserId}`, {
                username: editUsername,
                avatarUrl: editAvatarUrl
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setUser(response.data)
            setIsEditing(false)
            alert("Profile updated successfully.")
        } catch (err) {
            console.error("Update error: ", err)
            alert("Failed to update profile.")
        }
    }

    const handleLogout = () => {
        localStorage.clear()
        navigate("/")
    }

    const isAdmin = user.role === 'admin'

    // Extract categories dynamically (hiding locked categories for normal users)
    const categories = ["All", ...new Set(items.map(item => {
        const bookData = item.contentId || item.content || item
        const isLocked = bookData.status === "Draft" || bookData.status === "Archived"
        if (isLocked && !isAdmin) return null
        return bookData.category
    }).filter(Boolean))]

    // Filter and Sort logic: Hides locked books for regular users, shows them for admins
    const filteredItems = items.filter(item => {
        const bookData = item.contentId || item.content || item
        
        const isLocked = bookData.status === "Draft" || bookData.status === "Archived"
        if (isLocked && !isAdmin) return false

        const categoryMatch = selectedCategory === "All" || bookData.category === selectedCategory
        
        if (activeTab === "liked") {
            return categoryMatch && (item.isLiked === true || item.liked === true)
        }
        return categoryMatch 
    }).sort((a, b) => {
        const bookA = a.contentId || a.content || a
        const bookB = b.contentId || b.content || b

        if (sortBy === "recent") {
            const timeA = new Date(a.updatedAt || a.createdAt || a.lastAccessed || 0).getTime()
            const timeB = new Date(b.updatedAt || b.createdAt || b.lastAccessed || 0).getTime()
            return timeB - timeA 
        }
        if (sortBy === "name") {
            return (bookA.name || bookA.title || "").localeCompare(bookB.name || bookB.title || "")
        }
        return 0
    })

    const handleOpenContent = (item) => {
        const content = item.contentId && typeof item.contentId === 'object' 
            ? item.contentId 
            : (item.content || item)
            
        const isLocked = content.status === "Draft" || content.status === "Archived"
        if (isLocked) return

        const contentId = content._id || content.id || item.contentId || item._id
        
        if (!contentId) {
            console.error("Could not find valid book ID for item:", item)
            return
        }

        const lastPage = item.lastReadPage || item.lastPage || 1
        navigate(`/content/${contentId}?page=${lastPage}`)
    }

    const avatarSrc = user.avatarUrl 
        ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:2406${user.avatarUrl}`)
        : ""

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
                {/* Profile Header Card */}
                <Box sx={{ 
                    background: "linear-gradient(135deg, #17110d 0%, #100b08 100%)", 
                    border: "1px solid rgba(217, 119, 6, 0.2)", 
                    borderRadius: "12px", 
                    p: "24px", 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    mb: "25px", 
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)", 
                    flexWrap: "wrap", 
                    gap: "20px" 
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "20px" }}>
                        <Box sx={{ 
                            width: "65px", 
                            height: "65px", 
                            bgcolor: "#321e11", 
                            border: "2px solid #d97706", 
                            borderRadius: "50%", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            fontSize: "1.5rem", 
                            color: "#fef3c7", 
                            fontWeight: 700, 
                            boxShadow: "0 0 15px rgba(217, 119, 6, 0.3)",
                            overflow: "hidden"
                        }}>
                            <img 
                                src={avatarSrc || "/default-avatar.png"} 
                                alt={user.username || "User"} 
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                onError={(e) => { 
                                    e.target.onerror = null 
                                    e.target.src = "/default-avatar.png" 
                                }}
                            />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ m: "0 0 4px 0", fontSize: "1.5rem", color: "#fef3c7", fontWeight: 700 }}>
                                {user.username || "Loading..."}
                            </Typography>
                            <Typography sx={{ m: 0, fontSize: "0.9rem", color: "#9ca3af", display: "flex", alignItems: "center", gap: "6px" }}>
                                {user.email || "Loading email..."} • 
                                <Box component="span" sx={{ 
                                    textTransform: "capitalize", 
                                    color: isAdmin ? "#fbbf24" : "#9ca3af", 
                                    fontWeight: 600 
                                }}>
                                    {user.role || "user"}
                                </Box>
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: "10px" }}>
                        <Button 
                            onClick={() => {
                                setEditUsername(user.username || "")
                                setEditAvatarUrl(user.avatarUrl || "")
                                setIsEditing(true)
                            }} 
                            sx={{ 
                                backgroundColor: "rgba(217, 119, 6, 0.15)", 
                                border: "1px solid rgba(217, 119, 6, 0.4)", 
                                color: "#fef3c7", 
                                padding: "10px 18px", 
                                borderRadius: "8px", 
                                textTransform: "none", 
                                fontSize: "0.9rem", 
                                fontWeight: 600, 
                                '&:hover': { backgroundColor: "#d97706", color: "#fff" } 
                            }}
                        >
                            Edit Profile ✏️
                        </Button>
                        <Button 
                            onClick={handleLogout} 
                            sx={{ 
                                backgroundColor: "rgba(185, 28, 28, 0.15)", 
                                border: "1px solid rgba(239, 68, 68, 0.4)", 
                                color: "#fca5a5", 
                                padding: "10px 18px", 
                                borderRadius: "8px", 
                                textTransform: "none", 
                                fontSize: "0.9rem", 
                                fontWeight: 600, 
                                '&:hover': { backgroundColor: "#dc2626", color: "#fff", borderColor: "#ef4444", boxShadow: "0 4px 15px rgba(220, 38, 38, 0.4)" } 
                            }}
                        >
                            Logout 🚪
                        </Button>
                    </Box>
                </Box>

                {/* Edit Profile Modal Form */}
                <Modal
                    open={isEditing}
                    onClose={() => setIsEditing(false)}     
                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                    <Fade in={isEditing}>
                        <Box component="form" onSubmit={handleSaveProfile} sx={{ 
                            bgcolor: "#17110d", 
                            border: "2px solid #d97706", 
                            p: "30px", 
                            borderRadius: "12px", 
                            width: "100%", 
                            maxWidth: "400px", 
                            boxShadow: "0 25px 60px rgba(0,0,0,0.95)",
                            outline: 'none',
                            display: "flex",
                            flexDirection: "column"
                        }}>
                            <Typography sx={{ 
                                color: "#fef3c7", 
                                fontSize: "1.25rem", 
                                fontWeight: 700, 
                                mb: "20px" 
                            }}>
                                Edit Your Profile
                            </Typography>
                            
                            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", mb: "20px" }}>
                                <Typography sx={{ fontSize: "0.85rem", color: "#9ca3af" }}>Username:</Typography>
                                <TextField 
                                    value={editUsername} 
                                    onChange={(e) => setEditUsername(e.target.value)} 
                                    required
                                    size="small"
                                    fullWidth
                                    sx={{ 
                                        input: { color: "#fff" },
                                        "& .MuiOutlinedInput-root": {
                                            bgcolor: "#0b0806",
                                            borderRadius: "6px",
                                            "& fieldset": { borderColor: "#321e11" },
                                            "&:hover fieldset": { borderColor: "#321e11" },
                                            "&.Mui-focused fieldset": { borderColor: "#d97706" }
                                        }
                                    }}
                                />
                            </Box>

                            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", mb: "25px" }}>
                                <Typography sx={{ fontSize: "0.85rem", color: "#9ca3af" }}>Profile Picture URL:</Typography>
                                <TextField 
                                    placeholder="https://example.com/avatar.jpg or /uploads/..." 
                                    value={editAvatarUrl} 
                                    onChange={(e) => setEditAvatarUrl(e.target.value)} 
                                    size="small"
                                    fullWidth
                                    sx={{ 
                                        input: { color: "#fff", '&::placeholder': { color: '#6b7280', opacity: 1 } },
                                        "& .MuiOutlinedInput-root": {
                                            bgcolor: "#0b0806",
                                            borderRadius: "6px",
                                            "& fieldset": { borderColor: "#321e11" },
                                            "&:hover fieldset": { borderColor: "#321e11" },
                                            "&.Mui-focused fieldset": { borderColor: "#d97706" }
                                        }
                                    }}
                                />
                            </Box>

                            <Box sx={{ display: "flex", gap: "12px" }}>
                                <Button type="submit" variant="contained" sx={{ background: "#b45309", color: "#fff", textTransform: "none", fontWeight: 600, flex: 1, '&:hover': { background: "#d97706" } }}>
                                    Save Changes
                                </Button>
                                <Button type="button" onClick={() => setIsEditing(false)} sx={{ color: "#9ca3af", border: "1px solid #321e11", textTransform: "none", flex: 1, '&:hover': { color: "#fff", borderColor: "#6b7280" } }}>
                                    Cancel
                                </Button>
                            </Box>
                        </Box>
                    </Fade>
                </Modal>

                {/* Tab Switcher */}
                <Box sx={{ display: "flex", gap: "12px", mb: "20px" }}>
                    <Button 
                        onClick={() => setActiveTab("watched")}
                        sx={{ 
                            backgroundColor: activeTab === "watched" ? "#b45309" : "#120d09", 
                            border: "1px solid",
                            borderColor: activeTab === "watched" ? "#d97706" : "#321e11",
                            color: activeTab === "watched" ? "#fff" : "#9ca3af", 
                            padding: "10px 20px", 
                            borderRadius: "8px", 
                            textTransform: "none", 
                            fontSize: "0.9rem", 
                            fontWeight: 600, 
                            boxShadow: activeTab === "watched" ? "0 4px 12px rgba(180, 83, 9, 0.4)" : "none",
                            '&:hover': { backgroundColor: activeTab === "watched" ? "#d97706" : "#17110d", color: "#f3f4f6", borderColor: "#d97706" } 
                        }}
                    >
                        📚 Watched / History Books
                    </Button>
                    <Button 
                        onClick={() => setActiveTab("liked")}
                        sx={{ 
                            backgroundColor: activeTab === "liked" ? "#b45309" : "#120d09", 
                            border: "1px solid",
                            borderColor: activeTab === "liked" ? "#d97706" : "#321e11",
                            color: activeTab === "liked" ? "#fff" : "#9ca3af", 
                            padding: "10px 20px", 
                            borderRadius: "8px", 
                            textTransform: "none", 
                            fontSize: "0.9rem", 
                            fontWeight: 600, 
                            boxShadow: activeTab === "liked" ? "0 4px 12px rgba(180, 83, 9, 0.4)" : "none",
                            '&:hover': { backgroundColor: activeTab === "liked" ? "#d97706" : "#17110d", color: "#f3f4f6", borderColor: "#d97706" } 
                        }}
                    >
                        ❤️ Liked Books
                    </Button>
                </Box>

                {/* Filter & Sort Bar */}
                <Box sx={{ 
                    background: "linear-gradient(135deg, #17110d 0%, #100b08 100%)", 
                    border: "1px solid rgba(217, 119, 6, 0.2)", 
                    borderRadius: "12px", 
                    p: "16px 20px", 
                    display: "flex", 
                    gap: "25px", 
                    mb: "30px", 
                    flexWrap: "wrap", 
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)" 
                }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: "200px" }}>
                        <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
                            Category:
                        </Typography>
                        <Select 
                            value={selectedCategory} 
                            onChange={(e) => setSelectedCategory(e.target.value)}
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
                                backgroundColor: '#0b0806',
                                color: '#f3f4f6',
                                border: '1px solid #321e11',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                ".MuiSelect-select": { color: "#f3f4f6", py: "10px" },
                                ".MuiOutlinedInput-notchedOutline": { border: "none" },
                                ".MuiSvgIcon-root": { color: "#9ca3af" },
                                '&.Mui-focused': { boxShadow: '0 0 8px rgba(217, 119, 6, 0.25)' }
                            }}
                        >
                            {categories.map(cat => (
                                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                            ))}
                        </Select>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: "200px" }}>
                        <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
                            Sort By:
                        </Typography>
                        <Select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
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
                                backgroundColor: '#0b0806',
                                color: '#f3f4f6',
                                border: '1px solid #321e11',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                ".MuiSelect-select": { color: "#f3f4f6", py: "10px" },
                                ".MuiOutlinedInput-notchedOutline": { border: "none" },
                                ".MuiSvgIcon-root": { color: "#9ca3af" },
                                '&.Mui-focused': { boxShadow: '0 0 8px rgba(217, 119, 6, 0.25)' }
                            }}
                        >
                            <MenuItem value="recent">Recently Read</MenuItem>
                            <MenuItem value="name">Title (A-Z)</MenuItem>
                        </Select>
                    </Box>
                </Box>

                {/* Content / Book Grid Area */}
                <Box sx={{ width: "100%" }}>
                    {loading && <Box sx={{ color: "#9ca3af", fontStyle: "italic", textAlign: "center", py: "60px", fontSize: "1rem" }}>Loading reading vault...</Box>}
                    {error && <Box sx={{ color: "#f87171", fontStyle: "italic", textAlign: "center", py: "60px", fontSize: "1rem" }}>{error}</Box>}

                    {!loading && !error && filteredItems.length === 0 ? (
                        <Box sx={{ color: "#9ca3af", fontStyle: "italic", textAlign: "center", py: "60px", fontSize: "1rem" }}>
                            {activeTab === "watched" ? "No reading history found yet." : "No liked books found."}
                        </Box>
                    ) : (
                        <Box sx={{ 
                            display: "grid", 
                            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", 
                            gap: "30px" 
                        }}>
                            {filteredItems.map((item) => {
                                const book = item.contentId && typeof item.contentId === 'object' 
                                    ? item.contentId 
                                    : (item.content || item)
                                    
                                const isLocked = book.status === "Draft" || book.status === "Archived"
                                const statusLabel = book.status === "Draft" ? "(Draft)" : book.status === "Archived" ? "(Archived)" : ""

                                const rawCover = book.coverImageUrl || book.coverImage || ""
                                const coverUrl = rawCover.startsWith('http') 
                                    ? rawCover 
                                    : `http://localhost:2406${rawCover}`

                                return (
                                    <Box 
                                        key={book._id || item._id} 
                                        onClick={() => {
                                            if (isLocked) return
                                            handleOpenContent(item)
                                        }}
                                        sx={{ 
                                            position: "relative", 
                                            cursor: isLocked && !isAdmin ? 'default' : 'pointer', 
                                            transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                            '&:hover': { transform: isLocked && !isAdmin ? 'none' : 'translateY(-10px) scale(1.03)', '& .profile-book-overlay': { opacity: isLocked && !isAdmin ? 0 : 1 } },
                                            display: isLocked && !isAdmin ? 'none' : 'block'
                                        }}
                                    >
                                        <Box sx={{ 
                                            position: "relative", 
                                            borderRadius: "6px", 
                                            overflow: "hidden",
                                            ...(isLocked && isAdmin ? { filter: 'grayscale(50%) brightness(0.65)', opacity: 0.75, cursor: 'not-allowed' } : {})
                                        }}>
                                            <Box 
                                                component="img"
                                                src={coverUrl} 
                                                alt={book.name || book.title || "Book"} 
                                                onError={(e) => { 
                                                    e.target.onerror = null
                                                    e.target.style.display = 'none' 
                                                }}
                                                sx={{ 
                                                    width: "100%", 
                                                    height: "230px", 
                                                    objectFit: "cover", 
                                                    borderRadius: "6px", 
                                                    border: "1px solid rgba(255, 255, 255, 0.18)", 
                                                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.9)", 
                                                    display: "block" 
                                                }}
                                            />
                                            <Box className="profile-book-overlay" sx={{ 
                                                position: "absolute", 
                                                inset: 0, 
                                                background: "rgba(12, 7, 4, 0.92)", 
                                                backdropFilter: "blur(6px)", 
                                                display: "flex", 
                                                flexDirection: "column", 
                                                justifyContent: "center", 
                                                alignItems: "center", 
                                                padding: "14px", 
                                                textAlign: "center", 
                                                opacity: 0, 
                                                borderRadius: "6px", 
                                                transition: "opacity 0.25s ease" 
                                            }}>
                                                <Typography sx={{ color: "#fff", fontSize: "0.9rem", fontWeight: 600, mb: "12px", lineHeight: 1.3 }}>
                                                    {book.name || book.title} {isAdmin && statusLabel}
                                                </Typography>
                                                {isLocked && isAdmin ? (
                                                    <Box component="span" sx={{ fontSize: "0.75rem", background: "#555", color: "#ccc", cursor: "not-allowed", pointerEvents: "none", p: "6px 12px", borderRadius: "12px", fontWeight: 600 }}>
                                                        Locked ({book.status}) 🔒
                                                    </Box>
                                                ) : (
                                                    <Box component="span" sx={{ fontSize: "0.75rem", color: "#fff", background: "#b45309", p: "6px 12px", borderRadius: "12px", fontWeight: 600, boxShadow: "0 4px 10px rgba(180, 83, 9, 0.4)" }}>
                                                        Resume Page {item.lastReadPage || item.lastPage || 1} 📖
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                )
                            })}
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    )
}

export default Profile
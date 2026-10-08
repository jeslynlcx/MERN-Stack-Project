import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import "../styles/Profile.css"

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
                let currentUserId = null;
                try {
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                    }).join(''));
                    const decoded = JSON.parse(jsonPayload);
                    currentUserId = decoded.id || decoded._id || decoded.userId || decoded.sub;
                } catch (e) {
                    console.error("Token decode error:", e);
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
                const rawBookmarks = bookmarksResponse.data || [];
                const uniqueMap = new Map();
                
                rawBookmarks.forEach(b => {
                    const bookObj = b.contentId || b.content || b;
                    const bookId = bookObj._id || bookObj.id || (typeof b.contentId === 'string' ? b.contentId : null);
                    if (!bookId) return;

                    const existing = uniqueMap.get(bookId);
                    if (!existing) {
                        uniqueMap.set(bookId, b);
                    } else {
                        const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
                        const incomingTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
                        
                        const mergedIsLiked = existing.isLiked || b.isLiked || existing.liked || b.liked;
                        const mergedLastPage = Math.max(existing.lastReadPage || existing.lastPage || 1, b.lastReadPage || b.lastPage || 1);
                        
                        if (incomingTime >= existingTime) {
                            uniqueMap.set(bookId, { ...b, isLiked: mergedIsLiked, lastReadPage: mergedLastPage });
                        } else {
                            uniqueMap.set(bookId, { ...existing, isLiked: mergedIsLiked, lastReadPage: mergedLastPage });
                        }
                    }
                });

                setItems(Array.from(uniqueMap.values()));

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
        const bookData = item.contentId || item.content || item;
        const isLocked = bookData.status === "Draft" || bookData.status === "Archived";
        if (isLocked && !isAdmin) return null;
        return bookData.category;
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
        // Safely extract the book/content object
        const content = item.contentId && typeof item.contentId === 'object' 
            ? item.contentId 
            : (item.content || item);
            
        // Strict lock check: prevent opening Draft or Archived books
        const isLocked = content.status === "Draft" || content.status === "Archived";
        if (isLocked) return;

        // Extract the book ID matching your route parameter (:id)
        const contentId = content._id || content.id || item.contentId || item._id;
        
        if (!contentId) {
            console.error("Could not find valid book ID for item:", item);
            return;
        }

        // Grab the saved last-read page, or default to 1
        const lastPage = item.lastReadPage || item.lastPage || 1;

        // Navigate using your exact route path (/content/:id)
        navigate(`/content/${contentId}?page=${lastPage}`);
    }

    const avatarSrc = user.avatarUrl 
        ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:2406${user.avatarUrl}`)
        : ""

    return (
        <div className="profile-page-wrapper">
            <Navbar />

            <div className="profile-workspace">
                {/* Profile Header Card */}
                <div className="profile-header-card">
                    <div className="profile-user-info">
                        <div className="user-avatar-circle profile-avatar-large">
                            <img 
                                src={avatarSrc || "/default-avatar.png"} 
                                alt={user.username || "User"} 
                                onError={(e) => { 
                                    e.target.onerror = null; 
                                    e.target.src = "/default-avatar.png"; 
                                }}
                            />
                        </div>
                        <div>
                            <h2>{user.username || "Loading..."}</h2>
                            <p>
                                {user.email || "Loading email..."} • 
                                <span className={`role-pill ${isAdmin ? 'role-admin' : 'role-user'}`}>
                                    {user.role || "user"}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="profile-actions-group">
                        <button 
                            onClick={() => {
                                setEditUsername(user.username || "")
                                setEditAvatarUrl(user.avatarUrl || "")
                                setIsEditing(true)
                            }} 
                            className="profile-edit-btn"
                        >
                            Edit Profile ✏️
                        </button>
                        <button onClick={handleLogout} className="profile-logout-btn">
                            Logout 🚪
                        </button>
                    </div>
                </div>

                {/* Edit Profile Modal Form */}
                {isEditing && (
                    <div className="profile-edit-modal">
                        <form onSubmit={handleSaveProfile} className="edit-form-card">
                            <h3>Edit Your Profile</h3>
                            <div className="form-group">
                                <label>Username:</label>
                                <input 
                                    type="text" 
                                    value={editUsername} 
                                    onChange={(e) => setEditUsername(e.target.value)} 
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Profile Picture URL:</label>
                                <input 
                                    type="text" 
                                    placeholder="https://example.com/avatar.jpg or /uploads/..." 
                                    value={editAvatarUrl} 
                                    onChange={(e) => setEditAvatarUrl(e.target.value)} 
                                />
                            </div>
                            <div className="edit-modal-actions">
                                <button type="submit" className="save-btn">Save Changes</button>
                                <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tab Switcher */}
                <div className="profile-tab-switcher">
                    <button 
                        className={`profile-tab-btn ${activeTab === "watched" ? "active" : ""}`}
                        onClick={() => setActiveTab("watched")}
                    >
                        📚 Watched / History Books
                    </button>
                    <button 
                        className={`profile-tab-btn ${activeTab === "liked" ? "active" : ""}`}
                        onClick={() => setActiveTab("liked")}
                    >
                        ❤️ Liked Books
                    </button>
                </div>

                {/* Filter & Sort Bar */}
                <div className="profile-control-panel">
                    <div className="select-wrapper">
                        <label>Category:</label>
                        <select 
                            value={selectedCategory} 
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="panel-select"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="select-wrapper">
                        <label>Sort By:</label>
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            className="panel-select"
                        >
                            <option value="recent">Recently Read</option>
                            <option value="name">Title (A-Z)</option>
                        </select>
                    </div>
                </div>

                {/* Content / Book Grid Area */}
                <div className="profile-books-grid-container">
                    {loading && <div className="admin-status-msg">Loading reading vault...</div>}
                    {error && <div className="admin-status-msg error-msg">{error}</div>}

                    {!loading && !error && filteredItems.length === 0 ? (
                        <div className="admin-status-msg">
                            {activeTab === "watched" ? "No reading history found yet." : "No liked books found."}
                        </div>
                    ) : (
                        <div className="profile-books-grid">
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
                                    <div 
                                        key={book._id || item._id} 
                                        className="profile-book-card"
                                        onClick={() => {
                                            // Completely block clicking on locked books for everyone (including admins)
                                            if (isLocked) return;
                                            handleOpenContent(item);
                                        }}
                                        style={isLocked && !isAdmin ? { display: 'none' } : {}}
                                    >
                                        <div 
                                            className="profile-cover-frame"
                                            style={isLocked && isAdmin ? { filter: 'grayscale(50%) brightness(0.65)', opacity: 0.75, cursor: 'not-allowed' } : {}}
                                        >
                                            <img 
                                                src={coverUrl} 
                                                alt={book.name || book.title || "Book"} 
                                                className="profile-book-img"
                                                onError={(e) => { 
                                                    e.target.onerror = null;
                                                    e.target.style.display = 'none'; 
                                                }}
                                            />
                                            <div className="profile-book-overlay">
                                                <span className="profile-book-title">{book.name || book.title} {isAdmin && statusLabel}</span>
                                                {isLocked && isAdmin ? (
                                                    <span 
                                                        className="profile-resume-tag" 
                                                        style={{ background: "#555", color: "#ccc", cursor: "not-allowed", pointerEvents: "none" }}
                                                    >
                                                        Locked ({book.status}) 🔒
                                                    </span>
                                                ) : (
                                                    <span className="profile-resume-tag">
                                                        Resume Page {item.lastReadPage || item.lastPage || 1} 📖
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile
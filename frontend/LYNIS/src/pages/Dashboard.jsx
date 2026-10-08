import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import UserManage from '../components/adminDashboard/UserManage'
import UserFeedback from '../components/adminDashboard/UserFeedback'
import BookAnalytic from '../components/adminDashboard/BookAnalytic'
import "../styles/Dashboard.css"

function Dashboard() {
    const [users, setUsers] = useState([])
    const [logs, setLogs] = useState([])
    const [books, setBooks] = useState([])
    const [bookmarks, setBookmarks] = useState([])
    const [activeTab, setActiveTab] = useState("users") 
    const [search, setSearch] = useState("")
    const [bookSort, setBookSort] = useState("latest") 
    
    // [NEW] Feedback sort & filter states
    const [feedbackSort, setFeedbackSort] = useState("latest") // default latest
    const [actionFilter, setActionFilter] = useState("all")     // filter by action type

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

                {activeTab === 'users' && (
                    <div className="admin-metrics-grid">
                        <div className="metric-card">
                            <span className="metric-title">TOTAL REGISTERED USERS</span>
                            <span className="metric-value">{users.length}</span>
                        </div>
                        <div className="metric-card">
                            <span className="metric-title">ADMINISTRATORS</span>
                            <span className="metric-value">{users.filter(u => u.role === 'admin').length}</span>
                        </div>
                        <div className="metric-card">
                            <span className="metric-title">STANDARD READERS</span>
                            <span className="metric-value">{users.filter(u => u.role === 'user' || !u.role).length}</span>
                        </div>
                    </div>
                )}

                {activeTab === 'feedback' && (
                    <div className="admin-metrics-grid">
                        <div className="metric-card">
                            <span className="metric-title">TOTAL FEEDBACK LOGS</span>
                            <span className="metric-value">{feedbackLogs.length}</span>
                        </div>
                        <div className="metric-card">
                            <span className="metric-title">REPORT & ISSUE</span>
                            <span className="metric-value">{reportLogs.length}</span>
                        </div>
                        <div className="metric-card">
                            <span className="metric-title">TOTAL ACTIVITY RECORDS</span>
                            <span className="metric-value">{logs.length}</span>
                        </div>
                    </div>
                )}

                {activeTab === 'books' && (
                    <div className="admin-metrics-grid">
                        <div className="metric-card">
                            <span className="metric-title">TOTAL PUBLISHED BOOKS</span>
                            <span className="metric-value">{books.length}</span>
                        </div>
                        <div className="metric-card">
                            <span className="metric-title">TOTAL LIKES</span>
                            <span className="metric-value" style={{ color: '#ffb703' }}>❤️ {totalLikesOverall}</span>
                        </div>
                        <div className="metric-card">
                            <span className="metric-title">PLATFORM AVG RATING</span>
                            <span className="metric-value" style={{ color: '#ffb703' }}>⭐ {avgRatingOverall}</span>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 15px 0', gap: '15px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => { setActiveTab("users"); setSearch(""); }} style={{ padding: '10px 20px', backgroundColor: activeTab === 'users' ? '#b45309' : '#1a1a1e', color: '#fff', border: '1px solid #374151', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                            👥 Manage Users
                        </button>
                        <button onClick={() => { setActiveTab("feedback"); setSearch(""); }} style={{ padding: '10px 20px', backgroundColor: activeTab === 'feedback' ? '#b45309' : '#1a1a1e', color: '#fff', border: '1px solid #374151', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                            💬 User Feedback
                        </button>
                        <button onClick={() => { setActiveTab("books"); setSearch(""); }} style={{ padding: '10px 20px', backgroundColor: activeTab === 'books' ? '#b45309' : '#1a1a1e', color: '#fff', border: '1px solid #374151', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                            📚 Book Analytics
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {activeTab === 'books' && (
                            <select 
                                value={bookSort} 
                                onChange={(e) => setBookSort(e.target.value)}
                                className="admin-search-input"
                                style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#000710', color: '#fff', border: '1px solid #374151', borderRadius: '6px' }}
                            >
                                <option value="latest">Sort by: Latest Release</option>
                                <option value="title">Sort by: Title (A-Z)</option>
                                <option value="likes">Sort by: Highest Likes</option>
                                <option value="rating">Sort by: Highest Rating</option>
                                <option value="comments">Sort by: Most Comments</option>
                            </select>
                        )}

                        {/* [NEW] Feedback Sort and Action Type Filter Dropdowns */}
                        {activeTab === 'feedback' && (
                            <>
                                <select 
                                    value={feedbackSort} 
                                    onChange={(e) => setFeedbackSort(e.target.value)}
                                    className="admin-search-input"
                                    style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#000710', color: '#fff', border: '1px solid #374151', borderRadius: '6px' }}
                                >
                                    <option value="latest">Sort: Latest (Default)</option>
                                    <option value="oldest">Sort: Oldest First</option>
                                    <option value="user">Sort by: User (A-Z)</option>
                                </select>

                                <select 
                                    value={actionFilter} 
                                    onChange={(e) => setActionFilter(e.target.value)}
                                    className="admin-search-input"
                                    style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#000710', color: '#fff', border: '1px solid #374151', borderRadius: '6px' }}
                                >
                                    <option value="all">Action Type: All</option>
                                    <option value="FEEDBACK_REVIEWED">FEEDBACK_REVIEWED</option>
                                    <option value="REPORT">REPORT & ISSUE</option>
                                    <option value="OTHER">OTHER</option>
                                </select>
                            </>
                        )}

                        <div className="search-box-wrapper" style={{ margin: 0 }}>
                            <input 
                                type="text" 
                                placeholder={
                                    activeTab === 'users' 
                                        ? "Search by username or email..." 
                                        : activeTab === 'feedback' 
                                        ? "Search feedback details..." 
                                        : "Search book title..."
                                } 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)} 
                                className="admin-search-input" 
                            />
                        </div>
                    </div>
                </div>

                <div className="admin-table-container">
                    {loading && <div className="admin-status-msg">Loading...</div>}
                    {error && <div className="admin-status-msg error-msg">{error}</div>}

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
                </div>
            </div>
        </div>
    )
}

export default Dashboard
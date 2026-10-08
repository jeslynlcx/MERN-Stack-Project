import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import api from "../utils/api";
import "./BookModal.css";

const fetchTokenData = () => {
    try {
        const token = localStorage.getItem("token")
        if (!token) return { token: null, userId: null, isAdmin: false }

        const payload = token.split('.')[1]
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
        return {
            token,
            userId: decoded.userId,
            isAdmin: decoded.role === 'admin' || decoded.isAdmin === true
        }
    } catch (error) {
        console.error("Error parsing auth token:", error)
        return { token: null, userId: null, isAdmin: false }
    }
}

function Book({ book, onClose }) {
    const navigate = useNavigate()
    
    const [isLiked, setIsLiked] = useState(false)
    const [userRating, setUserRating] = useState(0)
    const [comments, setComments] = useState([])
    const [newComment, setnewComment] = useState("")
    const [isAdmin, setIsAdmin] = useState(false)

    const isLocked = book.status === "Draft" || book.status === "Archived"

    useEffect(() => {
        const { token, userId, isAdmin: adminStatus } = fetchTokenData()
        if (!token) return
        
        setIsAdmin(adminStatus)
        api.get(`/bookmarks?contentId=${book._id}`, { 
            headers: { Authorization: `Bearer ${token}` } 
        })
            .then(response => {
                const bookBookmarks = response.data
                const userBookmark = bookBookmarks.find(bookmark => (bookmark.userId?._id || bookmark.userId) === userId)
                if (userBookmark) {
                    setIsLiked(userBookmark.isLiked || false)
                    setUserRating(userBookmark.rating || 0)
                }
                const publicComments = bookBookmarks
                    .filter(bookmark => bookmark.comment && bookmark.comment.trim())
                    .map(bookmark => {
                        const commentUserId = bookmark.userId?._id || bookmark.userId
                        const isOwner = commentUserId === userId
                        return {
                            id: bookmark._id,
                            userId: commentUserId,
                            user: isOwner ? "You" : (bookmark.userId?.username || "Community User"),
                            text: bookmark.comment,
                            date: "Community",
                            isOwner
                        }
                    })

                setComments(publicComments)
            })
            .catch(error => console.error("Error fetching bookmarks:", error))
    }, [book._id])

    // Always include current isLiked and userRating so saving/updating never wipes them out
    const saveBookmark = async (updateData) => {
        const { token, userId } = fetchTokenData()
        if (!token) return

        try {
            await api.post("/bookmarks", { 
                userId, 
                contentId: book._id, 
                isLiked, 
                rating: userRating, 
                ...updateData 
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
        } catch (error) {
            console.error("Failed to save to backend:", error.response?.data || error.message)
        }
    }

    const handleLikeToggle = () => {
        const nextState = !isLiked
        setIsLiked(nextState)
        saveBookmark({ isLiked: nextState })
    }

    const handleRating = (score) => {
        // If the user clicks the 1st star and it's already set to 1, clear it to 0. Otherwise set to score.
        const newScore = (userRating === 1 && score === 1) ? 0 : score
        setUserRating(newScore)
        saveBookmark({ rating: newScore })
    }

    const handleAddComment = (e) => {
        e.preventDefault()
        if (!newComment.trim()) return
        
        const commentText = newComment
        setComments([{ id: Date.now(), user: "You", text: commentText, date: "Just now", isOwner: true }, ...comments])
        setnewComment("")
        saveBookmark({ comment: commentText })
    }

    const handleDeleteComment = async (commentItem) => {
        const { token, userId } = fetchTokenData()
        if (!token) return

        try {
            if (commentItem.isOwner) {
                // Clear the comment string while keeping current like and rating intact
                await api.post("/bookmarks", {
                    userId,
                    contentId: book._id,
                    isLiked,
                    rating: userRating,
                    comment: ""
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            } else if (isAdmin) {
                // If admin deletes someone else's comment, call delete on that specific bookmark ID
                await api.delete(`/bookmarks/${commentItem.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            }
            setComments(comments.filter(c => c.id !== commentItem.id))
        } catch (error) {
            console.error("Failed to delete comment:", error.response?.data || error.message)
            alert("You may not have permission to delete this comment.")
        }
    }

    const coverUrl = book.coverImageUrl?.startsWith('http') ? book.coverImageUrl : `http://localhost:2406${book.coverImageUrl}`

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="content-card" onClick={(e) => e.stopPropagation()}>
                <button className="close-x" onClick={onClose}>✕</button>

                <div className="top-section">
                    <img src={coverUrl} alt={book.name} className="book-thumb" />
                    <div className="book-info">
                        <h2>{book.name} {isLocked && <span style={{fontSize: '0.7em', color: '#ffb703'}}>(Locked 🔒)</span>}</h2>
                        <span className="category-badge">{book.category}</span>
                        <p className="desciption">{book.description}</p>
                        <p className="pages">📚 {book.totalPages} Pages</p>

                        <div className="action-row">
                            <button className={`action-btn like-btn ${isLiked ? 'active' : ''}`} onClick={handleLikeToggle}>
                                {isLiked ? "❤️ Saved" : "🤍 Like / Save"}
                            </button>
                            
                            <button 
                                className={`action-btn view-btn ${isLocked ? 'locked-action-btn' : ''}`} 
                                onClick={() => {
                                    if (!isLocked) {
                                        navigate(`/content/${book._id}`)
                                    }
                                }}
                                disabled={isLocked}
                                style={isLocked ? { opacity: 0.5, cursor: 'not-allowed', background: '#333', borderColor: '#555' } : {}}
                            >
                                {isLocked ? `${book.status} 🔒` : "👁 View Content"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="rating-section">
                    <h4>Rate this Publication:</h4>
                    <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={`star ${userRating >= star ? 'selected' : ''}`} onClick={() => handleRating(star)}>
                                ★
                            </span>
                        ))}
                    </div>
                </div>

                <div className="comments-section">
                    <h4>Community Discussion</h4>
                    <div className="comments-scroll-container">
                        {comments.length === 0 ? (
                            <p className="no-comments">No comments yet. Be the first to share your thoughts!</p>
                        ) : (
                            comments.map((commentItem, index) => (
                                <div key={commentItem.id || index} className="comment-bubble">
                                    <div className="comment-content-wrapper">
                                        <div className="comment-header">
                                            <strong>{commentItem.user}</strong>
                                            <span className="comment-date">{commentItem.date}</span>
                                        </div>
                                        <p className="comment-text">{commentItem.text}</p>
                                    </div>
                                    {(isAdmin || commentItem.isOwner) && (
                                        <button className="comment-delete-btn" onClick={() => handleDeleteComment(commentItem)} title="Delete comment">
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <form onSubmit={handleAddComment} className="input-form">
                        <input type="text" placeholder="Add a public comment..." value={newComment} onChange={(e) => setnewComment(e.target.value)} />
                        <button type="submit">Post</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Book
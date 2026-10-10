import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Box, Typography, Button, TextField, Modal, Fade } from "@mui/material";
import api from "../utils/api";

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

        // Fetch bookmarks for likes and ratings
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
            })
            .catch(error => console.error("Error fetching bookmarks:", error))

        // Fetch comments from the new comments endpoint
        api.get(`/comment?contentId=${book._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                const formattedComments = response.data.map(commentItem => {
                    const commentUserId = commentItem.userId?._id || commentItem.userId
                    const isOwner = commentUserId === userId
                    return {
                        id: commentItem._id,
                        userId: commentUserId,
                        user: isOwner ? "You" : (commentItem.userId?.username || "Community User"),
                        text: commentItem.text,
                        date: new Date(commentItem.createdAt).toLocaleDateString(),
                        createdAt: commentItem.createdAt,
                        isOwner
                    }
                })

                // Sort with latest/newest comments on top
                formattedComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

                setComments(formattedComments)
            })
            .catch(error => console.error("Error fetching comments:", error))
    }, [book._id])

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
        const newScore = (userRating === 1 && score === 1) ? 0 : score
        setUserRating(newScore)
        saveBookmark({ rating: newScore })
    }

    const handleAddComment = async (e) => {
        e.preventDefault()
        if (!newComment.trim()) return
        
        const { token, userId } = fetchTokenData()
        if (!token) return

        try {
            const response = await api.post("/comment", 
                { userId, contentId: book._id, text: newComment },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            const added = response.data
            setComments([{ id: added._id, userId, user: "You", text: added.text, date: "Just now", isOwner: true }, ...comments])
            setnewComment("")
        } catch (error) {
            console.error("Failed to post comment:", error.response?.data || error.message)
        }
    }

    const handleDeleteComment = async (commentItem) => {
        const { token } = fetchTokenData()
        if (!token) return

        try {
            await api.delete(`/comment/${commentItem.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setComments(comments.filter(comment => comment.id !== commentItem.id))
        } catch (error) {
            console.error("Failed to delete comment:", error.response?.data || error.message)
        }
    }

    const coverUrl = book.coverImageUrl?.startsWith('http') ? book.coverImageUrl : `http://localhost:2406${book.coverImageUrl}`

    return (
        <Modal
            open={true}
            onClose={onClose}
            closeAfterTransition
            disableEnforceFocus
            disableScrollLock
            slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(3px)' } } }}
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: '20px' }}
        >
            <Fade in={true}>
                <Box 
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                        backgroundColor: '#17110d',
                        color: '#ffffff',
                        width: '100%',
                        maxWidth: '650px',
                        borderRadius: '12px',
                        padding: '30px',
                        position: 'relative',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.9)',
                        border: '2px solid #3c3b3a',
                        outline: 'none',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* Close Button */}
                    <Button 
                        onClick={onClose}
                        sx={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'transparent',
                            border: 'none',
                            color: '#aaa',
                            minWidth: 'auto',
                            fontSize: '20px',
                            cursor: 'pointer',
                            zIndex: 10,
                            '&:hover': { color: '#fff', background: 'transparent' }
                        }}
                    >
                        ✕
                    </Button>

                    {/* Top Section */}
                    <Box sx={{ display: 'flex', gap: '20px', mb: '20px', flexDirection: { xs: 'column', sm: 'row' }, flexShrink: 0 }}>
                        <Box 
                            component="img" 
                            src={coverUrl} 
                            alt={book.name} 
                            sx={{ 
                                width: { xs: '100%', sm: '120px' }, 
                                height: { xs: '200px', sm: '160px' }, 
                                objectFit: 'cover', 
                                borderRadius: '8px', 
                                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                border: '1px solid #321e11'
                            }} 
                        />
                        <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                            <Typography sx={{ margin: '0 0 10px 0', fontSize: '22px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {book.name} {isLocked && <Box component="span" sx={{ fontSize: '0.7em', color: '#ffb703' }}>(Locked 🔒)</Box>}
                            </Typography>
                            <Box component="span" sx={{ display: 'inline-block', backgroundColor: '#d97706', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, mb: '10px' }}>
                                {book.category}
                            </Box>
                            <Typography sx={{ color: '#ccc', fontSize: '14px', mb: '10px', lineHeight: 1.4 }}>
                                {book.description}
                            </Typography>
                            <Typography sx={{ color: '#888', fontSize: '13px', mb: '15px' }}>
                                📚 {book.totalPages} Pages
                            </Typography>

                            <Box sx={{ display: 'flex', gap: '10px' }}>
                                <Button 
                                    onClick={handleLikeToggle}
                                    sx={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        backgroundColor: isLiked ? '#e11d48' : '#321e11',
                                        color: '#fff',
                                        '&:hover': { backgroundColor: isLiked ? '#be123c' : '#3f2616' }
                                    }}
                                >
                                    {isLiked ? "❤️ Saved" : "🤍 Like / Save"}
                                </Button>
                                
                                <Button 
                                    onClick={() => {
                                        if (!isLocked) {
                                            navigate(`/content/${book._id}`)
                                        }
                                    }}
                                    disabled={isLocked}
                                    sx={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        backgroundColor: isLocked ? '#333' : '#fbbf24',
                                        color: isLocked ? '#aaa' : '#000',
                                        opacity: isLocked ? 0.5 : 1,
                                        cursor: isLocked ? 'not-allowed' : 'pointer',
                                        '&:hover': { backgroundColor: isLocked ? '#333' : '#f59e0b' }
                                    }}
                                >
                                    {isLocked ? `${book.status} 🔒` : "👁 View Content"}
                                </Button>
                            </Box>
                        </Box>
                    </Box>

                    {/* Rating Section */}
                    <Box sx={{ mb: '20px', borderTop: '1px solid #321e11', pt: '15px', flexShrink: 0 }}>
                        <Typography component="h4" sx={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: '#ddd' }}>
                            Rate this Publication:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: '5px', cursor: 'pointer' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Box 
                                    key={star} 
                                    component="span" 
                                    onClick={() => handleRating(star)}
                                    sx={{ 
                                        fontSize: '28px', 
                                        color: userRating >= star ? '#fbbf24' : '#555',
                                        transition: 'color 0.15s' 
                                    }}
                                >
                                    ★
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* Comments Section */}
                    <Box sx={{ borderTop: '1px solid #321e11', pt: '15px', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                        <Typography component="h4" sx={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600, color: '#ddd', flexShrink: 0 }}>
                            Community Discussion
                        </Typography>
                        
                        {/* Scrollable Container ONLY for Comments */}
                        <Box sx={{ maxHeight: '180px', overflowY: 'auto', mb: '16px', pr: '4px', display: 'flex', flexDirection: 'column', gap: '10px', scrollbarWidth: 'thin', scrollbarColor: '#1e1b1a #0b0806' }}>
                            {comments.length === 0 ? (
                                <Typography sx={{ color: '#888', fontSize: '13px' }}>No comments yet. Be the first to share your thoughts!</Typography>
                            ) : (
                                comments.map((commentItem, index) => (
                                    <Box key={commentItem.id || index} sx={{ backgroundColor: '#0b0806', padding: '12px 14px', borderRadius: '8px', border: '1px solid #321e11', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', mb: '4px', color: '#71717a' }}>
                                                <Box component="strong" sx={{ color: '#fbbf24', fontSize: '12px' }}>{commentItem.user}</Box>
                                                <Box component="span">{commentItem.date}</Box>
                                            </Box>
                                            <Typography sx={{ margin: 0, fontSize: '13px', color: '#e4e4e7', lineHeight: 1.4, wordBreak: 'break-word' }}>
                                                {commentItem.text}
                                            </Typography>
                                        </Box>
                                       {commentItem.isOwner && (
                                            <Button 
                                                onClick={() => handleDeleteComment(commentItem)} 
                                                title="Delete comment"
                                                sx={{ minWidth: 'auto', p: '4px 6px', borderRadius: '6px', color: '#a1a1aa', background: 'transparent', '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' } }}
                                            >
                                                🗑️
                                            </Button>
                                        )}
                                    </Box>
                                ))
                            )}
                        </Box>

                        <Box component="form" onSubmit={handleAddComment} sx={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                            <TextField 
                                type="text" 
                                placeholder="Add a public comment..." 
                                value={newComment} 
                                onChange={(e) => setnewComment(e.target.value)} 
                                size="small"
                                fullWidth
                                sx={{
                                    input: { color: "#fff", fontSize: "13px" },
                                    "& .MuiOutlinedInput-root": {
                                        backgroundColor: '#0b0806',
                                        borderRadius: '6px',
                                        "& fieldset": { borderColor: '#321e11' },
                                        "&:hover fieldset": { borderColor: '#321e11' },
                                        "&.Mui-focused fieldset": { borderColor: '#fbbf24' }
                                    }
                                }}
                            />
                            <Button 
                                type="submit"
                                variant="contained"
                                sx={{
                                    backgroundColor: '#fbbf24',
                                    color: '#000',
                                    padding: '0 16px',
                                    borderRadius: '6px',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    '&:hover': { backgroundColor: '#f59e0b' }
                                }}
                            >
                                Post
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    )
}

export default Book
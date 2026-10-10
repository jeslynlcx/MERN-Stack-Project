import { useState, useEffect } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, IconButton, Avatar } from '@mui/material';
import api from "../../utils/api";

function BookAnalytic({ books, users, logs, bookmarks, search, sortOption }) {
    const [selectedBookComments, setSelectedBookComments] = useState(null)
    const [comments, setComments] = useState([])

    // Fetch comments from the backend when the component loads
    useEffect(() => {
        api.get('/comment')
            .then(response => {
                setComments(response.data)
            })
            .catch(error => {
                console.error("Error fetching comments for analytics:", error)
            })
    }, [])

    const filteredBooks = books.filter(book =>
        book.name && book.name.toLowerCase().includes(search.toLowerCase())
    )

    const processedBooks = filteredBooks.map(book => {
        const bookIdStr = book._id?.toString()
        
        // Find bookmarks for likes and ratings
        const bookBookmarks = bookmarks ? bookmarks.filter(b => {
            const bContentId = b.contentId?._id || b.contentId
            return bContentId?.toString() === bookIdStr
        }) : []

        // Find standalone comments for this book from the comments collection
        const bookComments = comments ? comments.filter(c => {
            const cContentId = c.contentId?._id || c.contentId
            return cContentId?.toString() === bookIdStr
        }) : []

        const formattedComments = bookComments.map(c => ({
            id: c._id,
            username: c.userId?.username || "Community User",
            text: c.text,
            createdAt: c.createdAt,
            date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'
        }))

        // Sort comments with latest/newest comments on top
        formattedComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

        const totalLikes = bookBookmarks.filter(b => b.isLiked === true).length
        
        const ratedBookmarks = bookBookmarks.filter(b => b.rating !== undefined && b.rating !== null && b.rating > 0)
        const avgRating = ratedBookmarks.length > 0 
            ? (ratedBookmarks.reduce((sum, b) => sum + Number(b.rating), 0) / ratedBookmarks.length) 
            : 0

        return {
            ...book,
            allBookComments: formattedComments,
            totalLikes,
            avgRating,
            ratedCount: ratedBookmarks.length,
            createdAtTime: new Date(book.createdAt || book.dateAdded || book.releaseDate || 0).getTime()
        }
    })

    processedBooks.sort((a, b) => {
        if (sortOption === 'latest') {
            return b.createdAtTime - a.createdAtTime
        } else if (sortOption === 'likes') {
            return b.totalLikes - a.totalLikes
        } else if (sortOption === 'rating') {
            return b.avgRating - a.avgRating
        } else if (sortOption === 'comments') {
            return b.allBookComments.length - a.allBookComments.length
        } else {
            return (a.name || '').localeCompare(b.name || '')
        }
    })

    if (processedBooks.length === 0) {
        return <Box sx={{ color: '#9ca3af', fontStyle: 'italic', textAlign: 'center', py: '50px' }}>No book analytics records available.</Box>
    }

    return (
        <>
            <TableContainer component={Paper} sx={{ bgcolor: "transparent", boxShadow: "none" }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ borderBottom: "2px solid #321e11" }}>
                            <TableCell sx={{ bgcolor: "#0b0806", color: "#fbbf24", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, py: "16px", px: "20px" }}>Book Title</TableCell>
                            <TableCell sx={{ bgcolor: "#0b0806", color: "#fbbf24", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, py: "16px", px: "20px" }}>Category</TableCell>
                            <TableCell sx={{ bgcolor: "#0b0806", color: "#fbbf24", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, py: "16px", px: "20px" }}>Comments Count</TableCell>
                            <TableCell sx={{ bgcolor: "#0b0806", color: "#fbbf24", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, py: "16px", px: "20px" }}>Total Likes (All Users)</TableCell>
                            <TableCell sx={{ bgcolor: "#0b0806", color: "#fbbf24", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, py: "16px", px: "20px" }}>Average Rating (All Users)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {processedBooks.map((book) => (
                            <TableRow key={book._id} sx={{ "&:hover": { bgcolor: "rgba(180, 83, 9, 0.08)" }, borderBottom: "1px solid #321e11" }}>
                                <TableCell sx={{ py: "14px", px: "20px", color: "#fef3c7", fontWeight: 700, fontSize: "0.9rem", borderBottom: "inherit" }}>
                                    {book.name}
                                </TableCell>
                                <TableCell sx={{ py: "14px", px: "20px", color: "#9ca3af", fontSize: "0.9rem", borderBottom: "inherit" }}>
                                    {book.category?.name || book.category || 'General'}
                                </TableCell>
                                <TableCell sx={{ py: "14px", px: "20px", borderBottom: "inherit" }}>
                                    <Button 
                                        onClick={() => setSelectedBookComments({ bookTitle: book.name, comments: book.allBookComments })}
                                        sx={{ background: 'none', border: 'none', cursor: 'pointer', p: 0, textTransform: 'none', minWidth: 0 }}
                                        title="Click to view all comments"
                                    >
                                        <Box component="span" sx={{ display: 'inline-block', p: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, bgcolor: 'rgba(55, 65, 81, 0.4)', color: '#9ca3af', border: '1px solid rgba(156, 163, 175, 0.2)', cursor: 'pointer' }}>
                                            💬 {book.allBookComments.length} Comments (View)
                                        </Box>
                                    </Button>
                                </TableCell>
                                <TableCell sx={{ py: "14px", px: "20px", color: '#ffb703', fontWeight: 'bold', fontSize: '0.9rem', borderBottom: "inherit" }}>
                                    ❤️ {book.totalLikes} {book.totalLikes === 1 ? 'Like' : 'Likes'}
                                </TableCell>
                                <TableCell sx={{ py: "14px", px: "20px", color: '#ffb703', fontWeight: 'bold', fontSize: '0.9rem', borderBottom: "inherit" }}>
                                    ⭐ {book.avgRating > 0 ? book.avgRating.toFixed(1) : 'N/A'} {book.ratedCount > 0 && `(${book.ratedCount})`}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Compact & Scrollable Comments Dialog */}
            {selectedBookComments && (
                <Dialog 
                    open={true} 
                    onClose={() => setSelectedBookComments(null)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            backgroundColor: '#0b0806',
                            color: '#f3f4f6',
                            borderRadius: '12px',
                            border: '1px solid #321e11',
                            boxShadow: '0 12px 30px rgba(0,0,0,0.8)',
                            overflow: 'hidden'
                        }
                    }}
                >
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#140f0c', px: '20px', py: '14px', borderBottom: '1px solid #321e11' }}>
                        <Box>
                            <Typography sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#fbbf24', fontWeight: 600 }}>
                                Book Comments
                            </Typography>
                            <Typography variant="h6" sx={{ m: 0, fontSize: '1.05rem', color: '#fef3c7', fontWeight: 700 }}>
                                {selectedBookComments.bookTitle}
                            </Typography>
                        </Box>
                        <IconButton 
                            onClick={() => setSelectedBookComments(null)}
                            sx={{ color: '#9ca3af', bgcolor: 'rgba(255,255,255,0.04)', width: '30px', height: '30px', fontSize: '0.9rem', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: '#fff' } }}
                        >
                            ✕
                        </IconButton>
                    </Box>

                    {/* Scrollable Comments Container */}
                    <Box 
                        sx={{ 
                            p: '16px', 
                            maxHeight: '38vh', 
                            overflowY: 'auto', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '10px',
                            '&::-webkit-scrollbar': { width: '6px' },
                            '&::-webkit-scrollbar-track': { background: '#0b0806' },
                            '&::-webkit-scrollbar-thumb': { background: '#321e11', borderRadius: '4px' },
                            '&::-webkit-scrollbar-thumb:hover': { background: '#b45309' }
                        }}
                    >
                        {selectedBookComments.comments.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: '30px' }}>
                                <Typography sx={{ color: '#9ca3af', fontSize: '0.9rem' }}>No comments recorded for this book yet.</Typography>
                            </Box>
                        ) : (
                            selectedBookComments.comments.map((comment, index) => (
                                <Box 
                                    key={comment.id || index} 
                                    sx={{ 
                                        backgroundColor: '#140f0c', 
                                        p: '10px 14px', 
                                        borderRadius: '8px', 
                                        border: '1px solid #22150d',
                                        transition: 'border-color 0.2s',
                                        '&:hover': { borderColor: '#321e11' }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '4px' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Avatar sx={{ width: 22, height: 22, fontSize: '0.7rem', bgcolor: '#b45309', color: '#fff', fontWeight: 700 }}>
                                                {comment.username.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Typography component="span" sx={{ color: '#fbbf24', fontWeight: 600, fontSize: '0.85rem' }}>
                                                {comment.username}
                                            </Typography>
                                        </Box>
                                        <Typography component="span" sx={{ color: '#9ca3af', fontSize: '0.7rem' }}>
                                            {comment.date}
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ m: 0, fontSize: '0.88rem', color: '#e5e7eb', wordBreak: 'break-word', pl: '30px', lineHeight: 1.4 }}>
                                        {comment.text}
                                    </Typography>
                                </Box>
                            ))
                        )}
                    </Box>

                    {/* Footer */}
                    <Box sx={{ px: '20px', py: '12px', bgcolor: '#140f0c', borderTop: '1px solid #321e11', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                            Showing <strong>{selectedBookComments.comments.length}</strong> {selectedBookComments.comments.length === 1 ? 'comment' : 'comments'}
                        </Typography>
                        <Button 
                            onClick={() => setSelectedBookComments(null)}
                            sx={{
                                backgroundColor: '#b45309',
                                color: '#fff',
                                px: '14px',
                                py: '6px',
                                borderRadius: '6px',
                                fontWeight: '600',
                                fontSize: '0.8rem',
                                textTransform: 'none',
                                '&:hover': { backgroundColor: '#d97706' }
                            }}
                        >
                            Close
                        </Button>
                    </Box>
                </Dialog>
            )}
        </>
    )
}

export default BookAnalytic
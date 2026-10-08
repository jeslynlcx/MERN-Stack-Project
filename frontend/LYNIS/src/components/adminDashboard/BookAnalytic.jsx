import React, { useState } from 'react';

function BookAnalytic({ books, users, logs, bookmarks, search, sortOption }) {
    const [selectedBookComments, setSelectedBookComments] = useState(null);

    // Filter books by search keyword
    const filteredBooks = books.filter(book =>
        book.name && book.name.toLowerCase().includes(search.toLowerCase())
    );

    // Compute metrics for sorting purposes
    const processedBooks = filteredBooks.map(book => {
        const bookIdStr = book._id?.toString();
        const bookBookmarks = bookmarks ? bookmarks.filter(b => {
            const bContentId = b.contentId?._id || b.contentId;
            return bContentId?.toString() === bookIdStr;
        }) : [];

        const bookmarkComments = bookBookmarks
            .filter(b => b.comment && b.comment.trim() !== "")
            .map(b => ({
                id: b._id,
                username: b.userId?.username || "Anonymous User",
                text: b.comment,
                date: b.lastAccessed ? new Date(b.lastAccessed).toLocaleDateString() : 'N/A'
            }));

        const logComments = logs ? logs.filter(log => {
            const logContentId = log.contentId?._id || log.contentId;
            return logContentId?.toString() === bookIdStr && 
                   (log.action === 'COMMENT' || log.action === 'FEEDBACK_REVIEWED');
        }).map(log => ({
            id: log._id,
            username: log.userId?.username || "Anonymous User",
            text: log.details || log.comment,
            date: log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'N/A'
        })) : [];

        const allBookComments = [...bookmarkComments, ...logComments];
        const totalLikes = bookBookmarks.filter(b => b.isLiked === true).length;
        
        const ratedBookmarks = bookBookmarks.filter(b => b.rating !== undefined && b.rating !== null && b.rating > 0);
        const avgRating = ratedBookmarks.length > 0 
            ? (ratedBookmarks.reduce((sum, b) => sum + Number(b.rating), 0) / ratedBookmarks.length) 
            : 0;

        return {
            ...book,
            allBookComments,
            totalLikes,
            avgRating,
            ratedCount: ratedBookmarks.length,
            // Fallback for different common date field names in MongoDB schemas
            createdAtTime: new Date(book.createdAt || book.dateAdded || book.releaseDate || 0).getTime()
        };
    });

    // Apply Sorting logic based on dropdown selection
    processedBooks.sort((a, b) => {
        if (sortOption === 'latest') {
            return b.createdAtTime - a.createdAtTime; // Newest first
        } else if (sortOption === 'likes') {
            return b.totalLikes - a.totalLikes;
        } else if (sortOption === 'rating') {
            return b.avgRating - a.avgRating;
        } else if (sortOption === 'comments') {
            return b.allBookComments.length - a.allBookComments.length;
        } else {
            // Title A-Z
            return (a.name || '').localeCompare(b.name || '');
        }
    });

    if (processedBooks.length === 0) {
        return <div className="admin-status-msg">No book analytics records available.</div>;
    }

    return (
        <>
            <table className="user-info-table">
                <thead>
                    <tr>
                        <th>Book Title</th>
                        <th>Category</th>
                        <th>Comments Count</th>
                        <th>Total Likes (All Users)</th>
                        <th>Average Rating (All Users)</th>
                    </tr>
                </thead>
                <tbody>
                    {processedBooks.map((book) => (
                        <tr key={book._id}>
                            <td className="user-name-text">
                                <strong>{book.name}</strong>
                            </td>
                            <td className="user-email-text">
                                {book.category?.name || book.category || 'General'}
                            </td>
                            <td>
                                <button 
                                    onClick={() => setSelectedBookComments({ bookTitle: book.name, comments: book.allBookComments })}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                    title="Click to view all comments"
                                >
                                    <span className="role-pill role-user" style={{ cursor: 'pointer' }}>
                                        💬 {book.allBookComments.length} Comments (View)
                                    </span>
                                </button>
                            </td>
                            <td>
                                <span style={{ color: '#ffb703', fontWeight: 'bold' }}>
                                    ❤️ {book.totalLikes} {book.totalLikes === 1 ? 'Like' : 'Likes'}
                                </span>
                            </td>
                            <td>
                                <span style={{ color: '#ffb703', fontWeight: 'bold' }}>
                                    ⭐ {book.avgRating > 0 ? book.avgRating.toFixed(1) : 'N/A'} {book.ratedCount > 0 && `(${book.ratedCount})`}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Comments Modal Overlay */}
            {selectedBookComments && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#1f2937',
                        padding: '25px',
                        borderRadius: '10px',
                        width: '90%',
                        maxWidth: '550px',
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        border: '1px solid #374151',
                        color: '#f3f4f6'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #374151', paddingBottom: '10px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>
                                Comments for "{selectedBookComments.bookTitle}"
                            </h3>
                            <button 
                                onClick={() => setSelectedBookComments(null)}
                                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '1.2rem', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ overflowY: 'auto', flexGrow: 1, paddingRight: '5px' }}>
                            {selectedBookComments.comments.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px 0' }}>No comments recorded for this book yet.</p>
                            ) : (
                                selectedBookComments.comments.map((c, index) => (
                                    <div key={c.id || index} style={{
                                        backgroundColor: '#111827',
                                        padding: '12px',
                                        borderRadius: '6px',
                                        marginBottom: '10px',
                                        border: '1px solid #374151'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.85rem' }}>
                                            <strong style={{ color: '#fbbf24' }}>{c.username}</strong>
                                            <span style={{ color: '#9ca3af' }}>{c.date}</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#e5e7eb', wordBreak: 'break-word' }}>
                                            {c.text}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>

                        <div style={{ marginTop: '15px', textAlign: 'right' }}>
                            <button 
                                onClick={() => setSelectedBookComments(null)}
                                style={{
                                    backgroundColor: '#b45309',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default BookAnalytic;
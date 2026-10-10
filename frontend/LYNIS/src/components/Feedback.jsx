import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, Modal, Fade,CircularProgress} from '@mui/material';
import api from '../utils/api';

const fetchUserId = () => {
    try {
        const token = localStorage.getItem("token")
        if (!token) return null
        
        const payload = token.split('.')[1]
        const decoded = JSON.parse(window.atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) 
        return decoded.userId
    } catch {
        return null
    }
}

function Feedback() {
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("submit") // 'submit' or 'history'
    const [comment, setComment] = useState("")
    const [actionType, setActionType] = useState("FEEDBACK_REVIEWED")
    const [submitting, setSubmitting] = useState(false)
    
    const [myHistory, setMyHistory] = useState([])
    const [loadingHistory, setLoadingHistory] = useState(false)

    useEffect(() => {
        if (activeTab === "history" && isOpen) {
            fetchMyHistory()
        }
    }, [activeTab, isOpen])

    const fetchMyHistory = async () => {
        setLoadingHistory(true)
        try {
            const token = localStorage.getItem("token")
            const response = await api.get("/activityLogs/my-feedback", {
                headers: { Authorization: `Bearer ${token}` }
            })
            setMyHistory(response.data)
        } catch (error) {
            console.error("Failed to fetch feedback history:", error)
        } finally {
            setLoadingHistory(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const userId = fetchUserId()
        if (!userId) return alert("Please log in to submit feedback.")

        setSubmitting(true)
        try {
            const token = localStorage.getItem("token")
            await api.post("/activityLogs", {
                userId,
                action: actionType, 
                details: comment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            alert("Thank you! Your submission has been recorded successfully.")
            setComment("")
            setActiveTab("history")
            fetchMyHistory()
        } catch (error) {
            console.error("Failed to submit feedback:", error)
            alert("Failed to submit feedback.")
        } finally {
            setSubmitting(false)
        }
    }

    const inputStyles = {
        input: { color: "#fff" },
        "& .MuiOutlinedInput-root": {
            bgcolor: "#0b0806",
            borderRadius: "6px",
            color: "#fff",
            "& fieldset": { borderColor: "#321e11" },
            "&:hover fieldset": { borderColor: "#321e11" },
            "&.Mui-focused fieldset": { borderColor: "#d97706" }
        }
    }

    return (
        <>
            {/* Floating Feedback Button */}
            <Button
                onClick={() => setIsOpen(true)}
                sx={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    backgroundColor: '#b45309',
                    color: '#ffffff',
                    borderRadius: '30px',
                    padding: '12px 20px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background-color 0.2s, transform 0.2s',
                    '&:hover': {
                        backgroundColor: '#d97706',
                        transform: 'translateY(-2px)'
                    }
                }}
            >
                💬 Feedback
            </Button>

            <Modal
                open={isOpen}
                onClose={() => setIsOpen(false)}
                closeAfterTransition
                disableEnforceFocus
                disableScrollLock
                slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(3px)' } } }}
                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <Fade in={isOpen}>
                    <Box 
                        sx={{ 
                            bgcolor: '#17110d', 
                            border: '2px solid #3c3b3a', 
                            borderRadius: '12px', 
                            padding: '28px', 
                            width: '100%', 
                            maxWidth: '480px', 
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.95)',
                            color: '#f3f4f6',
                            outline: 'none',
                            boxSizing: 'border-box',
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#1e1b1a #0b0806'
                        }}
                    >
                        {/* Tab Headers inside modal */}
                        <Box sx={{ display: 'flex', gap: '20px', marginBottom: '15px', borderBottom: '1px solid #321e11', paddingBottom: '10px' }}>
                            <Button 
                                onClick={() => setActiveTab("submit")}
                                sx={{
                                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px',
                                    fontWeight: 'bold', textTransform: 'none', minWidth: 'auto', p: 0,
                                    color: activeTab === 'submit' ? '#fbbf24' : '#9ca3af',
                                    paddingBottom: '2px', borderBottom: activeTab === 'submit' ? '2px solid #b45309' : 'none',
                                    borderRadius: 0,
                                    '&:hover': { background: 'none', color: '#fff' }
                                }}
                            >
                                Send Feedback
                            </Button>
                            <Button 
                                onClick={() => setActiveTab("history")}
                                sx={{
                                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px',
                                    fontWeight: 'bold', textTransform: 'none', minWidth: 'auto', p: 0,
                                    color: activeTab === 'history' ? '#fbbf24' : '#9ca3af',
                                    paddingBottom: '2px', borderBottom: activeTab === 'history' ? '2px solid #b45309' : 'none',
                                    borderRadius: 0,
                                    '&:hover': { background: 'none', color: '#fff' }
                                }}
                            >
                                My History
                            </Button>
                        </Box>

                        {activeTab === "submit" ? (
                            <>
                                <Typography sx={{ mt: 0, mb: '8px', fontSize: '1.3rem', fontWeight: 700, color: '#fef3c7' }}>
                                    Send Feedback
                                </Typography>
                                <Typography sx={{ fontSize: '0.88rem', color: '#9ca3af', mb: '20px' }}>
                                    Found a bug or have an idea to improve LYNIS? Let us know!
                                </Typography>
                                
                                <Box component="form" onSubmit={handleSubmit}>
                                    <Typography sx={{ fontSize: '13px', display: 'block', mb: '5px', color: '#9ca3af' }}>
                                        Submission Type
                                    </Typography>
                                    <Select 
                                        value={actionType} 
                                        onChange={(e) => setActionType(e.target.value)}
                                        size="small"
                                        fullWidth
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
                                            mb: '12px', 
                                            backgroundColor: '#0b0806', 
                                            color: '#fff', 
                                            border: '1px solid #321e11', 
                                            borderRadius: '6px',
                                            ".MuiSelect-select": { color: "#fff", py: "8px" },
                                            ".MuiOutlinedInput-notchedOutline": { border: "none" },
                                            ".MuiSvgIcon-root": { color: "#9ca3af" }
                                        }}
                                    >
                                        <MenuItem value="FEEDBACK_REVIEWED">Feedback / Feature Request</MenuItem>
                                        <MenuItem value="REPORT">Report / Issue</MenuItem>
                                        <MenuItem value="OTHER">OTHER</MenuItem>
                                    </Select>

                                    <TextField 
                                        placeholder="Type your thoughts or bug report here..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        required
                                        multiline
                                        rows={4}
                                        fullWidth
                                        sx={{ 
                                            ...inputStyles,
                                            mb: '16px',
                                            textarea: { color: "#fff", resize: 'none' }
                                        }}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                        <Button 
                                            type="button" 
                                            onClick={() => setIsOpen(false)}
                                            sx={{ 
                                                bgcolor: 'transparent', 
                                                color: '#9ca3af', 
                                                border: '1px solid #321e11', 
                                                borderRadius: '6px', 
                                                padding: '8px 18px', 
                                                textTransform: 'none',
                                                '&:hover': { bgcolor: '#1c140f', color: '#fff' }
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            disabled={submitting}
                                            variant="contained"
                                            sx={{ 
                                                bgcolor: '#b45309', 
                                                color: 'white', 
                                                borderRadius: '6px', 
                                                padding: '8px 18px', 
                                                fontWeight: 600, 
                                                textTransform: 'none',
                                                '&:hover': { bgcolor: '#d97706' }
                                            }}
                                        >
                                            {submitting ? "Sending..." : "Submit"}
                                        </Button>
                                    </Box>
                                </Box>
                            </>
                        ) : (
                            <>
                                <Typography sx={{ mt: 0, mb: '8px', fontSize: '1.3rem', fontWeight: 700, color: '#fef3c7' }}>
                                    Your Submitted History
                                </Typography>
                                <Typography sx={{ color: '#9ca3af', fontSize: '13px', mb: '15px' }}>
                                    Review what you have previously sent to our platform.
                                </Typography>

                                {loadingHistory ? (
                                    <Box sx={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>
                                        <CircularProgress size={24} sx={{ color: '#b45309' }} />
                                    </Box>
                                ) : myHistory.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', padding: '20px', background: '#0b0806', border: '1px solid #321e11', borderRadius: '6px', color: '#9ca3af', fontSize: '0.9rem' }}>
                                        You haven't submitted any feedback yet.
                                    </Box>
                                ) : (
                                    <Box sx={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '5px' }}>
                                        {myHistory.map((item) => (
                                            <Box key={item._id} sx={{ background: '#0b0806', border: '1px solid #321e11', padding: '12px', borderRadius: '6px' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                    <Box component="span" sx={{ fontSize: '11px', background: '#b45309', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                                        {item.action}
                                                    </Box>
                                                    <Box component="span" sx={{ fontSize: '11px', color: '#9ca3af' }}>
                                                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                                                    </Box>
                                                </Box>
                                                <Typography sx={{ margin: 0, fontSize: '13px', color: '#f3f4f6', wordBreak: 'break-word' }}>
                                                    {item.details}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                )}

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: '20px' }}>
                                    <Button 
                                        type="button" 
                                        onClick={() => setIsOpen(false)}
                                        sx={{ 
                                            width: '100%',
                                            bgcolor: 'transparent', 
                                            color: '#9ca3af', 
                                            border: '1px solid #321e11', 
                                            borderRadius: '6px', 
                                            padding: '8px 18px', 
                                            textTransform: 'none',
                                            '&:hover': { bgcolor: '#1c140f', color: '#fff' }
                                        }}
                                    >
                                        Close
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Box>
                </Fade>
            </Modal>
        </>
    )
}

export default Feedback
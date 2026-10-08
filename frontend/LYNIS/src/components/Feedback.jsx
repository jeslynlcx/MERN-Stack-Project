import { useState, useEffect } from 'react';
import api from '../utils/api';
import './Feedback.css';

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

    // Fetch user's own history whenever the history tab is opened
    useEffect(() => {
        if (activeTab === "history" && isOpen) {
            fetchMyHistory();
        }
    }, [activeTab, isOpen]);

    const fetchMyHistory = async () => {
        setLoadingHistory(true);
        try {
            const token = localStorage.getItem("token");
            const response = await api.get("/activityLogs/my-feedback", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyHistory(response.data);
        } catch (error) {
            console.error("Failed to fetch feedback history:", error);
        } finally {
            setLoadingHistory(false);
        }
    };

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
            setActiveTab("history") // Switches to history tab
            fetchMyHistory()        // Immediately fetch updated history list!
        } catch (error) {
            console.error("Failed to submit feedback:", error)
            alert("Failed to submit feedback.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <button className="floating-btn" onClick={() => setIsOpen(true)}>
                💬 Feedback
            </button>

            {isOpen && (
                <div className="modal-overlay">
                    <div className="modal-card" style={{ width: '480px', maxWidth: '90%' }}>
                        {/* Tab Headers inside modal */}
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', borderBottom: '1px solid #374151', paddingBottom: '10px' }}>
                            <button 
                                onClick={() => setActiveTab("submit")}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px',
                                    fontWeight: 'bold', color: activeTab === 'submit' ? '#b45309' : '#9ca3af',
                                    paddingBottom: '2px', borderBottom: activeTab === 'submit' ? '2px solid #b45309' : 'none'
                                }}
                            >
                                Send Feedback
                            </button>
                            <button 
                                onClick={() => setActiveTab("history")}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px',
                                    fontWeight: 'bold', color: activeTab === 'history' ? '#b45309' : '#9ca3af',
                                    paddingBottom: '2px', borderBottom: activeTab === 'history' ? '2px solid #b45309' : 'none'
                                }}
                            >
                                My History
                            </button>
                        </div>

                        {activeTab === "submit" ? (
                            <>
                                <h3>Send Feedback</h3>
                                <p>Found a bug or have an idea to improve LYNIS? Let us know!</p>
                                
                                <form onSubmit={handleSubmit}>
                                    <label style={{ fontSize: '13px', display: 'block', marginBottom: '5px', color: '#9ca3af' }}>
                                        Submission Type
                                    </label>
                                    <select 
                                        value={actionType} 
                                        onChange={(e) => setActionType(e.target.value)}
                                        style={{ 
                                            width: '100%', padding: '10px', marginBottom: '12px', 
                                            backgroundColor: '#111827', color: '#fff', 
                                            border: '1px solid #374151', borderRadius: '6px' 
                                        }}
                                    >
                                        <option value="FEEDBACK_REVIEWED">Feedback / Feature Request</option>
                                        <option value="REPORT">Report / Issue</option>
                                        <option value="OTHER">OTHER</option>
                                    </select>

                                    <textarea 
                                        className="feedback-textarea"
                                        placeholder="Type your thoughts or bug report here..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        required
                                    />
                                    <div className="feedback-actions">
                                        <button 
                                            type="button" 
                                            className="cancel-btn" 
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="submit-btn"
                                            disabled={submitting}
                                        >
                                            {submitting ? "Sending..." : "Submit"}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <>
                                <h3>Your Submitted History</h3>
                                <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '15px' }}>
                                    Review what you have previously sent to our platform.
                                </p>

                                {loadingHistory ? (
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>Loading history...</div>
                                ) : myHistory.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '20px', background: '#111827', borderRadius: '6px', color: '#9ca3af' }}>
                                        You haven't submitted any feedback yet.
                                    </div>
                                ) : (
                                    <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '5px' }}>
                                        {myHistory.map((item) => (
                                            <div key={item._id} style={{ background: '#111827', border: '1px solid #374151', padding: '12px', borderRadius: '6px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                    <span style={{ fontSize: '11px', background: '#b45309', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                                        {item.action}
                                                    </span>
                                                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                                                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                                                    </span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '13px', color: '#f3f4f6', wordBreak: 'break-word' }}>
                                                    {item.details}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="feedback-actions" style={{ marginTop: '20px' }}>
                                    <button 
                                        type="button" 
                                        className="cancel-btn" 
                                        onClick={() => setIsOpen(false)}
                                        style={{ width: '100%' }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default Feedback
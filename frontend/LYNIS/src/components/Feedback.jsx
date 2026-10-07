import { useState } from 'react';
import api from '../utils/api';
import './Feedback.css';

const fetchUserId = () => {
    try {
        const token = localStorage.getItem("token")
        if (!token) return null
        
        const payload = token.split('.')[1]
        const decoded = JSON.parse(window.atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) //Decodes the Base64 payload string back into JSON text
        
        return decoded.userId
    } catch {
        return null
    }
}

function Feedback() {
    const [isOpen, setIsOpen] = useState(false)
    const [comment, setComment] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        const userId = fetchUserId()
        if (!userId) return alert("Please log in to submit feedback.")

        setSubmitting(true)
        try {
            await api.post("/activityLogs", {
                userId,
                action: "FEEDBACK_REVIEWED", 
                details: `User Feedback: ${comment}`
            })

            alert("Thank you! Your feedback has been recorded successfully.")
            setComment("")
            setIsOpen(false)
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
                    <div className="modal-card">
                        <h3>Send Feedback</h3>
                        <p>Found a bug or have an idea to improve LYNIS ? Let us know!</p>
                        
                        <form onSubmit={handleSubmit}>
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
                    </div>
                </div>
            )}
        </>
    )
}

export default Feedback
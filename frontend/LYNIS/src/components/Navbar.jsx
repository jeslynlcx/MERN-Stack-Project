import { useNavigate, useLocation } from "react-router";
import { useState, useEffect } from "react";
import api from '../utils/api';
import Feedback from "./Feedback";
import "./Navbar.css";

function Navbar() {
    const [avatarUrl, setAvatarUrl] = useState("/default-avatar.png")
    const navigate = useNavigate()
    const location = useLocation()

    const isActive = (path) => location.pathname === path //checks if a path matches the current page URL, for button "active" to light that button
    const token = localStorage.getItem("token") 
    const userRole = localStorage.getItem("role") 

   useEffect(() => {
        if (!token) return

        const fetchAvatar = async () => {
            try {
                const userId = JSON.parse(window.atob(token.split('.')[1])).userId //extract the userID
                const response = await api.get(`/users/${userId}`)

                if (response.data?.avatarUrl) { //Checks if the response successfully includes avatar URL.
                    const url = response.data.avatarUrl
                    setAvatarUrl(url.startsWith('http') ? url : `http://localhost:2406${url}`)
                }
            } catch (error) {
                console.error("Avatar error:", error)
            }
        }

        fetchAvatar()
    }, [token])

    return (
        <>
        <nav className="nav">
            <div onClick={() => navigate("/")}>
                <span className="nav-logo"><img src="./logo.png" alt="Logo" /></span>
            </div>
            
            <div className="nav-links">
                <button onClick={() => navigate("/home")} className={`nav-link-item ${isActive("/home") ? "active" : ""}`}>Home</button>
                <button onClick={() => navigate("/bookshelf")} className={`nav-link-item ${isActive("/bookshelf") ? "active" : ""}`}>Bookshelf</button>
                <button onClick={() => navigate("/catalog")} className={`nav-link-item ${isActive("/catalog") ? "active" : ""}`}>Catalog</button>

                {token && userRole === 'admin' && (
                    <button onClick={() => navigate("/dashboard")} className={`nav-link-item admin-link-pill ${isActive("/dashboard") ? "active" : ""}`}>
                        Admin Vault ⚙️
                    </button>
                )}
            </div>

            <div className="nav-profile" onClick={() => navigate("/profile")} title="View Profile">
                <img className="nav-avatar" src={avatarUrl} alt="Profile" onError={(e) => e.target.src = "/default-avatar.png"} />
            </div>
        </nav>
        <Feedback />
        </>
    )
}

export default Navbar
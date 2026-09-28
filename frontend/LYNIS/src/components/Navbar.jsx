import { useNavigate, useLocation } from "react-router";
import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    // Helper to check active link
    const isActive = (path) => location.pathname === path;

    // Check if user is logged in and verify their role
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role"); // 'admin' or 'user'

    return (
        <nav className="cabinet-nav">
            <div className="nav-brand-group" onClick={() => navigate("/")}>
                <span className="nav-icon">📖</span>
                <h2 className="nav-brand-title">MagCabinet</h2>
            </div>

            <div className="nav-links-group">
                <button 
                    onClick={() => navigate("/")} 
                    className={`nav-link-item ${isActive("/") || isActive("/home") ? "active" : ""}`}
                >
                    Home
                </button>
                <button 
                    onClick={() => navigate("/bookshelf")} 
                    className={`nav-link-item ${isActive("/bookshelf") ? "active" : ""}`}
                >
                    Bookshelf
                </button>
                <button 
                    onClick={() => navigate("/catalog")} 
                    className={`nav-link-item ${isActive("/catalog") ? "active" : ""}`}
                >
                    Catalog
                </button>

                {/* Conditionally render Admin Dashboard link ONLY for admins */}
                {token && userRole === 'admin' && (
                    <button 
                        onClick={() => navigate("/dashboard")} 
                        className={`nav-link-item admin-link-pill ${isActive("/dashboard") ? "active" : ""}`}
                    >
                        Admin Vault ⚙️
                    </button>
                )}
            </div>

            {/* Profile Section */}
            <div className="nav-profile-group" onClick={() => navigate("/profile")} title="View Profile">
                <img 
                    src="https://picsum.photos/seed/user123/100/100" 
                    alt="Profile Avatar" 
                    className="nav-avatar"
                />
            </div>
        </nav>
    );
}

export default Navbar;
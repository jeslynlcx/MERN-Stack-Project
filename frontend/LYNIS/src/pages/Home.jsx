import { useNavigate } from "react-router";
import "./Home.css";
import Navbar from "../components/Navbar"; 

function HomePage() {
    const navigate = useNavigate();
    const userAvatar = "https://picsum.photos/seed/user123/100/100";

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <div className="login-wrapper home-wrapper">
            
            {/* TOP HEADER */}
            <Navbar/>
            {/* HERO SECTION (Removed login-card so it's clean and centered) */}
            <div className="hero-section">
                <h1 className="hero-title">Your Digital Magazine Sanctuary</h1>
                <p className="hero-desc">
                    Organize, explore, and immerse yourself in your personal antique cabinet filled with your favorite magazine and book collections.
                </p>
                <button 
                    onClick={() => navigate("/bookshelf")} 
                    className="login-btn hero-cta"
                >
                    Open Bookshelf Cabinet
                </button>
            </div>

            {/* MIDDLE CONTENT: FEATURES (All 3 will sit nicely in one row) */}
            <div className="features-container">
                <div className="feature-box">
                    <h3>📚 5x5 Grid Shelves</h3>
                    <p>Neatly mapped inside an antique wooden display cabinet layout.</p>
                </div>
                <div className="feature-box">
                    <h3>👤 User Profiles</h3>
                    <p>Manage your account settings, preferences, and saved collections easily.</p>
                </div>
                <div className="feature-box">
                    <h3>⚡ Secure Cloud</h3>
                    <p>Access your favorite issues anytime, anywhere with safe account login.</p>
                </div>
            </div>

            <div className="teaser-container">
                <h3>Featured Collections</h3>
                <p className="teaser-sub">Explore top-rated vintage issues and modern catalog arrivals.</p>
            </div>

            {/* BOTTOM FOOTER */}
            <footer className="home-footer">
                <div className="footer-content">
                    <div className="footer-col">
                        <h4>MagCabinet</h4>
                        <p>Contact: support@magcabinet.com</p>
                    </div>
                    <div className="footer-col">
                        <h4>Quick Links</h4>
                        <span onClick={() => navigate("/about")}>Privacy Policy</span>
                        <span onClick={() => navigate("/about")}>Terms of Service</span>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2026 MagCabinet. All rights reserved.</p>
                </div>
            </footer>

        </div>
    );
}

export default HomePage;
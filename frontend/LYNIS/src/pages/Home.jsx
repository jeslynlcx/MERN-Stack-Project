import { useNavigate } from "react-router";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import "../styles/Home.css";
import Navbar from "../components/Navbar" ;

function HomePage() {
    const navigate = useNavigate()

    return (
        <div className="home-wrapper">
            <Navbar />
            
            <header className="hero-section text-center">
                <div className="hero-glow-accent"></div>
                <Container className="hero-container-inner position-relative">

                    <h1 className="hero-title">Digital Books and Magazine</h1>
                    <p className="hero-desc">
                        Organize, explore, and immerse yourself in your personal antique cabinet filled with your favorite magazine and book collections.
                    </p>
                    <div className="hero-cta-group">
                        <Button 
                            onClick={() => navigate("/bookshelf")} 
                            className="hero-cta"
                            variant="warning"
                        >
                            📚 Browse the Shelves
                        </Button>
                        <Button 
                            onClick={() => navigate("/catalog")} 
                            className="hero-cta-secondary"
                            variant="outline-light"
                        >
                            Explore Catalog
                        </Button>
                    </div>
                </Container>
            </header>

            {/* Features Grid Section */}
            <Container className="features-container">
                <div className="text-center mb-5">
                    <h2 className="section-heading">Designed for Avid Readers</h2>
                    <p className="section-subheading">Everything you need for a seamless, immersive digital reading experience.</p>
                </div>
                <Row className="g-4">
                    <Col xs={12} md={4}>
                        <Card className="feature-box h-100">
                            <Card.Body className="d-flex flex-column">
                                <div className="feature-icon-wrapper mb-3">📖</div>
                                <Card.Title as="h3">Page-Flip Viewer</Card.Title>
                                <Card.Text>
                                    Turn pages like a printed issue. Remembers your exact page and opens right where you left off automatically.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} md={4}>
                        <Card className="feature-box h-100">
                            <Card.Body className="d-flex flex-column">
                                <div className="feature-icon-wrapper mb-3">🛡️</div>
                                <Card.Title as="h3">Secure Account Hub</Card.Title>
                                <Card.Text>
                                    Manage your account credentials, preferences, personal reading history, and custom book collections safely.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} md={4}>
                        <Card className="feature-box h-100">
                            <Card.Body className="d-flex flex-column">
                                <div className="feature-icon-wrapper mb-3">💬</div>
                                <Card.Title as="h3">Rate, Like & Comment</Card.Title>
                                <Card.Text>
                                    Open any title to award star ratings, bookmark favorites with a like, and join live reader discussions.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Teaser Banner */}
            <div className="teaser-banner-wrapper">
                <Container className="teaser-inner text-center py-5">
                    <h3>Curated for Quality & Nostalgia</h3>
                    <p className="teaser-sub">From rare vintage issues to modern digital publications—all in one secure cabinet.</p>
                    <div className="stats-row mt-4">
                        <div className="stat-item">
                            <h4>100%</h4>
                            <p>Digital & Portable</p>
                        </div>
                        <div className="stat-item">
                            <h4>⚡ Instant</h4>
                            <p>Page-Flip Loading</p>
                        </div>
                        <div className="stat-item">
                            <h4>🔒 Secure</h4>
                            <p>Private Vault Storage</p>
                        </div>
                    </div>
                </Container>
            </div>

            {/* Footer Section */}
            <footer className="home-footer">
                <div className="footer-content">
                    <div className="footer-col brand-col">
                        <h3 className="footer-logo">LYNIS-Cabinet</h3>
                        <p className="footer-description">
                            Your secure digital vault for organizing records, exploring curated reads, and managing platform activity seamlessly.
                        </p>
                        <div className="footer-contact-info">
                            <span>📧 <a href="mailto:jeslynleecx@gmail.com">jeslynleecx@gmail.com</a></span>
                        </div>
                    </div>

                    <div className="footer-col">
                        <h4>Explore</h4>
                        <span onClick={() => navigate("/bookshelf")}>Bookshelf</span>
                        <span onClick={() => navigate("/catalog")}>BookSort</span>
                        <span onClick={() => navigate("/profile")}>My Bookmarks</span>
                    </div>

                    <div className="footer-col">
                        <h4>Connect</h4>
                        <a href="https://www.instagram.com/jeslyn.lee08/" target="_blank" rel="noopener noreferrer">Instagram</a>
                        <a href="https://github.com/jeslynlcx" target="_blank" rel="noopener noreferrer">GitHub</a>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2026 LYNIS-Cabinet. All rights reserved.</p>
                    <div className="footer-bottom-links">
                        <span onClick={() => navigate("")}>Privacy</span>
                        <span>•</span>
                        <span onClick={() => navigate("")}>Terms</span>
                        <span>•</span>
                        <span onClick={() => navigate("")}>Security</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default HomePage
import { useState, useEffect } from "react";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import Book from "../components/BookModal";
import "../styles/Bookshelf.css";

function Bookshelf() {
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sort, setSort] = useState("name");
    const [selectedBook, setSelectedBook] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isAdmin, setIsAdmin] = useState(false);

    const ITEMS_PER_SHELF_ROW = 4;
    const TOTAL_ROWS_PER_PAGE = 3;
    const ITEMS_PER_PAGE = ITEMS_PER_SHELF_ROW * TOTAL_ROWS_PER_PAGE;

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const userRole = localStorage.getItem("role") || user.role;
        if (userRole === "admin" || user.isAdmin === true) {
            setIsAdmin(true);
        }
    }, []);

    const processedContents = contents
        .filter((item) => {
            const status = item.status || "Published" //users only see published books
            if (!isAdmin) {
                if (status !== "Published") return false
            }
            if (selectedCategory !== "All" && item.category !== selectedCategory) {
                return false;
            }
            return true;
        })
        .sort((a, b) => {
            if (sort === "name") return (a.name || "").localeCompare(b.name || "");
            if (sort === "rating") return (b.averageRating || 0) - (a.averageRating || 0);
            if (sort === "pages") return (b.totalPages || 0) - (b.totalPages || 0);
            return 0;
        });

    const totalPages = Math.ceil(processedContents.length / ITEMS_PER_PAGE) || 1;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentBookshelfItems = processedContents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const shelfRows = [currentBookshelfItems.slice(0, 4), currentBookshelfItems.slice(4, 8), currentBookshelfItems.slice(8, 12)];

    useEffect(() => {
        const fetchContents = async () => {
            try {
                const response = await api.get("/contents");
                setContents(response.data);
            } catch (error) {
                setError("Failed to fetch. Please try again");
                console.error("Fetch error", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContents();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, sort]);

    const handleOpenBookModal = (item) => {
        const status = item.status || "Published";
        if (!isAdmin && status !== "Published") return;
        setSelectedBook(item);
    };

    return (
        <div className="bookshelf-page">
            <Navbar />
            <div className="bookshelf-container">
                <div className="header">
                    <div>
                        <h1>Digital Bookshelf</h1>
                        <p>Browse your library collection organized across antique shelves</p>
                    </div>
                </div>

                <div className="filter-sort">
                    <div className="select-wrapper">
                        <label>Category Filter:</label>
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="panel-select">
                            {["All", ...new Set(contents.map((item) => item.category).filter(Boolean))].map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="select-wrapper">
                        <label>Sort By:</label>
                        <select value={sort} onChange={(e) => setSort(e.target.value)} className="panel-select">
                            <option value="name">Title (A-Z)</option>
                            <option value="rating">Top Rated</option>
                            <option value="pages">Page Count</option>
                        </select>
                    </div>
                </div>

                <div className="bookshelf">
                    {loading && <p className="loading">Loading...</p>}

                    {error && <p className="error">{error}</p>}

                    {!loading && !error && (
                        <div>
                            <div className="bookshelf-spotlight"></div>

                            {currentBookshelfItems.length === 0 ? (
                                <div className="shelf-status-message">No publications found matching your filter criteria.</div>
                            ) : (
                                shelfRows.map((rowItems, rowIndex) => (
                                    <div key={rowIndex} className="shelf">
                                        <div className="shelf-row-horizontal">
                                            {rowItems.map((item) => {
                                                const isLocked = item.status === "Draft" || item.status === "Archived";
                                                const statusLabel = item.status === "Draft" ? "(Draft)" : item.status === "Archived" ? "(Archived)" : "";

                                                return (
                                                    <div key={item._id} className={`book-card ${isLocked ? "locked-book-card" : ""}`} onClick={() => handleOpenBookModal(item)} style={isLocked ? { cursor: "not-allowed" } : {}}>
                                                        <div className="book-cover" style={isLocked ? { filter: "grayscale(50%) brightness(0.65)", opacity: 0.75 } : {}}>
                                                            <img
                                                                src={item.coverImageUrl?.startsWith("http") ? item.coverImageUrl : `http://localhost:2406${item.coverImageUrl}`}
                                                                alt={item.name}
                                                                className="book-img"
                                                                style={{ width: "120px", height: "170px", objectFit: "cover" }}
                                                                onError={(e) => {
                                                                    e.target.style.display = "none";
                                                                }}
                                                            />
                                                            <div className="book-hover-overlay">
                                                                <span className="book-title-tag">
                                                                    {item.name} {statusLabel}
                                                                </span>
                                                                <span className="book-category-tag">{item.category}</span>
                                                                <span className="view-details">{isLocked ? `${item.status} (Locked) 🔒` : "View Details 🔍"}</span>
                                                            </div>
                                                        </div>
                                                        <div className="book-shadow"></div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="wooden-shelf-plank">
                                            <div className="plank-grain-overlay"></div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div className="shelfPage-bar">
                    <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="shelfPage-btn">
                        ← Prev Shelf
                    </button>

                    <div className="shelfPage-indicator">
                        Shelf Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                    </div>

                    <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="shelfPage-btn">
                        Next Shelf →
                    </button>
                </div>
            </div>

            {selectedBook && <Book book={selectedBook} onClose={() => setSelectedBook(null)} />}
        </div>
    );
}
export default Bookshelf;

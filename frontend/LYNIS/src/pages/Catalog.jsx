import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import CatalogModal from "../components/CatalogModal";
import "./Catalog.css";

function Catalog() {
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [isAdmin, setIsAdmin] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEditingItem, setCurrentEditingItem] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const userRole = localStorage.getItem("role") || user.role;
        if (userRole === "admin" || user.isAdmin === true) {
            setIsAdmin(true);
        }
    }, []);

    const fetchContents = async () => {
        try {
            const response = await api.get("/contents");
            setContents(response.data);
        } catch (error) {
            setError("Failed to fetch. Please try again")
            console.error("Error fetching catalog contents:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContents();
    }, []);

    const handleOpenCreateModal = () => {
        setCurrentEditingItem(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item, e) => {
        e.stopPropagation();
        setCurrentEditingItem(item);
        setIsModalOpen(true);
    };

    const handleSave = async (formData, currentId) => {
        try {
            if (currentId) {
                await api.patch(`/contents/${currentId}`, formData);
                alert("Content updated successfully!");
            } else {
                await api.post("/contents", formData);
                alert("Content added successfully!");
            }
            setIsModalOpen(false);
            fetchContents();
        } catch (error) {
            console.error("Operation failed:", error.response?.data || error.message);
            alert("Error: " + (error.response?.data?.error || error.message));
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this publication?")) {
            try {
                await api.delete(`/contents/${id}`);
                setContents(contents.filter(item => item._id !== id));
                alert("Content deleted successfully.");
            } catch (error) {
                console.error("Delete failed:", error.response?.data || error.message);
                alert("Failed to delete record.");
            }
        }
    };

    const categories = ["All", ...new Set(contents.map(item => item.category).filter(Boolean))];

    const filteredContents = contents
    .filter(item => {
        const status = item.status || "Published";
        if (!isAdmin && status !== "Published") {
            return false;
        }
        const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="catalog-page-wrapper">
            <Navbar />

            <div className="catalog-workspace">
                <div className="catalog-header">
                    <div>
                        <h1>{isAdmin ? "Admin Library Catalog Management" : "Library Catalog"}</h1>
                        <p>{isAdmin ? "Manage publications using multiple URLs or direct multi-image page uploads" : "Browse available publications in the library collection"}</p>
                    </div>
                    <div className="catalog-header-actions">
                        {isAdmin && (
                            <button onClick={handleOpenCreateModal} className="catalog-add-btn">
                                + Add Content
                            </button>
                        )}
                        <div className="catalog-count-badge">
                            Total Items: <strong>{filteredContents.length}</strong>
                        </div>
                    </div>
                </div>

                <div className="catalog-control-panel">
                    <div className="catalog-search-box">
                        <span className="search-icon">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Search content by title..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="catalog-search-input"
                        />
                    </div>

                    <div className="catalog-filter-group">
                        <label>Category Filter:</label>
                        <select 
                            value={selectedCategory} 
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="catalog-select"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="catalog-table-container">
                    {loading && <p className="loading">Loading...</p>}

                    {error && <p className="error">{error}</p>}

                    {!loading && !error && (
                        filteredContents.length === 0 ? (
                            <div className="catalog-status-message">No records found matching your search criteria.</div>
                        ) : (
                            <table className="catalog-table">
                                <thead>
                                    <tr>
                                        <th>Cover</th>
                                        <th>Title & Description</th>
                                        <th>Category</th>
                                        <th>Pages</th>
                                        <th>Status</th>
                                        {isAdmin && <th>Admin Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredContents.map((item) => (
                                        <tr key={item._id} onClick={() => navigate(`/content/${item._id}`)} className="catalog-row">
                                            <td>
                                                <img 
                                                    src={item.coverImageUrl?.startsWith('http') ? item.coverImageUrl : `http://localhost:2406${item.coverImageUrl}`} 
                                                    alt={item.name} 
                                                    className="catalog-thumb"
                                                    onError={(e) => { e.target.style.display = 'none'; }} 
                                                />
                                            </td>
                                            <td>
                                                <span className="item-main-title">{item.name}</span>
                                                <span className="item-sub-desc">{item.description?.substring(0, 60)}...</span>
                                            </td>
                                            <td>
                                                <span className="catalog-category-tag">{item.category}</span>
                                            </td>
                                            <td>{item.totalPages} pgs</td>
                                            <td>
                                                <span className={`status-pill ${item.status?.toLowerCase() || 'published'}`}>
                                                    {item.status || "Published"}
                                                </span>
                                            </td>
                                            {isAdmin && (
                                                <td className="admin-actions-cell" onClick={(e) => e.stopPropagation()}>
                                                    <button 
                                                        className="catalog-edit-btn"
                                                        onClick={(e) => handleOpenEditModal(item, e)}
                                                    >
                                                        Edit ✏️
                                                    </button>
                                                    <button 
                                                        className="catalog-delete-btn"
                                                        onClick={(e) => handleDelete(item._id, e)}
                                                    >
                                                        Delete 🗑️
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )
                    )}
                </div>
            </div>

            {isAdmin && (
                <CatalogModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    onSave={handleSave} 
                    editingItem={currentEditingItem} 
                />
            )}
        </div>
    );
}
export default Catalog
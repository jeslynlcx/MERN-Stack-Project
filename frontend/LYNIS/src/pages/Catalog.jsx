import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import "./Catalog.css";

function Catalog() {
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    
    // Admin role check state
    const [isAdmin, setIsAdmin] = useState(false);

    // Modal & Form states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    // Toggle modes: "url" or "file"
    const [coverMode, setCoverMode] = useState("file");
    const [contentMode, setContentMode] = useState("url");

    // Form text fields
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "",
        coverImageUrl: "",
        contentImageUrls: "", 
        totalPages: 1,
        status: "Published"
    });

    // File states for direct uploads
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [contentImageFiles, setContentImageFiles] = useState([]);

    const navigate = useNavigate();

    // Check user role from localStorage on mount
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
            console.error("Error fetching catalog contents:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContents();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpenCreateModal = () => {
        setIsEditing(false);
        setFormData({ 
            name: "", 
            description: "", 
            category: "", 
            coverImageUrl: "", 
            contentImageUrls: "", 
            totalPages: 1, 
            status: "Published" 
        });
        setCoverImageFile(null);
        setContentImageFiles([]);
        setCoverMode("file");
        setContentMode("url");
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item, e) => {
        e.stopPropagation();
        setIsEditing(true);
        setCurrentId(item._id);
        
        const formattedContentUrls = Array.isArray(item.contentImageUrls) 
            ? item.contentImageUrls.join(", ") 
            : (item.contentImageUrls || "");

        setFormData({
            name: item.name || "",
            description: item.description || "",
            category: item.category || "",
            coverImageUrl: item.coverImageUrl || "",
            contentImageUrls: formattedContentUrls,
            totalPages: item.totalPages || 1,
            status: item.status || "Published"
        });
        setCoverImageFile(null);
        setContentImageFiles([]);
        setCoverMode("url");
        setContentMode("url");
        setIsModalOpen(true);
    };

    // Submit form safely using FormData
    const handleSubmitForm = async (e) => {
        e.preventDefault();
        
        const data = new FormData();
        data.append("name", formData.name || "");
        data.append("description", formData.description || "");
        data.append("category", formData.category || "");
        data.append("totalPages", formData.totalPages || 1);
        data.append("status", formData.status || "Published");

        // Handle Cover Image (File vs URL)
        if (coverMode === "file" && coverImageFile) {
            data.append("coverImage", coverImageFile);
        } else {
            data.append("coverImageUrl", formData.coverImageUrl || "");
        }

        // Handle Content Pages (Multiple Files vs URL text)
        if (contentMode === "file" && contentImageFiles.length > 0) {
            for (let i = 0; i < contentImageFiles.length; i++) {
                data.append("contentImages", contentImageFiles[i]);
            }
        } else {
            data.append("contentImageUrls", formData.contentImageUrls || "");
        }

        try {
            if (isEditing) {
                await api.patch(`/contents/${currentId}`, data);
                alert("Content updated successfully!");
            } else {
                await api.post("/contents", data);
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

    const filteredContents = contents.filter(item => {
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
                        <p>{isAdmin ? "Manage publications using URLs or direct multi-image page uploads" : "Browse available publications in the library collection"}</p>
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
                    {loading ? (
                        <div className="catalog-status-message">Loading library catalog...</div>
                    ) : filteredContents.length === 0 ? (
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
                    )}
                </div>
            </div>

            {/* Modal Form (Admin Only) */}
            {isAdmin && isModalOpen && (
                <div className="catalog-modal-overlay">
                    <div className="catalog-modal-card">
                        <h3>{isEditing ? "Edit Content Publication" : "Add New Content Publication"}</h3>
                        <form onSubmit={handleSubmitForm}>
                            <div className="form-group">
                                <label>Title:</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Description:</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="2" required />
                            </div>
                            <div className="form-group">
                                <label>Category:</label>
                                <input type="text" name="category" value={formData.category} onChange={handleChange} required />
                            </div>
                            
                            {/* Cover Image Input Option */}
                            <div className="form-group">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                    <label style={{ margin: 0 }}>Cover Image:</label>
                                    <span 
                                        style={{ fontSize: "0.75rem", color: "#ffb703", cursor: "pointer", textDecoration: "underline" }}
                                        onClick={() => setCoverMode(coverMode === "url" ? "file" : "url")}
                                    >
                                        Switch to {coverMode === "url" ? "File Upload" : "URL Link"}
                                    </span>
                                </div>
                                {coverMode === "url" ? (
                                    <input 
                                        type="text" 
                                        name="coverImageUrl" 
                                        value={formData.coverImageUrl} 
                                        onChange={handleChange} 
                                        placeholder="https://example.com/cover.jpg" 
                                    />
                                ) : (
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => setCoverImageFile(e.target.files[0])} 
                                    />
                                )}
                            </div>

                            {/* Content Pages Input Option */}
                            <div className="form-group">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                    <label style={{ margin: 0 }}>Content Pages / Images:</label>
                                    <span 
                                        style={{ fontSize: "0.75rem", color: "#ffb703", cursor: "pointer", textDecoration: "underline" }}
                                        onClick={() => setContentMode(contentMode === "url" ? "file" : "url")}
                                    >
                                        Switch to {contentMode === "url" ? "Multiple File Upload" : "URL Links"}
                                    </span>
                                </div>
                                {contentMode === "url" ? (
                                    <input 
                                        type="text" 
                                        name="contentImageUrls" 
                                        value={formData.contentImageUrls} 
                                        onChange={handleChange} 
                                        placeholder="Comma-separated image URLs" 
                                    />
                                ) : (
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        multiple 
                                        onChange={(e) => setContentImageFiles(e.target.files)} 
                                    />
                                )}
                            </div>

                            <div className="form-group">
                                <label>Total Pages:</label>
                                <input type="number" name="totalPages" value={formData.totalPages} onChange={handleChange} min="1" required />
                            </div>
                            <div className="form-group">
                                <label>Status:</label>
                                <select name="status" value={formData.status} onChange={handleChange}>
                                    <option value="Published">Published</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Archived">Archived</option>
                                </select>
                            </div>
                            <div className="modal-buttons">
                                <button type="submit" className="save-btn">{isEditing ? "Save Changes" : "Create Record"}</button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="cancel-btn">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Catalog;
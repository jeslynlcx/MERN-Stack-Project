import { useState, useEffect } from 'react';

export const CatalogModal = ({ isOpen, onClose, onSave, editingItem = null }) => {
    const [coverMode, setCoverMode] = useState("file");
    const [contentMode, setContentMode] = useState("file");

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "",
        coverImageUrl: "",
        totalPages: 1,
        status: "Published"
    });

    const [contentImageUrls, setContentImageUrls] = useState([""]);
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [contentImageFiles, setContentImageFiles] = useState([]);

    useEffect(() => {
        if (isOpen) {
            if (editingItem) {
                let urls = [""];
                if (Array.isArray(editingItem.contentImageUrls) && editingItem.contentImageUrls.length > 0) {
                    urls = editingItem.contentImageUrls;
                } else if (typeof editingItem.contentImageUrls === "string" && editingItem.contentImageUrls.trim() !== "") {
                    urls = editingItem.contentImageUrls.split(",").map(u => u.trim());
                }

                setFormData({
                    name: editingItem.name || "",
                    description: editingItem.description || "",
                    category: editingItem.category || "",
                    coverImageUrl: editingItem.coverImageUrl || "",
                    totalPages: editingItem.totalPages || 1,
                    status: editingItem.status || "Published"
                });
                setContentImageUrls(urls);
                setCoverMode("url");
                setContentMode("url");
            } else {
                setFormData({
                    name: "",
                    description: "",
                    category: "",
                    coverImageUrl: "",
                    totalPages: 1,
                    status: "Published"
                });
                setContentImageUrls([""]);
                setCoverMode("file");
                setContentMode("file");
            }
            setCoverImageFile(null);
            setContentImageFiles([]);
        }
    }, [isOpen, editingItem]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUrlChange = (index, value) => {
        const newUrls = [...contentImageUrls];
        newUrls[index] = value;
        setContentImageUrls(newUrls);
    };

    const addUrlField = () => setContentImageUrls([...contentImageUrls, ""]);

    const removeUrlField = (index) => {
        const newUrls = contentImageUrls.filter((_, i) => i !== index);
        setContentImageUrls(newUrls.length ? newUrls : [""]);
    };

    // Bulk batch selector: sorts incoming files alphabetically/chronologically to keep ascending order
    const handleFilesBulkSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0) {
            // Sort by file name or natural order to prevent descending inversion
            selectedFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
            setContentImageFiles(prevFiles => [...prevFiles, ...selectedFiles]);
        }
    };

    const addFileField = () => setContentImageFiles([...contentImageFiles, null]);

    const removeFileField = (index) => {
        const newFiles = contentImageFiles.filter((_, i) => i !== index);
        setContentImageFiles(newFiles);
    };

    const handleSingleFileChange = (index, file) => {
        const newFiles = [...contentImageFiles];
        newFiles[index] = file;
        setContentImageFiles(newFiles);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        
        Object.entries(formData).forEach(([key, val]) => data.append(key, val));

        if (coverMode === "file" && coverImageFile) {
            data.append("coverImage", coverImageFile);
        }

        if (contentMode === "file") {
            const validFiles = contentImageFiles.filter(file => file !== null && file !== undefined);
            validFiles.forEach(file => data.append("contentImages", file));
        } else {
            const validUrls = contentImageUrls.filter(u => u.trim() !== "");
            data.append("contentImageUrls", validUrls.join(", "));
        }

        onSave(data, editingItem ? editingItem._id : null);
    };

    return (
        <div className="catalog-modal-overlay">
            <div className="catalog-modal-card">
                <h3>{editingItem ? "Edit Content Publication" : "Add New Content Publication"}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title:</label>
                        <input type="text" name="name" maxLength={40} value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Description:</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="2" required />
                    </div>
                    <div className="form-group">
                        <label>Category:</label>
                        <input type="text" name="category" maxLength={40} value={formData.category} onChange={handleChange} required />
                    </div>
                    
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
                            <div className="file-upload-wrapper">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => setCoverImageFile(e.target.files[0])} 
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                            <label style={{ margin: 0 }}>Content Pages / Images:</label>
                            <span 
                                style={{ fontSize: "0.75rem", color: "#ffb703", cursor: "pointer", textDecoration: "underline" }}
                                onClick={() => setContentMode(contentMode === "url" ? "file" : "url")}
                            >
                                Switch to {contentMode === "url" ? "Multiple File Upload" : "Multiple URLs"}
                            </span>
                        </div>

                        {contentMode === "url" ? (
                            <div>
                                {contentImageUrls.map((url, index) => (
                                    <div key={index} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                                        <input 
                                            type="text" 
                                            value={url} 
                                            onChange={(e) => handleUrlChange(index, e.target.value)} 
                                            placeholder={`Page ${index + 1} Image URL`} 
                                            style={{ flex: 1 }}
                                        />
                                        {contentImageUrls.length > 1 && (
                                            <button 
                                                type="button" 
                                                onClick={() => removeUrlField(index)}
                                                style={{
                                                    background: "#2a2a2a",
                                                    border: "none",
                                                    color: "#ff6b6b",
                                                    padding: "0 10px",
                                                    borderRadius: "4px",
                                                    cursor: "pointer"
                                                }}
                                                title="Remove URL"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button 
                                    type="button" 
                                    onClick={addUrlField}
                                    style={{
                                        background: "transparent",
                                        color: "#ffb703",
                                        border: "1px dashed #ffb703",
                                        padding: "6px 12px",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontSize: "0.85rem",
                                        marginTop: "4px",
                                        width: "100%"
                                    }}
                                >
                                    + Add Another URL
                                </button>
                            </div>
                        ) : (
                            <div>
                                {contentImageFiles.map((file, index) => (
                                    <div key={index} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center", background: "#1a1a1a", padding: "6px", borderRadius: "4px", border: "1px solid #333" }}>
                                        <div style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.85rem", color: "#ddd", paddingLeft: "4px" }}>
                                            {file ? file.name : (
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    onChange={(e) => handleSingleFileChange(index, e.target.files[0])} 
                                                />
                                            )}
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => removeFileField(index)}
                                            style={{
                                                background: "#2a2a2a",
                                                border: "none",
                                                color: "#ff6b6b",
                                                padding: "6px 10px",
                                                borderRadius: "4px",
                                                cursor: "pointer"
                                            }}
                                            title="Remove File"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}

                                <div style={{ display: "flex", gap: "8px" }}>
                                    <label style={{
                                        flex: 1,
                                        background: "transparent",
                                        color: "#ffb703",
                                        border: "1px dashed #ffb703",
                                        padding: "8px 12px",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontSize: "0.85rem",
                                        textAlign: "center",
                                        display: "block"
                                    }}>
                                        📁 Select Multiple Files at Once
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            multiple 
                                            onChange={handleFilesBulkSelect} 
                                            style={{ display: "none" }} 
                                        />
                                    </label>
                                    <button 
                                        type="button" 
                                        onClick={addFileField}
                                        style={{
                                            background: "transparent",
                                            color: "#ffb703",
                                            border: "1px dashed #ffb703",
                                            padding: "8px 12px",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            fontSize: "0.85rem"
                                        }}
                                    >
                                        + Add Blank Row
                                    </button>
                                </div>
                            </div>
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
                        <button type="submit" className="save-btn">{editingItem ? "Save Changes" : "Create Record"}</button>
                        <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CatalogModal;
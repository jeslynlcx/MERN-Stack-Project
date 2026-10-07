import { useState, useEffect } from 'react';
import './CatalogModal.css';

export const CatalogModal = ({ isOpen, onClose, onSave, editingItem = null }) => {
    const [cover, setCover] = useState("file");
    const [content, setContent] = useState("file");
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState([""]);
    const [imageFile, setImageFile] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "",
        coverImageUrl: "",
        totalPages: 1,
        status: "Published"
    });

    useEffect(() => {
        if (!isOpen) return;

        if (editingItem) {
            let urls = [""];
            if (Array.isArray(editingItem.imageUrl) && editingItem.imageUrl.length > 0) {
                urls = editingItem.imageUrl;
            } else if (typeof editingItem.imageUrl === "string" && editingItem.imageUrl.trim() !== "") {
                urls = editingItem.imageUrl.split(",").map(urlItem => urlItem.trim());
            }

            setFormData({
                name: editingItem.name || "",
                description: editingItem.description || "",
                category: editingItem.category || "",
                coverImageUrl: editingItem.coverImageUrl || "",
                totalPages: editingItem.totalPages || 1,
                status: editingItem.status || "Published"
            });
            setImageUrl(urls);
            setCover("url");
            setContent("url");
        } else {
            setFormData({
                name: "",
                description: "",
                category: "",
                coverImageUrl: "",
                totalPages: 1,
                status: "Published"
            });
            setImageUrl([""]);
            setCover("file");
            setContent("file");
        }
        setCoverImageFile(null);
        setImageFile([]);
    }, [isOpen, editingItem]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUrlChange = (index, value) => {
        const updatedUrls = [...imageUrl];
        updatedUrls[index] = value;
        setImageUrl(updatedUrls);
    };

    //--------------Content post by URL--------------
    const addUrlField = () => setImageUrl([...imageUrl, ""]);

    const removeUrlField = (index) => {
        const updatedUrls = imageUrl.filter((_, itemIndex) => itemIndex !== index);
        setImageUrl(updatedUrls.length ? updatedUrls : [""]);
    };

    const handleFilesBulkSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0) {
            selectedFiles.sort((firstFile, secondFile) => firstFile.name.localeCompare(secondFile.name, undefined, { numeric: true, sensitivity: 'base' }));
            setImageFile(previousFiles => [...previousFiles, ...selectedFiles]);
        }
    };

    //--------------Content post by image file--------------
    const addFileField = () => setImageFile([...imageFile, null]);

    const removeFileField = (index) => {
        const updatedFiles = imageFile.filter((_, itemIndex) => itemIndex !== index);
        setImageFile(updatedFiles);
    };

    const handleSingleFileChange = (index, file) => {
        const updatedFiles = [...imageFile];
        updatedFiles[index] = file;
        setImageFile(updatedFiles);
    };

    //--------------POST--------------
    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();

        Object.entries(formData).forEach(([key, val]) => data.append(key, val)); //take all input from formData into FormData
        if (cover === "file" && coverImageFile) {  //handling cover 
            data.append("coverImage", coverImageFile);
        }
        if (content === "file") {  //handling content
            const validFiles = imageFile.filter(file => file !== null && file !== undefined); //for image mode
            validFiles.forEach(file => data.append("contentImages", file)); //filter out empty slot if edit deleted, for each loop pack them into FormData to backend
        } else {
            const validUrls = imageUrl.filter(urlItem => urlItem.trim() !== "");  //for url mode
            data.append("imageUrl", validUrls.join(", ")); //filter out empty slot, trim make sure spaces dont count as text. join all url into long string saparate by ,
        }

        onSave(data, editingItem ? editingItem._id : null); //Check whether its existing it passed into _id, otherwise passed null create new 
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
                        <div className="header">
                            <label className="sub-label">Cover Image:</label>
                            <span 
                                className="mode-switch-toggle"
                                onClick={() => setCover(cover === "url" ? "file" : "url")}
                            >
                                Switch to {cover === "url" ? "File Upload" : "URL Link"}
                            </span>
                        </div>
                        {cover === "url" ? (
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
                        <div className="header">
                            <label className="sub-label">Content Pages / Images:</label>
                            <span 
                                className="mode-switch-toggle"
                                onClick={() => setContent(content === "url" ? "file" : "url")}
                            >
                                Switch to {content === "url" ? "Multiple File Upload" : "Multiple URLs"}
                            </span>
                        </div>

                        {content === "url" ? (
                            <div>
                                {imageUrl.map((url, index) => (
                                    <div key={index} className="url-row">
                                        <input 
                                            type="text" 
                                            value={url} 
                                            onChange={(e) => handleUrlChange(index, e.target.value)} 
                                            placeholder={`Page ${index + 1} Image URL`} 
                                            className="url-input"
                                        />
                                        {imageUrl.length > 1 && (
                                            <button 
                                                type="button" 
                                                onClick={() => removeUrlField(index)}
                                                className="remove-url"
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
                                    className="add-btn"
                                >
                                    + Add Another URL
                                </button>
                            </div>
                        ) : (
                            <div>
                                {imageFile.map((file, index) => (
                                    <div key={index} className="file-row">
                                        <div className="file-row-name">
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
                                            className="remove-image"
                                            title="Remove File"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}

                                <div className="file-action-buttons">
                                    <label className="multi-file">
                                        📁 Select Multiple Files at Once
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            multiple 
                                            onChange={handleFilesBulkSelect} 
                                            className="hidden-file-input" 
                                        />
                                    </label>
                                    <button 
                                        type="button" 
                                        onClick={addFileField}
                                        className="file-action addRow-btn"
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
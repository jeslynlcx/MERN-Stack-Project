import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, Modal, Fade } from '@mui/material';

export const CatalogModal = ({ isOpen, onClose, onSave, editingItem = null }) => {
    const [cover, setCover] = useState("file")
    const [content, setContent] = useState("file")
    const [coverImageFile, setCoverImageFile] = useState(null)
    const [imageUrl, setImageUrl] = useState([""])
    const [imageFile, setImageFile] = useState([])
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "",
        coverImageUrl: "",
        totalPages: 1,
        status: "Published"
    })

    useEffect(() => {
        if (!isOpen) return

        if (editingItem) {
            let urls = [""]
            if (Array.isArray(editingItem.imageUrl) && editingItem.imageUrl.length > 0) {
                urls = editingItem.imageUrl
            } else if (typeof editingItem.imageUrl === "string" && editingItem.imageUrl.trim() !== "") {
                urls = editingItem.imageUrl.split(",").map(urlItem => urlItem.trim())
            }

            setFormData({
                name: editingItem.name || "",
                description: editingItem.description || "",
                category: editingItem.category || "",
                coverImageUrl: editingItem.coverImageUrl || "",
                totalPages: editingItem.totalPages || 1,
                status: editingItem.status || "Published"
            })
            setImageUrl(urls)
            setCover("url")
            setContent("url")
        } else {
            setFormData({
                name: "",
                description: "",
                category: "",
                coverImageUrl: "",
                totalPages: 1,
                status: "Published"
            })
            setImageUrl([""])
            setCover("file")
            setContent("file")
        }
        setCoverImageFile(null)
        setImageFile([])
    }, [isOpen, editingItem])

    if (!isOpen) return null

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleUrlChange = (index, value) => {
        const updatedUrls = [...imageUrl]
        updatedUrls[index] = value
        setImageUrl(updatedUrls)
    }

    const addUrlField = () => setImageUrl([...imageUrl, ""])

    const removeUrlField = (index) => {
        const updatedUrls = imageUrl.filter((_, itemIndex) => itemIndex !== index)
        setImageUrl(updatedUrls.length ? updatedUrls : [""])
    }

    const handleFilesBulkSelect = (e) => {
        const selectedFiles = Array.from(e.target.files)
        if (selectedFiles.length > 0) {
            selectedFiles.sort((firstFile, secondFile) => firstFile.name.localeCompare(secondFile.name, undefined, { numeric: true, sensitivity: 'base' }))
            setImageFile(previousFiles => [...previousFiles, ...selectedFiles])
        }
    }

    const addFileField = () => setImageFile([...imageFile, null])

    const removeFileField = (index) => {
        const updatedFiles = imageFile.filter((_, itemIndex) => itemIndex !== index)
        setImageFile(updatedFiles)
    }

    const handleSingleFileChange = (index, file) => {
        const updatedFiles = [...imageFile]
        updatedFiles[index] = file
        setImageFile(updatedFiles)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const data = new FormData()

        Object.entries(formData).forEach(([key, val]) => data.append(key, val))
        if (cover === "file" && coverImageFile) {
            data.append("coverImage", coverImageFile)
        }
        if (content === "file") {
            const validFiles = imageFile.filter(file => file !== null && file !== undefined)
            validFiles.forEach(file => data.append("contentImages", file))
        } else {
            const validUrls = imageUrl.filter(urlItem => urlItem.trim() !== "")
            data.append("imageUrl", validUrls.join(", "))
        }

        onSave(data, editingItem ? editingItem._id : null)
    }

    const inputStyles = {
        input: { color: "#fff", '&::placeholder': { color: '#6b7280', opacity: 1 } },
        textarea: { color: "#fff" },
        "& .MuiOutlinedInput-root": {
            bgcolor: "#0b0806",
            borderRadius: "6px",
            color: "#fff",
            "& fieldset": { borderColor: "#321e11" },
            "&:hover fieldset": { borderColor: "#321e11" },
            "&.Mui-focused fieldset": { borderColor: "#d97706" }
        }
    }

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            closeAfterTransition
            disableEnforceFocus
            disableScrollLock
            slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)' } } }}
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: "20px" }}
        >
            <Fade in={isOpen}>
                <Box 
                    component="form" 
                    onSubmit={handleSubmit} 
                    sx={{ 
                        bgcolor: "#17110d", 
                        border: "2px solid #3c3b3a", 
                        p: "30px", 
                        borderRadius: "12px", 
                        width: "100%", 
                        maxWidth: "500px", 
                        maxHeight: "85vh", 
                        overflowY: "auto", 
                        boxShadow: "0 25px 60px rgba(0,0,0,0.95)",
                        outline: 'none',
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#1e1b1a #0b0806',

                    }}
                >
                    <Typography sx={{ color: "#fef3c7", fontSize: "1.25rem", fontWeight: 700, mb: "-10px" }}>
                        {editingItem ? "Edit Content Publication" : "Add New Content Publication"}
                    </Typography>

                    {/* Title */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Typography sx={{ fontSize: "0.85rem", color: "#9ca3af" }}>Title:</Typography>
                        <TextField 
                            type="text" 
                            name="name" 
                            inputProps={{ maxLength: 40 }}
                            value={formData.name} 
                            onChange={handleChange} 
                            required 
                            size="small"
                            fullWidth
                            sx={inputStyles}
                        />
                    </Box>

                    {/* Description */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Typography sx={{ fontSize: "0.85rem", color: "#9ca3af" }}>Description:</Typography>
                        <TextField 
                            name="description" 
                            value={formData.description} 
                            onChange={handleChange} 
                            multiline 
                            rows={2} 
                            required 
                            fullWidth
                            sx={inputStyles}
                        />
                    </Box>

                    {/* Category */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Typography sx={{ fontSize: "0.85rem", color: "#9ca3af" }}>Category:</Typography>
                        <TextField 
                            type="text" 
                            name="category" 
                            inputProps={{ maxLength: 40 }}
                            value={formData.category} 
                            onChange={handleChange} 
                            required 
                            size="small"
                            fullWidth
                            sx={inputStyles}
                        />
                    </Box>

                    {/* Cover Image */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ fontSize: "0.85rem", color: "#9ca3af" }}>Cover Image:</Typography>
                            <Typography 
                                component="span"
                                onClick={() => setCover(cover === "url" ? "file" : "url")}
                                sx={{ fontSize: "0.75rem", color: "#fbbf24", cursor: "pointer", textDecoration: "underline", '&:hover': { color: "#fef3c7" } }}
                            >
                                Switch to {cover === "url" ? "File Upload" : "URL Link"}
                            </Typography>
                        </Box>
                        {cover === "url" ? (
                            <TextField 
                                type="text" 
                                name="coverImageUrl" 
                                value={formData.coverImageUrl} 
                                onChange={handleChange} 
                                placeholder="https://example.com/cover.jpg" 
                                size="small"
                                fullWidth
                                sx={inputStyles}
                            />
                        ) : (
                            <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#0b0806", border: "1px solid #321e11", p: "8px", borderRadius: "6px" }}>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => setCoverImageFile(e.target.files[0])} 
                                    style={{ color: "#f3f4f6", fontSize: "0.85rem" }}
                                />
                            </Box>
                        )}
                    </Box>

                    {/* Content Pages / Images */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ fontSize: "0.85rem", color: "#9ca3af" }}>Content Pages / Images:</Typography>
                            <Typography 
                                component="span"
                                onClick={() => setContent(content === "url" ? "file" : "url")}
                                sx={{ fontSize: "0.75rem", color: "#fbbf24", cursor: "pointer", textDecoration: "underline", '&:hover': { color: "#fef3c7" } }}
                            >
                                Switch to {content === "url" ? "Multiple File Upload" : "Multiple URLs"}
                            </Typography>
                        </Box>

                        {content === "url" ? (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {imageUrl.map((url, index) => (
                                    <Box key={index} sx={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                        <TextField 
                                            type="text" 
                                            value={url} 
                                            onChange={(e) => handleUrlChange(index, e.target.value)} 
                                            placeholder={`Page ${index + 1} Image URL`} 
                                            size="small"
                                            fullWidth
                                            sx={inputStyles}
                                        />
                                        {imageUrl.length > 1 && (
                                            <Button 
                                                type="button" 
                                                onClick={() => removeUrlField(index)}
                                                sx={{ minWidth: "36px", height: "36px", bgcolor: "#1c140f", color: "#f87171", border: "1px solid #321e11", '&:hover': { bgcolor: "#321e11" } }}
                                                title="Remove URL"
                                            >
                                                ✕
                                            </Button>
                                        )}
                                    </Box>
                                ))}
                                <Button 
                                    type="button" 
                                    onClick={addUrlField}
                                    sx={{ background: "transparent", color: "#fbbf24", border: "1px dashed #d97706", padding: "8px", borderRadius: "6px", textTransform: "none", fontSize: "0.85rem", '&:hover': { background: "rgba(217, 119, 6, 0.1)" } }}
                                >
                                    + Add Another URL
                                </Button>
                            </Box>
                        ) : (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {imageFile.map((file, index) => (
                                    <Box key={index} sx={{ display: "flex", gap: "8px", alignItems: "center", bgcolor: "#0b0806", p: "8px", borderRadius: "6px", border: "1px solid #321e11" }}>
                                        <Box sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.85rem", color: "#d1d5db" }}>
                                            {file ? file.name : (
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    onChange={(e) => handleSingleFileChange(index, e.target.files[0])} 
                                                    style={{ color: "#f3f4f6", fontSize: "0.85rem" }}
                                                />
                                            )}
                                        </Box>
                                        <Button 
                                            type="button" 
                                            onClick={() => removeFileField(index)}
                                            sx={{ minWidth: "32px", height: "32px", bgcolor: "#1c140f", color: "#f87171", border: "1px solid #321e11", '&:hover': { bgcolor: "#321e11" } }}
                                            title="Remove File"
                                        >
                                            ✕
                                        </Button>
                                    </Box>
                                ))}

                                <Box sx={{ display: "flex", gap: "8px", mt: "4px" }}>
                                    <Button 
                                        component="label"
                                        sx={{ flex: 1, background: "transparent", color: "#fbbf24", border: "1px dashed #d97706", padding: "10px", borderRadius: "6px", textTransform: "none", fontSize: "0.85rem", '&:hover': { background: "rgba(217, 119, 6, 0.1)" } }}
                                    >
                                        📁 Select Multiple Files at Once
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            multiple 
                                            onChange={handleFilesBulkSelect} 
                                            style={{ display: 'none' }}
                                        />
                                    </Button>
                                    <Button 
                                        type="button" 
                                        onClick={addFileField}
                                        sx={{ background: "transparent", color: "#fbbf24", border: "1px dashed #d97706", padding: "10px 14px", borderRadius: "6px", textTransform: "none", fontSize: "0.85rem", '&:hover': { background: "rgba(217, 119, 6, 0.1)" } }}
                                    >
                                        + Add Blank Row
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Box>

                    {/* Total Pages */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Typography sx={{ fontSize: "0.85rem", color: "#9ca3af" }}>Total Pages:</Typography>
                        <TextField 
                            type="number" 
                            name="totalPages" 
                            value={formData.totalPages} 
                            onChange={handleChange} 
                            inputProps={{ min: "1" }} 
                            required 
                            size="small"
                            fullWidth
                            sx={inputStyles}
                        />
                    </Box>

                    {/* Status */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Typography sx={{ fontSize: "0.85rem", color: "#9ca3af" }}>Status:</Typography>
                        <Select 
                            name="status" 
                            value={formData.status} 
                            onChange={handleChange}
                            size="small"
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        bgcolor: "#17110d",
                                        color: "#f3f4f6",
                                        border: "1px solid #321e11",
                                        "& .MuiMenuItem-root": {
                                            fontSize: "0.9rem",
                                            color: "#ffffff",
                                            "&:hover": { bgcolor: "#b45309", color: "#fff" },
                                            "&.Mui-selected": { bgcolor: "#b45309 !important", color: "#fff" }
                                        }
                                    }
                                }
                            }}
                            sx={{
                                backgroundColor: '#0b0806',
                                color: '#f3f4f6',
                                border: '1px solid #321e11',
                                borderRadius: '6px',
                                fontSize: '0.9rem',
                                ".MuiSelect-select": { color: "#f3f4f6", py: "8px" },
                                ".MuiOutlinedInput-notchedOutline": { border: "none" },
                                ".MuiSvgIcon-root": { color: "#9ca3af" },
                                '&.Mui-focused': { boxShadow: '0 0 8px rgba(217, 119, 6, 0.25)' }
                            }}
                        >
                            <MenuItem value="Published">Published</MenuItem>
                            <MenuItem value="Draft">Draft</MenuItem>
                            <MenuItem value="Archived">Archived</MenuItem>
                        </Select>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "12px", mt: "10px" }}>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            sx={{ background: "#b45309", color: "#fff", textTransform: "none", fontWeight: 600, px: "20px", '&:hover': { background: "#d97706" } }}
                        >
                            {editingItem ? "Save Changes" : "Create Record"}
                        </Button>
                        <Button 
                            type="button" 
                            onClick={onClose} 
                            sx={{ color: "#9ca3af", border: "1px solid #321e11", textTransform: "none", px: "20px", '&:hover': { color: "#fff", borderColor: "#6b7280", bgcolor: "#1c140f" } }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    )
}

export default CatalogModal
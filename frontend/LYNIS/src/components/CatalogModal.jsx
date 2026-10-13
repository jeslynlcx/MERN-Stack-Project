import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Select, MenuItem, Modal, Fade } from '@mui/material';

export const CatalogModal = ({ isOpen, onClose, onSave, editingItem = null }) => {
    const [cover, setCover] = useState("file")
    const [coverImageFile, setCoverImageFile] = useState(null)
    const [contentPages, setContentPages] = useState([{ type: 'url', value: '', file: null }])
    const [draggedItemIndex, setDraggedItemIndex] = useState(null)
    const [dragOverIndex, setDragOverIndex] = useState(null)
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
            let initialPages = [{ type: 'url', value: '', file: null }]
            let urls = []
            
            if (Array.isArray(editingItem.contentImageUrls) && editingItem.contentImageUrls.length > 0) {
                urls = editingItem.contentImageUrls
            } else if (typeof editingItem.contentImageUrls === "string" && editingItem.contentImageUrls.trim() !== "") {
                urls = editingItem.contentImageUrls.split(",").map(urlItem => urlItem.trim())
            } else if (Array.isArray(editingItem.imageUrl) && editingItem.imageUrl.length > 0) {
                urls = editingItem.imageUrl
            } else if (typeof editingItem.imageUrl === "string" && editingItem.imageUrl.trim() !== "") {
                urls = editingItem.imageUrl.split(",").map(urlItem => urlItem.trim())
            }

            if (urls.length > 0) {
                initialPages = urls.map(u => ({ type: 'url', value: u, file: null }))
            }

            setFormData({
                name: editingItem.name || "",
                description: editingItem.description || "",
                category: editingItem.category || "",
                coverImageUrl: editingItem.coverImageUrl || "",
                totalPages: urls.length > 0 ? urls.length : (editingItem.totalPages || 1),
                status: editingItem.status || "Published"
            })
            setContentPages(initialPages)
            setCover("url")
        } else {
            setFormData({
                name: "",
                description: "",
                category: "",
                coverImageUrl: "",
                totalPages: 1,
                status: "Published"
            })
            setContentPages([{ type: 'url', value: '', file: null }])
            setCover("file")
        }
        setCoverImageFile(null)
    }, [isOpen, editingItem])

    if (!isOpen) return null

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handlePageTypeChange = (index, newType) => {
        const updated = [...contentPages]
        updated[index] = { type: newType, value: updated[index].value, file: null }
        setContentPages(updated)
    }

    const handlePageValueChange = (index, val) => {
        const updated = [...contentPages]
        updated[index].value = val
        setContentPages(updated)
    }

    const handlePageFileChange = (index, file) => {
        const updated = [...contentPages]
        updated[index].file = file
        if (file) {
            updated[index].value = file.name
        }
        setContentPages(updated)
    }

    // Optimized Drag & Drop Handlers
    const handleDragStart = (e, index) => {
        setDraggedItemIndex(index)
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData("text/plain", index)
    }

    const handleDragOver = (e, index) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        if (dragOverIndex !== index) {
            setDragOverIndex(index)
        }
    }

    const handleDragLeave = () => {
        setDragOverIndex(null)
    }

    const handleDrop = (e, targetIndex) => {
        e.preventDefault()
        if (draggedItemIndex === null || draggedItemIndex === targetIndex) {
            setDraggedItemIndex(null)
            setDragOverIndex(null)
            return
        }

        const updated = [...contentPages]
        const [movedItem] = updated.splice(draggedItemIndex, 1)
        updated.splice(targetIndex, 0, movedItem)

        setDraggedItemIndex(null)
        setDragOverIndex(null)
        setContentPages(updated)
    }

    const addPageField = () => {
        const updated = [...contentPages, { type: 'url', value: '', file: null }]
        setContentPages(updated)
        setFormData(prev => ({ ...prev, totalPages: updated.length }))
    }

    const removePageField = (index) => {
        const updated = contentPages.filter((_, i) => i !== index)
        const finalPages = updated.length ? updated : [{ type: 'url', value: '', file: null }]
        setContentPages(finalPages)
        setFormData(prev => ({ ...prev, totalPages: finalPages.length }))
    }

    const handleFilesBulkSelect = (e) => {
        const selectedFiles = Array.from(e.target.files)
        if (selectedFiles.length > 0) {
            selectedFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))
            const newFilePages = selectedFiles.map(file => ({ type: 'file', value: file.name, file }))
            const updated = [...contentPages, ...newFilePages]
            setContentPages(updated)
            setFormData(prev => ({ ...prev, totalPages: updated.length }))
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const data = new FormData()

        const currentTotalPages = contentPages.length
        const finalData = { ...formData, totalPages: currentTotalPages }

        Object.entries(finalData).forEach(([key, val]) => data.append(key, val))
        
        if (cover === "file" && coverImageFile) {  
            data.append("coverImage", coverImageFile) 
        }

        const allPageUrls = []

        contentPages.forEach(page => {
            if (page.type === 'file' && page.file) {
                data.append("contentImages", page.file)
                allPageUrls.push(`/uploads/${page.file.name}`)
            } else if (page.value && page.value.trim() !== "") {
                allPageUrls.push(page.value.trim())
            } else {
                allPageUrls.push("")
            }
        })

        if (allPageUrls.length > 0) {
            data.append("contentImageUrls", allPageUrls.join(", "))
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

                    {/* Content Pages */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ fontSize: "0.85rem", color: "#9ca3af" }}>Content Pages / Images:</Typography>
                            <Button 
                                component="label"
                                sx={{ background: "transparent", color: "#fbbf24", fontSize: "0.75rem", textTransform: "none", p: 0, '&:hover': { background: "transparent", textDecoration: "underline" } }}
                            >
                                📁 Bulk Upload Files
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    multiple 
                                    onChange={handleFilesBulkSelect} 
                                    style={{ display: 'none' }}
                                />
                            </Button>
                        </Box>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {contentPages.map((page, index) => {
                                const isDragging = draggedItemIndex === index;
                                const isDragOver = dragOverIndex === index;

                                return (
                                    <Box 
                                        key={index} 
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, index)}
                                        sx={{ 
                                            display: "flex", 
                                            gap: "8px", 
                                            alignItems: "center", 
                                            bgcolor: isDragging ? "#1c140f" : "#0b0806", 
                                            p: "6px", 
                                            borderRadius: "6px", 
                                            border: isDragOver ? "2px dashed #fbbf24" : "1px solid #321e11",
                                            opacity: isDragging ? 0.3 : 1,
                                            cursor: "grab",
                                            '&:active': { cursor: "grabbing" }
                                        }}
                                    >
                                        <Box 
                                            sx={{ 
                                                display: "flex", 
                                                alignItems: "center", 
                                                justifyContent: "center", 
                                                px: "4px", 
                                                color: "#fbbf24",
                                                fontSize: "1rem",
                                                userSelect: "none" 
                                            }} 
                                            title="Drag box to reorder"
                                        >
                                            ☰
                                        </Box>

                                        <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af", minWidth: "35px" }}>
                                            P.{index + 1}
                                        </Typography>

                                        {page.type === 'url' ? (
                                            <TextField 
                                                type="text" 
                                                value={page.value} 
                                                onChange={(e) => handlePageValueChange(index, e.target.value)} 
                                                placeholder="Image URL..." 
                                                size="small"
                                                fullWidth
                                                sx={inputStyles}
                                            />
                                        ) : (
                                            <Box sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.85rem", color: "#d1d5db", px: "4px" }}>
                                                {page.file ? page.file.name : (
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        onChange={(e) => handlePageFileChange(index, e.target.files[0])} 
                                                        style={{ color: "#f3f4f6", fontSize: "0.8rem" }}
                                                    />
                                                )}
                                            </Box>
                                        )}

                                        <Button 
                                            type="button" 
                                            onClick={() => handlePageTypeChange(index, page.type === 'url' ? 'file' : 'url')}
                                            sx={{ minWidth: "auto", fontSize: "0.7rem", color: "#fbbf24", textTransform: "none", px: "6px" }}
                                            title="Switch type"
                                        >
                                            {page.type === 'url' ? '📁 File' : '🔗 URL'}
                                        </Button>

                                        {contentPages.length > 1 && (
                                            <Button 
                                                type="button" 
                                                onClick={() => removePageField(index)}
                                                sx={{ minWidth: "28px", height: "28px", bgcolor: "#1c140f", color: "#f87171", border: "1px solid #321e11", '&:hover': { bgcolor: "#321e11" } }}
                                                title="Remove Page"
                                            >
                                                ✕
                                            </Button>
                                        )}
                                    </Box>
                                );
                            })}

                            <Button 
                                type="button" 
                                onClick={addPageField}
                                sx={{ background: "transparent", color: "#fbbf24", border: "1px dashed #d97706", padding: "8px", borderRadius: "6px", textTransform: "none", fontSize: "0.85rem", '&:hover': { background: "rgba(217, 119, 6, 0.1)" } }}
                            >
                                + Add Another Page
                            </Button>
                        </Box>
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
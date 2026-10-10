import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Box, Typography, Button, TextField, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import CatalogModal from "../components/CatalogModal";

function Catalog() {
    const [contents, setContents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [isAdmin, setIsAdmin] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentEditingItem, setCurrentEditingItem] = useState(null)

    const navigate = useNavigate()

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        const userRole = localStorage.getItem("role") || user.role
        if (userRole === "admin" || user.isAdmin === true) {
            setIsAdmin(true)
        }
    }, [])

    const fetchContents = async () => {
        try {
            const response = await api.get("/contents")
            setContents(response.data)
        } catch (error) {
            setError("Failed to fetch. Please try again")
            console.error("Error fetching catalog contents:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchContents()
    }, [])

    const handleOpenCreateModal = () => {
        setCurrentEditingItem(null)
        setIsModalOpen(true)
    }

    const handleOpenEditModal = (item, e) => {
        e.stopPropagation()
        setCurrentEditingItem(item)
        setIsModalOpen(true)
    }

    const handleSave = async (formData, currentId) => {
        try {
            if (currentId) {
                await api.patch(`/contents/${currentId}`, formData)
                alert("Content updated successfully!")
            } else {
                await api.post("/contents", formData)
                alert("Content added successfully!")
            }
            setIsModalOpen(false)
            fetchContents()
        } catch (error) {
            console.error("Operation failed:", error.response?.data || error.message)
            alert("Error: " + (error.response?.data?.error || error.message))
        }
    }

    const handleDelete = async (id, e) => {
        e.stopPropagation()
        if (window.confirm("Are you sure you want to delete this publication?")) {
            try {
                await api.delete(`/contents/${id}`)
                setContents(contents.filter(item => item._id !== id))
                alert("Content deleted successfully.")
            } catch (error) {
                console.error("Delete failed:", error.response?.data || error.message)
                alert("Failed to delete record.")
            }
        }
    }

    const categories = ["All", ...new Set(contents.map(item => item.category).filter(Boolean))]

    const filteredContents = contents.filter(item => {
        const status = item.status || "Published"
        if (!isAdmin && status !== "Published") {
            return false
        }
        const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    return (
        <Box sx={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            minHeight: "100vh", 
            bgcolor: "#060504", 
            color: "#f3f4f6", 
            pb: "60px", 
            overflowX: "hidden" 
        }}>
            <Navbar />

            <Box sx={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                width: "100%", 
                maxWidth: "1050px", 
                mx: "auto", 
                p: "30px" 
            }}>
                {/* Header Section */}
                <Box sx={{ width: "100%", mb: "22px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontSize: "36px", m: 0, color: "#fef3c7", fontWeight: 700, letterSpacing: "-0.5px" }}>
                            {isAdmin ? "Admin Library Catalog Management" : "Library Catalog"}
                        </Typography>
                        <Typography sx={{ color: "#9ca3af", fontSize: "0.95rem", mt: 0.5 }}>
                            {isAdmin ? "Manage publications using multiple URLs or direct multi-image page uploads" : "Browse available publications in the library collection"}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        {isAdmin && (
                            <Button 
                                onClick={handleOpenCreateModal}
                                sx={{
                                    bgcolor: "#b45309",
                                    color: "#fff",
                                    px: "18px",
                                    py: "10px",
                                    borderRadius: "8px",
                                    fontWeight: 600,
                                    textTransform: "none",
                                    boxShadow: "0 4px 10px rgba(180, 83, 9, 0.4)",
                                    "&:hover": { bgcolor: "#d97706" }
                                }}
                            >
                                + Add Content
                            </Button>
                        )}
                        <Box sx={{ 
                            bgcolor: "#17110d", 
                            border: "1px solid #321e11", 
                            color: "#9ca3af", 
                            p: "10px 16px", 
                            borderRadius: "8px", 
                            fontSize: "0.9rem" 
                        }}>
                            Total Items: <Box component="strong" sx={{ color: "#fef3c7" }}>{filteredContents.length}</Box>
                        </Box>
                    </Box>
                </Box>

                {/* Control Panel */}
                <Box sx={{ 
                    display: "flex", 
                    justifyContent: "flex-start", 
                    alignItems: "center", 
                    width: "100%", 
                    background: "linear-gradient(135deg, #17110d 0%, #100b08 100%)", 
                    border: "1px solid rgba(217, 119, 6, 0.2)", 
                    borderRadius: "12px", 
                    p: "16px 24px", 
                    gap: "30px", 
                    mb: "30px", 
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                    flexWrap: "wrap",
                    boxSizing: "border-box"
                }}>
                    {/* Search Input */}
                    <Box sx={{ display: "flex", alignItems: "center", bgcolor: "#0b0806", border: "1px solid #321e11", borderRadius: "8px", px: "12px", py: "4px", flex: 1, minWidth: "260px" }}>
                        <Box component="span" sx={{ mr: 1, fontSize: "16px" }}>🔍</Box>
                        <TextField 
                            variant="standard"
                            placeholder="Search content by title..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{ disableUnderline: true }}
                            sx={{
                                input: { color: "#ffffff", fontSize: "0.9rem" },
                                "& .MuiInputBase-input::placeholder": { color: "#9ca3af", opacity: 1 }
                            }}
                            fullWidth
                        />
                    </Box>

                    {/* Category Filter */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <Typography component="label" sx={{ fontSize: "0.75rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
                            Category Filter:
                        </Typography>
                        <Select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            size="small"
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        bgcolor: "#17110d",
                                        color: "#f3f4f6",
                                        border: "1px solid #321e11",
                                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.7)",
                                        "& .MuiMenuItem-root": {
                                            fontSize: "0.9rem",
                                            "&:hover": { bgcolor: "#b45309", color: "#fff" },
                                            "&.Mui-selected": { bgcolor: "#b45309 !important", color: "#fff" }
                                        }
                                    }
                                }
                            }}
                            sx={{
                                bgcolor: "#0b0806",
                                color: "#f3f4f6",
                                borderRadius: "8px",
                                fontSize: "0.9rem",
                                minWidth: "160px",
                                ".MuiOutlinedInput-notchedOutline": { borderColor: "#321e11" },
                                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#d97706" },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#d97706" },
                                ".MuiSvgIcon-root": { color: "#9ca3af" }
                            }}
                        >
                            {categories.map(cat => (
                                <MenuItem key={cat} value={cat}>
                                    {cat}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>
                </Box>

                {/* Table Container */}
                <Box sx={{ width: "100%" }}>
                    {loading && <Typography sx={{ color: "#9ca3af", fontStyle: "italic", textAlign: "center", py: 6 }}>Loading...</Typography>}
                    {error && <Typography sx={{ color: "#ef4444", textAlign: "center", py: 6 }}>{error}</Typography>}

                    {!loading && !error && (
                        filteredContents.length === 0 ? (
                            <Box sx={{ color: "#9ca3af", fontStyle: "italic", width: "100%", textAlign: "center", py: "70px", fontSize: "1rem" }}>
                                No records found matching your search criteria.
                            </Box>
                        ) : (
                            <TableContainer component={Paper} sx={{ bgcolor: "#120a06", border: "1px solid rgba(217, 119, 6, 0.2)", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)" }}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ borderBottom: "2px solid #321e11" }}>
                                            <TableCell sx={{ color: "#fef3c7", fontWeight: 600 }}>Cover</TableCell>
                                            <TableCell sx={{ color: "#fef3c7", fontWeight: 600 }}>Title & Description</TableCell>
                                            <TableCell sx={{ color: "#fef3c7", fontWeight: 600 }}>Category</TableCell>
                                            <TableCell sx={{ color: "#fef3c7", fontWeight: 600 }}>Pages</TableCell>
                                            <TableCell sx={{ color: "#fef3c7", fontWeight: 600 }}>Status</TableCell>
                                            {isAdmin && <TableCell sx={{ color: "#fef3c7", fontWeight: 600 }}>Admin Actions</TableCell>}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredContents.map((item) => (
                                            <TableRow 
                                                key={item._id} 
                                                onClick={() => navigate(`/content/${item._id}`)} 
                                                sx={{ 
                                                    cursor: "pointer", 
                                                    transition: "background-color 0.2s",
                                                    "&:hover": { bgcolor: "rgba(217, 119, 6, 0.08)" },
                                                    borderBottom: "1px solid #321e11"
                                                }}
                                            >
                                                <TableCell sx={{ borderBottom: "inherit" }}>
                                                    <Box 
                                                        component="img" 
                                                        src={item.coverImageUrl?.startsWith('http') ? item.coverImageUrl : `http://localhost:2406${item.coverImageUrl}`} 
                                                        alt={item.name} 
                                                        onError={(e) => { e.target.style.display = 'none' }}
                                                        sx={{ width: "50px", height: "70px", objectFit: "cover", borderRadius: "4px", boxShadow: "0 4px 8px rgba(0,0,0,0.5)" }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: "inherit" }}>
                                                    <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.95rem" }}>{item.name}</Typography>
                                                    <Typography sx={{ color: "#9ca3af", fontSize: "0.85rem" }}>{item.description?.substring(0, 60)}...</Typography>
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: "inherit" }}>
                                                    <Box component="span" sx={{ bgcolor: "#d97706", color: "#fff", px: "10px", py: "4px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600 }}>
                                                        {item.category}
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ color: "#f3f4f6", fontSize: "0.9rem", borderBottom: "inherit" }}>{item.totalPages} pgs</TableCell>
                                                <TableCell sx={{ borderBottom: "inherit" }}>
                                                    <Box component="span" sx={{ 
                                                        color: item.status?.toLowerCase() === 'published' ? '#10b981' : '#fbbf24',
                                                        fontSize: "0.85rem",
                                                        fontWeight: 500
                                                    }}>
                                                        {item.status || "Published"}
                                                    </Box>
                                                </TableCell>
                                                {isAdmin && (
                                                    <TableCell onClick={(e) => e.stopPropagation()} sx={{ borderBottom: "inherit" }}>
                                                        <Box sx={{ display: "flex", gap: 1 }}>
                                                            <Button 
                                                                size="small"
                                                                onClick={(e) => handleOpenEditModal(item, e)}
                                                                sx={{ bgcolor: "#333", color: "#fff", textTransform: "none", fontSize: "0.8rem", "&:hover": { bgcolor: "#444" } }}
                                                            >
                                                                Edit ✏️
                                                            </Button>
                                                            <Button 
                                                                size="small"
                                                                onClick={(e) => handleDelete(item._id, e)}
                                                                sx={{ bgcolor: "rgba(239, 68, 68, 0.15)", color: "#ef4444", textTransform: "none", fontSize: "0.8rem", "&:hover": { bgcolor: "rgba(239, 68, 68, 0.3)" } }}
                                                            >
                                                                Delete 🗑️
                                                            </Button>
                                                        </Box>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )
                    )}
                </Box>
            </Box>

            {isAdmin && (
                <CatalogModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    onSave={handleSave} 
                    editingItem={currentEditingItem} 
                />
            )}
        </Box>
    )
}

export default Catalog
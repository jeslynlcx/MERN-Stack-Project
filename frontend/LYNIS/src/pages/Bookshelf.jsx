import { useState, useEffect } from "react";
import { Box, Typography, Select, MenuItem, Button, Container } from "@mui/material";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import Book from "../components/BookModal";

function Bookshelf() {
    const [contents, setContents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [sort, setSort] = useState("name")
    const [selectedBook, setSelectedBook] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [isAdmin, setIsAdmin] = useState(false)

    const ITEMS_PER_SHELF_ROW = 4
    const TOTAL_ROWS_PER_PAGE = 3
    const ITEMS_PER_PAGE = ITEMS_PER_SHELF_ROW * TOTAL_ROWS_PER_PAGE

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "{}")
        const userRole = localStorage.getItem("role") || user.role
        if (userRole === "admin" || user.isAdmin === true) {
            setIsAdmin(true)
        }
    }, [])

    const processedContents = contents
        .filter((item) => {
            const status = item.status || "Published"
            if (!isAdmin && status !== "Published") return false
            if (selectedCategory !== "All" && item.category !== selectedCategory) {
                return false
            }
            return true
        })
        .sort((a, b) => {
            if (sort === "name") return (a.name || "").localeCompare(b.name || "")
            if (sort === "rating") return (b.averageRating || 0) - (a.averageRating || 0)
            if (sort === "pages") return (b.totalPages || 0) - (b.totalPages || 0)
            return 0
        })

    const totalPages = Math.ceil(processedContents.length / ITEMS_PER_PAGE) || 1
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const currentBookshelfItems = processedContents.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    const shelfRows = [
        currentBookshelfItems.slice(0, 4), 
        currentBookshelfItems.slice(4, 8), 
        currentBookshelfItems.slice(8, 12)
    ]

    useEffect(() => {
        const fetchContents = async () => {
            try {
                const response = await api.get("/contents")
                setContents(response.data)
            } catch (err) {
                setError("Failed to fetch. Please try again")
                console.error("Fetch error", err)
            } finally {
                setLoading(false)
            }
        }
        fetchContents()
    }, [])

    useEffect(() => {
        setCurrentPage(1)
    }, [selectedCategory, sort])

    const handleOpenBookModal = (item) => {
        const status = item.status || "Published"
        if (!isAdmin && status !== "Published") return
        setSelectedBook(item)
    }

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#060504", color: "#f3f4f6", pb: "60px", overflowX: "hidden", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            <Navbar />
            <Container maxWidth="lg" sx={{ display: "flex", flexDirection: "column", alignItems: "center", my: "30px" }}>
                
                {/* Header */}
                <Box sx={{ width: "100%", mb: "22px" }}>
                    <Typography variant="h4" sx={{ fontSize: "36px", m: 0, color: "#fef3c7", fontWeight: 750, letterSpacing: "-0.5px" }}>
                        Digital Bookshelf
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#9ca3af", fontSize: "0.95rem", mt: 0.5 }}>
                        Browse your library collection organized across antique shelves
                    </Typography>
                </Box>

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
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)"
                }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <Typography component="label" sx={{ fontSize: "0.75rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
                            Category Filter:
                        </Typography>
                        <Select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            size="small"
                            sx={{
                                bgcolor: "#0b0806",
                                color: "#f3f4f6",
                                ".MuiOutlinedInput-notchedOutline": { borderColor: "#321e11" },
                                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#d97706" },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#d97706", boxShadow: "0 0 8px rgba(217, 119, 6, 0.25)" },
                                ".MuiSvgIcon-root": { color: "#f3f4f6" },
                                minWidth: "150px"
                            }}
                        >
                            {["All", ...new Set(contents.map((item) => item.category).filter(Boolean))].map((cat) => (
                                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                            ))}
                        </Select>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <Typography component="label" sx={{ fontSize: "0.75rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
                            Sort By:
                        </Typography>
                        <Select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            size="small"
                            sx={{
                                bgcolor: "#0b0806",
                                color: "#f3f4f6",
                                ".MuiOutlinedInput-notchedOutline": { borderColor: "#321e11" },
                                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#d97706" },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#d97706", boxShadow: "0 0 8px rgba(217, 119, 6, 0.25)" },
                                ".MuiSvgIcon-root": { color: "#f3f4f6" },
                                minWidth: "150px"
                            }}
                        >
                            <MenuItem value="name">Title (A-Z)</MenuItem>
                            <MenuItem value="rating">Top Rated</MenuItem>
                            <MenuItem value="pages">Page Count</MenuItem>
                        </Select>
                    </Box>
                </Box>

                {/* Bookshelf Structure */}
                <Box sx={{
                    position: "relative",
                    width: "100%",
                    background: "radial-gradient(circle at 50% 10%, #22140c 0%, #080402 100%)",
                    border: "14px solid #1f1108",
                    borderRadius: "14px",
                    p: "30px 20px 10px 20px",
                    boxSizing: "border-box",
                    boxShadow: "0 35px 70px rgba(0, 0, 0, 0.95), inset 0 0 70px rgba(0, 0, 0, 0.9)"
                }}>
                    {loading && <Typography sx={{ color: "#9ca3af", fontStyle: "italic", textAlign: "center", py: "70px" }}>Loading...</Typography>}
                    {error && <Typography sx={{ color: "#ef4444", textAlign: "center", py: "70px" }}>{error}</Typography>}

                    {!loading && !error && (
                        <Box>
                            <Box sx={{   //Spotlight 
                                position: "absolute",
                                top: 0,
                                left: "50%",
                                transform: "translateX(-50%)",
                                width: "80%",
                                height: "70px",
                                background: "radial-gradient(ellipse at top, rgba(251, 191, 36, 0.22) 0%, transparent 75%)",
                                pointerEvents: "none",
                                zIndex: 1
                            }} />

                            {currentBookshelfItems.length === 0 ? (
                                <Typography sx={{ color: "#9ca3af", fontStyle: "italic", width: "100%", textAlign: "center", py: "70px", fontSize: "1rem" }}>
                                    No publications found matching your filter criteria.
                                </Typography>
                            ) : (
                                shelfRows.map((rowItems, rowIndex) => (
                                    <Box key={rowIndex}>
                                        <Box sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "flex-end",
                                            gap: "45px",
                                            minHeight: "230px",
                                            px: "10px",
                                            position: "relative",
                                            zIndex: 2,
                                            mb: "25px"
                                        }}>
                                            {rowItems.map((item) => {
                                                const isLocked = item.status === "Draft" || item.status === "Archived"
                                                const statusLabel = item.status === "Draft" ? "(Draft)" : item.status === "Archived" ? "(Archived)" : ""

                                                return (
                                                    <Box
                                                        key={item._id}
                                                        onClick={() => handleOpenBookModal(item)}
                                                        className="book-card-item"
                                                        sx={{
                                                            position: "relative",
                                                            cursor: isLocked ? "not-allowed" : "pointer",
                                                            transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                                            flexShrink: 0,
                                                            "&:hover": isLocked ? {} : {
                                                                transform: "translateY(-14px) scale(1.03)",
                                                                "& .book-hover-overlay": {
                                                                    opacity: 1,
                                                                    p: "10px"
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <Box sx={{
                                                            width: "130px",
                                                            height: "180px",
                                                            position: "relative",
                                                            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.6)",
                                                            borderRadius: "4px",
                                                            overflow: "hidden",
                                                            transition: "transform 0.3s ease",
                                                            ...(isLocked && { filter: "grayscale(50%) brightness(0.65)", opacity: 0.75 })
                                                        }}>
                                                            <Box
                                                                component="img"
                                                                src={item.coverImageUrl?.startsWith("http") ? item.coverImageUrl : `http://localhost:2406${item.coverImageUrl}`}
                                                                alt={item.name}
                                                                onError={(e) => { e.target.style.display = "none" }}
                                                                sx={{
                                                                    width: "120px",
                                                                    height: "170px",
                                                                    objectFit: "cover",
                                                                    borderRadius: "6px",
                                                                    border: "1px solid rgba(255, 255, 255, 0.18)",
                                                                    boxShadow: "-12px 14px 28px rgba(0, 0, 0, 0.95), 3px 3px 8px rgba(255, 255, 255, 0.06) inset",
                                                                    display: "block"
                                                                }}
                                                            />
                                                            
                                                            <Box
                                                                className="book-hover-overlay"
                                                                sx={{
                                                                    display: "flex",
                                                                    flexDirection: "column",
                                                                    justifyContent: "center",
                                                                    alignItems: "center",
                                                                    textAlign: "center",
                                                                    position: "absolute",
                                                                    inset: 0,
                                                                    bgcolor: "rgba(12, 7, 4, 0.94)",
                                                                    backdropFilter: "blur(6px)",
                                                                    p: "14px",
                                                                    opacity: 0,
                                                                    borderRadius: "6px",
                                                                    transition: "opacity 0.25s ease, padding 0.25s ease",
                                                                    wordBreak: "break-word",
                                                                    overflowWrap: "break-word",
                                                                    pointerEvents: "none"
                                                                }}
                                                            >
                                                                <Typography sx={{ color: "#fff", fontSize: "0.95rem", fontWeight: 600, mb: "6px", lineHeight: 1.3, wordBreak: "break-word" }}>
                                                                    {item.name} {statusLabel}
                                                                </Typography>
                                                                <Typography sx={{ color: "#fbbf24", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", mb: "12px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "100%" }}>
                                                                    {item.category}
                                                                </Typography>
                                                                <Box sx={{ fontSize: "0.75rem", color: "#fff", bgcolor: "#b45309", p: "6px 12px", borderRadius: "12px", fontWeight: 600, boxShadow: "0 4px 10px rgba(180, 83, 9, 0.4)" }}>
                                                                    {isLocked ? `${item.status} (Locked) 🔒` : "View Details 🔍"}
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                        {/* Book Floor Shadow */}
                                                        <Box sx={{
                                                            position: "absolute",
                                                            bottom: "-14px",
                                                            left: "4%",
                                                            width: "90%",
                                                            height: "12px",
                                                            bgcolor: "rgba(0, 0, 0, 0.95)",
                                                            borderRadius: "50%",
                                                            filter: "blur(6px)"
                                                        }} />
                                                    </Box>
                                                )
                                            })}
                                        </Box>
                                        {/* Wooden Shelf Plank */}
                                        <Box sx={{
                                            height: "20px",
                                            background: "linear-gradient(to bottom, #3b2011 0%, #1a0c05 50%, #0c0502 100%)",
                                            borderTop: "2px solid #5a3119",
                                            borderBottom: "4px solid #050201",
                                            borderRadius: "4px",
                                            boxShadow: "inset 0 2px 6px rgba(255, 255, 255, 0.1), 0 12px 25px rgba(0, 0, 0, 0.9)",
                                            position: "relative",
                                            zIndex: 3,
                                            mt: "-2px"
                                        }} />
                                    </Box>
                                ))
                            )}
                        </Box>
                    )}
                </Box>

                {/* Pagination Bar */}
                <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", mt: "30px", px: "4px" }}>
                    <Button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        sx={{
                            bgcolor: "#17110d",
                            border: "1px solid #321e11",
                            color: "#f3f4f6",
                            px: "18px",
                            py: "10px",
                            borderRadius: "8px",
                            textTransform: "none",
                            fontSize: "0.85rem",
                            fontWeight: 500,
                            "&:hover:not(:disabled)": {
                                bgcolor: "#b45309",
                                borderColor: "#d97706",
                                boxShadow: "0 4px 12px rgba(180, 83, 9, 0.3)"
                            },
                            "&:disabled": { opacity: 0.35, color: "#f3f4f6" }
                        }}
                    >
                        ← Prev Shelf
                    </Button>

                    <Typography sx={{ color: "#9ca3af", fontSize: "0.9rem" }}>
                        Shelf Page <Box component="strong" sx={{ color: "#fef3c7" }}>{currentPage}</Box> of <Box component="strong" sx={{ color: "#fef3c7" }}>{totalPages}</Box>
                    </Typography>

                    <Button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        sx={{
                            bgcolor: "#17110d",
                            border: "1px solid #321e11",
                            color: "#f3f4f6",
                            px: "18px",
                            py: "10px",
                            borderRadius: "8px",
                            textTransform: "none",
                            fontSize: "0.85rem",
                            fontWeight: 500,
                            "&:hover:not(:disabled)": {
                                bgcolor: "#b45309",
                                borderColor: "#d97706",
                                boxShadow: "0 4px 12px rgba(180, 83, 9, 0.3)"
                            },
                            "&:disabled": { opacity: 0.35, color: "#f3f4f6" }
                        }}
                    >
                        Next Shelf →
                    </Button>
                </Box>
            </Container>

            {selectedBook && <Book book={selectedBook} onClose={() => setSelectedBook(null)} />}
        </Box>
    )
}

export default Bookshelf
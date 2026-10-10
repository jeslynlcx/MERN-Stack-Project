import { useNavigate, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { Box, Button } from "@mui/material";
import api from '../utils/api';
import Feedback from "./Feedback";

function Navbar() {
    const [avatarUrl, setAvatarUrl] = useState("/default-avatar.png")
    const navigate = useNavigate()
    const location = useLocation()

    const isActive = (path) => location.pathname === path // checks if a path matches the current page URL[cite: 14]
    const token = localStorage.getItem("token") 
    const userRole = localStorage.getItem("role") 

    useEffect(() => {
        if (!token) return

        const fetchAvatar = async () => {
            try {
                const userId = JSON.parse(window.atob(token.split('.')[1])).userId // extract the userID[cite: 14]
                const response = await api.get(`/users/${userId}`)

                if (response.data?.avatarUrl) { // Checks if the response successfully includes avatar URL[cite: 14].
                    const url = response.data.avatarUrl
                    setAvatarUrl(url.startsWith('http') ? url : `http://localhost:2406${url}`)
                }
            } catch (error) {
                console.error("Avatar error:", error)
            }
        }

        fetchAvatar()
    }, [token])

    return (
        <>
            <Box 
                component="nav"
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0px 32px',
                    margin: '0 auto',
                    width: '100%',
                    maxWidth: '1200px',
                    boxSizing: 'border-box',
                    background: 'rgba(18, 13, 10, 0.9)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(217, 119, 6, 0.2)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100
                }}
            >
                <Box onClick={() => navigate("/")} sx={{ cursor: 'pointer' }}>
                    <Box 
                        component="span" 
                        sx={{ display: 'flex', width: '40px', height: '70px', alignItems: 'center' }}
                    >
                        <Box component="img" src="./logo.png" alt="Logo" sx={{ width: '70px',  objectFit: 'contain',mixBlendMode: 'screen' }} />
                    </Box>
                </Box>
                
                <Box 
                    sx={{
                        display: 'flex',
                        gap: '8px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '4px',
                        borderRadius: '30px',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                >
                    <Button 
                        onClick={() => navigate("/home")} 
                        sx={{
                            background: isActive("/home") ? "#b45309" : "transparent",
                            border: 'none',
                            color: isActive("/home") ? "#fff" : "#9ca3af",
                            fontSize: '0.9rem',
                            padding: '8px 18px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            textTransform: 'none',
                            fontWeight: isActive("/home") ? 500 : 400,
                            boxShadow: isActive("/home") ? '0 2px 10px rgba(180, 83, 9, 0.4)' : 'none',
                            transition: 'all 0.25s ease',
                            '&:hover': {
                                color: '#fff',
                                background: isActive("/home") ? '#b45309' : 'rgba(255, 255, 255, 0.05)'
                            }
                        }}
                    >
                        Home
                    </Button>

                    <Button 
                        onClick={() => navigate("/bookshelf")} 
                        sx={{
                            background: isActive("/bookshelf") ? "#b45309" : "transparent",
                            border: 'none',
                            color: isActive("/bookshelf") ? "#fff" : "#9ca3af",
                            fontSize: '0.9rem',
                            padding: '8px 18px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            textTransform: 'none',
                            fontWeight: isActive("/bookshelf") ? 500 : 400,
                            boxShadow: isActive("/bookshelf") ? '0 2px 10px rgba(180, 83, 9, 0.4)' : 'none',
                            transition: 'all 0.25s ease',
                            '&:hover': {
                                color: '#fff',
                                background: isActive("/bookshelf") ? '#b45309' : 'rgba(255, 255, 255, 0.05)'
                            }
                        }}
                    >
                        Bookshelf
                    </Button>

                    <Button 
                        onClick={() => navigate("/catalog")} 
                        sx={{
                            background: isActive("/catalog") ? "#b45309" : "transparent",
                            border: 'none',
                            color: isActive("/catalog") ? "#fff" : "#9ca3af",
                            fontSize: '0.9rem',
                            padding: '8px 18px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            textTransform: 'none',
                            fontWeight: isActive("/catalog") ? 500 : 400,
                            boxShadow: isActive("/catalog") ? '0 2px 10px rgba(180, 83, 9, 0.4)' : 'none',
                            transition: 'all 0.25s ease',
                            '&:hover': {
                                color: '#fff',
                                background: isActive("/catalog") ? '#b45309' : 'rgba(255, 255, 255, 0.05)'
                            }
                        }}
                    >
                        Catalog
                    </Button>

                    {token && userRole === 'admin' && (
                        <Button 
                            onClick={() => navigate("/dashboard")} 
                            sx={{
                                background: isActive("/dashboard") ? "#b45309" : "transparent",
                                border: isActive("/dashboard") ? "none" : "1px dashed rgba(251, 191, 36, 0.4)",
                                color: isActive("/dashboard") ? "#fff !important" : "#fbbf24 !important",
                                fontSize: '0.9rem',
                                padding: '8px 18px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                textTransform: 'none',
                                fontWeight: isActive("/dashboard") ? 500 : 400,
                                boxShadow: isActive("/dashboard") ? '0 2px 10px rgba(180, 83, 9, 0.4)' : 'none',
                                transition: 'all 0.25s ease',
                                '&:hover': {
                                    background: isActive("/dashboard") ? '#b45309' : 'rgba(180, 83, 9, 0.2) !important',
                                    color: '#fef3c7 !important'
                                }
                            }}
                        >
                            Admin Vault ⚙️
                        </Button>
                    )}
                </Box>

                <Box 
                    onClick={() => navigate("/profile")} 
                    title="View Profile"
                    sx={{ display: 'flex', cursor: 'pointer', alignItems: 'center' }}
                >
                    <Box 
                        component="img" 
                        className="nav-avatar" 
                        src={avatarUrl} 
                        alt="Profile" 
                        onError={(e) => e.target.src = "/default-avatar.png"} 
                        sx={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #d97706',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                                transform: 'scale(1.08)',
                                boxShadow: '0 0 12px rgba(217, 119, 6, 0.5)'
                            }
                        }}
                    />
                </Box>
            </Box>
            <Feedback />
        </>
    )
}

export default Navbar
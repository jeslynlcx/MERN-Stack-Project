import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router';

function Login () {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const navigate = useNavigate()

    useEffect(() => {
        const userToken = localStorage.getItem("token")
        console.log(userToken)
        if (userToken !== null) navigate("/home")
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log("Form submitted:", { username, password })
        try {
            const response = await api.post("/users/login", {
                username,
                password,
            })
            localStorage.setItem("token", response.data.token)
            localStorage.setItem("role", response.data.role)
            navigate("/home")
            console.log(response.data)
            alert("Login Successful!")
        } catch (error) {
            console.log("Login Error: ", error)
            alert("Login failed. Wrong username or password")
        }
    }

    return(
        <div className="login-wrapper">
            <form onSubmit={handleSubmit} className="login-card">
                <h2>LYNIS Library Sign In "  "</h2>

                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input id="username" type="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" required />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                </div>

                <button type="submit" className="login-btn">
                    Sign In
                </button>
                <button className="register-btn" type="button" style={{ marginTop: "12px" }} onClick={() => navigate("/register")}>
                    No account? Sign up here!
                </button>
            </form>
        </div>
    )
}
export default Login
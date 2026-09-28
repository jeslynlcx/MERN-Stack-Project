import { useState } from 'react'
import api from '../utils/api'
import { useNavigate } from 'react-router'

function Register () {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try{
            await api.post("/users/register", { username, email, password })
            alert("Register Successful! Please sign in.")
            navigate("/")
        } catch (error) {
            console.log("Register Error: ", error)
            if(error.response && error.response.data) {
                alert("Registration failed: " + (error.response.data.message || "Username has been taken"))
            } else {
                alert("Registration failed. Please try again")
            }
            
        }
    }

    return(
        <div className='login-wrapper'>
            <form onSubmit={handleSubmit} className="login-card">
                <h2>Create Account</h2>

                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                </div>

                <button type="submit" className="login-btn">
                    Sign Up
                </button>

                <button className="register-btn" type="button" style={{ marginTop: "12px" }} onClick={() => navigate("/")}>
                    Already have an account? Sign in here
                </button>
            </form>
        </div>
    )
}
export default Register
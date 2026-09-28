import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router"
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Bookshelf from './pages/Bookshelf'
import Catalog from './pages/Catalog'
import Book from './pages/Book'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login/>} />
        <Route path='/register' element={<Register/>} /> 
        <Route path='/home' element={<Home/>} />
        <Route path='/bookshelf' element={<Bookshelf/>} />
        <Route path='/catalog' element={<Catalog/>} />
        <Route path="/book" element={<Book />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/profile' element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import PredictPage from './pages/PredictPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import HistoryPage from './pages/HistoryPage'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'

export default function App() {
  const [user, setUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Persistent session checking
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      
      if (savedUser && token) {
        setUser(JSON.parse(savedUser))
      }
    } catch (err) {
      console.error("Error restoring authentication session:", err)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    } finally {
      setCheckingAuth(false)
    }
  }, [])

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <span className="text-xs font-semibold tracking-widest uppercase">Initializing Session...</span>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
        <Navbar user={user} setUser={setUser} />
        
        <main className="min-h-[calc(100vh-4rem)]">
          <Routes>
            <Route path="/" element={<HomePage />} />
            
            <Route 
              path="/predict" 
              element={
                <PrivateRoute user={user}>
                  <PredictPage />
                </PrivateRoute>
              } 
            />
            
            <Route 
              path="/history" 
              element={
                <PrivateRoute user={user}>
                  <HistoryPage />
                </PrivateRoute>
              } 
            />
            
            <Route path="/login" element={<LoginPage setUser={setUser} />} />
            <Route path="/signup" element={<SignupPage setUser={setUser} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

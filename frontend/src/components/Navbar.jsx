import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Leaf, History, LogOut, LogIn, UserPlus, Sparkles } from 'lucide-react'

export default function Navbar({ user, setUser }) {
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  // Active route highlighting helper
  const isActive = (path) => location.pathname === path

  return (
    <motion.nav
      initial={{ opacity: 0, y: -25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b border-emerald-500/10 bg-[#030805]/80 backdrop-blur-md"
    >
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex justify-between items-center h-16">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-center group-hover:border-emerald-500/40 transition-colors shadow-inner">
              <Leaf className="w-5 h-5 text-[#10b981] group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-100 group-hover:opacity-90 transition-opacity tracking-tight">
                AgriShield
              </span>
              <span className="text-[10px] font-bold bg-emerald-950/40 border border-emerald-500/20 rounded px-1.5 py-0.5 text-[#10b981] uppercase tracking-wider">
                AI
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link 
              to="/predict" 
              className={`relative py-1.5 text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/predict') ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Scan Leaf</span>
              {isActive('/predict') && (
                <motion.div 
                  layoutId="nav-underline" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" 
                />
              )}
            </Link>

            <Link 
              to="/history" 
              className={`relative py-1.5 text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/history') ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4 shrink-0" />
              <span>Scan History</span>
              {isActive('/history') && (
                <motion.div 
                  layoutId="nav-underline" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" 
                />
              )}
            </Link>

            {/* Auth section */}
            {user ? (
              <div className="flex items-center gap-4 border-l border-slate-800 pl-4 ml-2">
                <span className="text-xs text-slate-400 font-bold hidden sm:inline-flex items-center gap-1.5 py-1 px-2.5 rounded bg-slate-900 border border-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  {user.username}
                </span>
                <button 
                  onClick={handleLogout} 
                  className="py-1.5 px-3 bg-slate-900 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-900/30 text-xs font-semibold text-rose-400 hover:text-rose-300 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-5 border-l border-emerald-500/10 pl-4 ml-2">
                <Link 
                  to="/login" 
                  className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="py-2 px-5 bg-[#0f9668] hover:bg-[#0ca370] text-sm font-bold text-white rounded-xl transition duration-200 shadow-md shadow-emerald-950/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Get Started</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

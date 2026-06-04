import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Leaf, AlertCircle, ArrowRight } from 'lucide-react'
import axios from 'axios'

export default function LoginPage({ setUser }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await axios.post('https://crop-disease-app-2.onrender.com/api/auth/login', {
        identifier,
        password
      })

      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      setUser(response.data.user)
      navigate('/predict')
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 relative overflow-hidden bg-[#030805]">
      {/* Background Radial Green Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-[440px] p-9 rounded-3xl border border-emerald-500/10 bg-[#060e0a]/80 backdrop-blur-xl shadow-2xl"
      >
        {/* Leaf branding header matching the screenshot logo exactly */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-center mb-5">
            <Leaf className="w-7 h-7 text-[#10b981]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Terminal Access
          </h1>
          <p className="text-sm text-slate-500 mt-2 text-center font-medium">
            Authenticate security token session infrastructure
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl border border-rose-500/25 bg-rose-950/30 text-rose-300 mb-6 text-sm"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Email / Username Input (labeled CORPORATE EMAIL) */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Corporate Email
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-[#10b981] transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3.5 bg-[#030805]/80 border border-emerald-500/10 rounded-xl text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all text-sm font-medium"
                placeholder="operator@agrishield.ai"
              />
            </div>
          </div>

          {/* Password Input (labeled SECURITY HASH VECTOR) */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Security Hash Vector
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-[#10b981] transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3.5 bg-[#030805]/80 border border-emerald-500/10 rounded-xl text-slate-100 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all text-sm font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Solid Green Access Console Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 bg-[#0f9668] hover:bg-[#0ca370] text-white font-bold rounded-xl transition duration-200 shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <span>{loading ? 'Authenticating...' : 'Access Console'}</span>
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        {/* Provision redirection prompt */}
        <div className="text-center mt-8 pt-6 border-t border-emerald-500/5">
          <p className="text-sm text-slate-500 font-medium">
            Unauthorized node traversal?{' '}
            <Link to="/signup" className="text-[#10b981] font-bold hover:text-emerald-400 transition-colors ml-1">
              Provision Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

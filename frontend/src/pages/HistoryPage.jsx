import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, Leaf, AlertCircle, Search, ArrowRight, RefreshCw 
} from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('https://crop-disease-app-2.onrender.com/api/predictions/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setHistory(response.data.history)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to retrieve your scan history. Make sure you are authenticated.')
    } finally {
      setLoading(false)
    }
  }

  // Calculate quick stats
  const totalScans = history.length
  const healthyScans = history.filter(h => h.is_healthy).length
  const diseasedScans = totalScans - healthyScans

  // Filter history based on search input
  const filteredHistory = history.filter(scan => 
    scan.disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scan.crop_type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen py-12 px-4 bg-[#030805] text-[#f1f5f9] relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-5xl relative z-10">
        
        {/* Title & Refresh */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#00e699] to-[#10b981] bg-clip-text text-transparent">
              Historical Diagnostics
            </h1>
            <p className="text-sm text-slate-400 mt-1.5 font-medium">
              Analyze previously scanned crops, disease outbreaks, and local treatment timelines.
            </p>
          </div>
          <button
            onClick={fetchHistory}
            className="self-start md:self-auto flex items-center gap-2 py-2.5 px-5 bg-[#060e0a] border border-emerald-500/10 hover:border-emerald-500/30 hover:bg-[#0a1a11] text-sm text-slate-300 font-bold rounded-xl transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-[#10b981]" />
            Refresh List
          </button>
        </div>

        {/* Diagnostic Stats Header */}
        {!loading && !error && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            <div className="p-4 rounded-2xl border border-emerald-500/10 bg-[#060e0a]/50 text-center shadow-xl">
              <span className="block text-[10px] uppercase text-slate-500 font-bold tracking-wider">Total Scans</span>
              <span className="block text-2xl font-black text-slate-100 mt-1">{totalScans}</span>
            </div>
            <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/15 text-center text-[#10b981] shadow-xl">
              <span className="block text-[10px] uppercase text-[#10b981]/50 font-bold tracking-wider">Healthy Crops</span>
              <span className="block text-2xl font-black mt-1">{healthyScans}</span>
            </div>
            <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-950/15 text-center text-amber-300 shadow-xl">
              <span className="block text-[10px] uppercase text-amber-300/50 font-bold tracking-wider">Diseased Leaves</span>
              <span className="block text-2xl font-black mt-1">{diseasedScans}</span>
            </div>
          </motion.div>
        )}

        {/* Searching bar */}
        {!loading && !error && history.length > 0 && (
          <div className="relative mb-8 group max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-[#10b981] transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by crop or disease..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#060e0a]/80 border border-emerald-500/10 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition text-sm font-medium"
            />
          </div>
        )}

        {/* States: Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <RefreshCw className="w-8 h-8 text-[#10b981] animate-spin mb-4" />
            <p className="text-sm font-semibold tracking-wider">Loading historical diagnostics...</p>
          </div>
        )}

        {/* States: Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-500/25 bg-rose-950/30 text-rose-300 mb-8 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* States: Empty */}
        {!loading && !error && history.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 rounded-3xl border border-dashed border-emerald-500/10 bg-[#060e0a]/30 text-center flex flex-col items-center justify-center"
          >
            <div className="w-14 h-14 rounded-full bg-[#060e0a] border border-emerald-500/10 flex items-center justify-center text-slate-650 mb-4">
              <Leaf className="w-6 h-6 animate-pulse text-[#10b981]/50" />
            </div>
            <h3 className="text-lg font-bold text-slate-300">No scans recorded yet</h3>
            <p className="text-xs text-slate-550 mt-1 max-w-sm font-medium">
              Your historical diagnostic reports will list here once you run crop disease evaluations.
            </p>
            <Link
              to="/predict"
              className="mt-6 flex items-center gap-2 py-3 px-6 bg-[#0f9668] hover:bg-[#0ca370] text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-950/30 cursor-pointer"
            >
              <span>Scan Your First Leaf</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

        {/* States: Grid List */}
        {!loading && !error && history.length > 0 && (
          <div>
            {filteredHistory.length === 0 ? (
              <p className="text-slate-500 text-sm italic text-center py-10">
                No matching scans found for "{searchTerm}".
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                <AnimatePresence>
                  {filteredHistory.map((scan, index) => (
                    <motion.div
                      key={scan.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-5 rounded-2xl border border-emerald-500/10 bg-[#060e0a]/70 backdrop-blur-xl shadow-xl flex gap-4 items-start hover:border-emerald-500/25 transition-all duration-200"
                    >
                      {/* Leaf Image Thumbnail */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#030805] shrink-0 border border-emerald-500/10">
                        <img 
                          src={`https://crop-disease-app-2.onrender.com${scan.image_url}`} 
                          alt="Analyzed leaf" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=150";
                          }}
                        />
                      </div>

                      {/* Diagnostic details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-1">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            scan.is_healthy 
                              ? 'bg-emerald-500/10 text-[#10b981] border border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {scan.is_healthy ? 'Healthy' : 'Diseased'}
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                            <Calendar className="w-3 h-3 text-[#10b981]" />
                            {new Date(scan.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="text-base font-extrabold text-slate-200 mt-2 truncate">
                          {scan.disease}
                        </h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                          {scan.crop_type.replace('_leaf', '')} leaf
                        </p>
                        
                        <div className="mt-3 flex items-center justify-between text-xs border-t border-emerald-500/5 pt-3">
                          <span className="text-slate-500 font-semibold">Confidence</span>
                          <span className="font-extrabold text-[#10b981]">
                            {(scan.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

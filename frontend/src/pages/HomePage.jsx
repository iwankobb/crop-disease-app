import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, Zap, Eye, ShieldAlert, BarChart2, ArrowRight, CheckCircle2, Cpu } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-[90vh] bg-[#030805] text-[#f1f5f9] relative overflow-hidden flex flex-col justify-center">
      {/* Decorative Radial Background Green Glows */}
      <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl" />

      {/* Main Hero Section */}
      <div className="container mx-auto px-4 py-20 relative z-10 max-w-5xl text-center">
        <div className="flex flex-col items-center space-y-8">
          
          {/* AI-Powered Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-950/20 text-[#10b981] text-xs font-bold shadow-inner tracking-wider uppercase"
          >
            <Activity className="w-3.5 h-3.5 animate-pulse text-[#10b981]" />
            <span>AI-Powered Plant Pathology</span>
          </motion.div>

          {/* Main Title Heading */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] max-w-4xl"
          >
            Protect Your Harvest with{" "}
            <span className="block mt-3 bg-gradient-to-r from-[#00e699] to-[#10b981] bg-clip-text text-transparent">
              Smart Crop Diagnostics
            </span>
          </motion.h1>

          {/* Hero Subtitle Description */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl text-center font-medium"
          >
            Monitor crop health, identify diseases early, and access organic remedies. Scan crop leaves instantly to protect your field's yield.
          </motion.p>

          {/* Deploy Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-2"
          >
            <Link 
              to="/predict" 
              className="py-4 px-10 bg-[#0f9668] hover:bg-[#0ca370] text-white font-bold rounded-xl transition duration-200 shadow-xl shadow-emerald-950/30 flex items-center gap-2.5 group cursor-pointer text-base"
            >
              <span>Start Diagnostic Scan</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Advanced Features Bento Grid */}
      <div className="container mx-auto px-4 py-12 relative z-10 max-w-5xl border-t border-emerald-500/10 pt-16 mb-16">
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Card 1: Instant Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-6 rounded-2xl border border-emerald-500/10 bg-[#060e0a]/60 hover:border-emerald-500/25 transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-center mb-5 text-[#10b981] group-hover:bg-emerald-950/50 transition-colors">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-200">
              Instant Analysis
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Get diagnostic results in seconds. Identify crop disease anomalies with state-of-the-art AI speed and precision.
            </p>
          </motion.div>

          {/* Card 2: Smart Validation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="p-6 rounded-2xl border border-emerald-500/10 bg-[#060e0a]/60 hover:border-emerald-500/25 transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-center mb-5 text-[#10b981] group-hover:bg-emerald-950/50 transition-colors">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-200">
              Smart Validation
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Verify crop leaves automatically. Our double-model validation system ensures highly accurate diagnoses.
            </p>
          </motion.div>

          {/* Card 3: Scan History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="p-6 rounded-2xl border border-emerald-500/10 bg-[#060e0a]/60 hover:border-emerald-500/25 transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-center mb-5 text-[#10b981] group-hover:bg-emerald-950/50 transition-colors">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-200">
              Scan History
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Keep track of past diagnoses, monitor seasonal crop health trends, and manage recommended organic treatment plans.
            </p>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UploadCloud, Camera, RefreshCw, CheckCircle2, AlertTriangle, 
  Leaf, Info, BookOpen, ShieldAlert, Sparkles, X, Activity 
} from 'lucide-react'
import axios from 'axios'

export default function PredictPage() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [activeStep, setActiveStep] = useState(0) // 0: Idle, 1: Upload, 2: YOLO, 3: MobileNet, 4: Done
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  
  // Webcam states
  const [webcamActive, setWebcamActive] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const videoRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const processFile = (selectedFile) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file.')
      return
    }
    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
    setError(null)
    setResult(null)
    setActiveStep(0)
  }

  // Camera integration
  const startWebcam = async () => {
    setResult(null)
    setError(null)
    setPreview(null)
    setFile(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: 640, height: 480 } 
      })
      setCameraStream(stream)
      setWebcamActive(true)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      setError('Unable to access device camera. Please check camera permissions.')
    }
  }

  const stopWebcam = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setWebcamActive(false)
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob((blob) => {
        const capturedFile = new File([blob], "captured_leaf.jpg", { type: "image/jpeg" })
        setFile(capturedFile)
        setPreview(URL.createObjectURL(capturedFile))
        stopWebcam()
      }, 'image/jpeg', 0.95)
    }
  }

  // Run dual AI inference step-by-step
  const handlePredict = async () => {
    if (!file) {
      setError('Please select or capture a crop leaf image.')
      return
    }

    setUploading(true)
    setError(null)
    setResult(null)
    
    // Simulate multi-stage pipeline loader for maximum UX fidelity
    setActiveStep(1) // Uploading
    
    const formData = new FormData()
    formData.append('image', file)

    try {
      // 1. Uploading image
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 2. YOLO leaf structure validation
      setActiveStep(2)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 3. MobileNetV2 classification
      setActiveStep(3)
      const token = localStorage.getItem('token')
      const response = await axios.post(
        'http://localhost:5000/api/predict',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      await new Promise(resolve => setTimeout(resolve, 600))
      setActiveStep(4) // Complete
      setResult(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'AI diagnostic pipeline failed. Make sure the server is online.')
      setActiveStep(0)
    } finally {
      setUploading(false)
    }
  }

  const clearSelection = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    setActiveStep(0)
  }

  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden bg-[#030805] text-[#f1f5f9]">
      {/* Background design elements */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-4xl relative z-10">
        
        {/* Title Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-950/20 text-[#10b981] text-xs font-bold mb-3"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dual-Model Local Pipeline</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[#00e699] to-[#10b981] bg-clip-text text-transparent">
            AI Crop Leaf Diagnostician
          </h1>
          <p className="text-sm md:text-base text-slate-400 mt-2 max-w-xl mx-auto font-medium">
            Upload an image or scan with your camera. YOLOv8 validates the leaf shape, and MobileNetV2 diagnoses historical diseases.
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 rounded-xl border border-rose-500/20 bg-rose-950/20 text-rose-300 mb-6 text-sm"
          >
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Scan Error: </span>
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-350 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        <div className="grid md:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Upload & Cameras */}
          <div className="md:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl border border-emerald-500/10 bg-[#060e0a]/85 backdrop-blur-xl shadow-xl">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#10b981]" />
                Select Scan Capture
              </h2>

              {/* Webcam active state */}
              {webcamActive ? (
                <div className="relative rounded-xl overflow-hidden bg-[#030805] aspect-video border border-emerald-500/10">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4">
                    <button
                      onClick={capturePhoto}
                      className="py-2 px-5 bg-[#0f9668] hover:bg-[#0ca370] text-white font-semibold rounded-xl text-sm transition shadow-lg cursor-pointer"
                    >
                      Capture Leaf
                    </button>
                    <button
                      onClick={stopWebcam}
                      className="py-2 px-5 bg-[#07120c] border border-emerald-500/10 hover:bg-[#0a1a11] text-slate-200 font-semibold rounded-xl text-sm transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Drag & Drop uploader area */
                <div>
                  {!preview ? (
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer group ${
                        dragActive 
                          ? 'border-emerald-500 bg-emerald-950/15' 
                          : 'border-emerald-500/10 bg-[#030805]/40 hover:border-emerald-500/30 hover:bg-[#060e0a]/40'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="w-14 h-14 rounded-full bg-[#060e0a] border border-emerald-500/10 flex items-center justify-center mb-4 text-slate-400 group-hover:text-[#10b981] group-hover:border-emerald-500/30 transition-all">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <p className="font-semibold text-slate-255 text-sm sm:text-base">
                        Drag and drop your leaf photo
                      </p>
                      <p className="text-xs text-slate-500 mt-1 max-w-[240px] font-medium">
                        Supports JPEG, PNG, or WEBP up to 16MB file limit
                      </p>
                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-xs px-2.5 py-1 bg-[#060e0a] border border-emerald-500/10 rounded text-slate-400 font-medium">or browse computer</span>
                      </div>
                    </div>
                  ) : (
                    /* Selected Image Preview */
                    <div className="relative rounded-xl overflow-hidden border border-emerald-500/10 bg-[#030805]/60 p-2">
                      <img 
                        src={preview} 
                        alt="Crop leaf preview" 
                        className="w-full h-auto max-h-72 object-contain rounded-lg mx-auto"
                      />
                      <button
                        onClick={clearSelection}
                        disabled={uploading}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#060e0a] border border-emerald-500/20 flex items-center justify-center text-slate-350 hover:text-white hover:bg-black transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Camera launcher */}
                  {!preview && (
                    <div className="mt-4 pt-4 border-t border-emerald-500/10 flex justify-center">
                      <button
                        onClick={startWebcam}
                        className="flex items-center gap-2 py-2.5 px-6 rounded-xl border border-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-950/10 text-sm text-slate-300 hover:text-[#10b981] transition cursor-pointer font-bold"
                      >
                        <Camera className="w-4 h-4" />
                        Use Camera Scanner
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Start AI inference execution */}
              {preview && !uploading && !result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <button
                    onClick={handlePredict}
                    className="w-full py-3.5 bg-[#0f9668] hover:bg-[#0ca370] text-white font-bold rounded-xl transition shadow-lg shadow-emerald-950/30 cursor-pointer flex items-center justify-center gap-2 text-sm"
                  >
                    <Leaf className="w-5 h-5" />
                    Start Local AI Diagnostics
                  </button>
                </motion.div>
              )}
            </div>

            {/* Pipeline Stage Indicators */}
            {uploading && (
              <div className="p-6 rounded-2xl border border-emerald-500/10 bg-[#060e0a]/85 backdrop-blur-xl shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Processing Local AI Stages
                </h3>
                
                <div className="space-y-3.5">
                  {[
                    { step: 1, label: "Uploading Image & Preprocessing", desc: "Checking file size and rescaling inputs" },
                    { step: 2, label: "YOLOv8 Leaf Object Detection", desc: "Verifying leaf shape & rejecting backgrounds" },
                    { step: 3, label: "MobileNetV2 Pathological Classification", desc: "Evaluating crop patterns using transfer learning" }
                  ].map((s) => {
                    const isDone = activeStep > s.step;
                    const isActive = activeStep === s.step;
                    return (
                      <div key={s.step} className="flex gap-3 items-start">
                        <div className="mt-0.5">
                          {isDone ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-405 text-xs font-bold">
                              ✓
                            </div>
                          ) : isActive ? (
                            <RefreshCw className="w-5 h-5 text-[#10b981] animate-spin" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-[#030805] border border-emerald-500/10" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-sm font-semibold ${isActive ? 'text-[#10b981]' : isDone ? 'text-slate-300' : 'text-slate-500'}`}>
                            {s.label}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">{s.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right panel: Prediction Results */}
          <div className="md:col-span-5">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Score badge / status card */}
                  <div className={`p-6 rounded-2xl border ${
                    result.is_healthy 
                      ? 'border-emerald-500/20 bg-emerald-950/20 text-emerald-200' 
                      : 'border-amber-500/20 bg-amber-950/20 text-amber-200'
                  } backdrop-blur-xl shadow-xl relative overflow-hidden`}>
                    
                    {/* Floating Glow */}
                    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl ${
                      result.is_healthy ? 'bg-emerald-400/10' : 'bg-amber-400/10'
                    }`} />
                    
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                          Diagnostic Result
                        </span>
                        <h3 className="text-2xl font-black mt-1">
                          {result.disease}
                        </h3>
                        <p className="text-xs text-slate-450 mt-1 font-semibold uppercase tracking-wider">
                          Detected: {result.crop_type.replace('_leaf', '')} leaf
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full border border-emerald-500/10 flex items-center justify-center shadow-lg bg-[#030805]">
                        {result.is_healthy ? (
                          <CheckCircle2 className="w-6 h-6 text-[#10b981]" />
                        ) : (
                          <ShieldAlert className="w-6 h-6 text-amber-400" />
                        )}
                      </div>
                    </div>

                    {/* Confidence Meter */}
                    <div className="mt-6 relative z-10">
                      <div className="flex justify-between items-center text-xs mb-2 font-bold text-slate-300">
                        <span>AI Prediction Confidence</span>
                        <span>{(result.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#030805] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence * 100}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${
                            result.is_healthy ? 'bg-[#10b981]' : 'bg-amber-500'
                          }`}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2 font-medium leading-relaxed">
                        Confidence scores are evaluated locally using cross-entropy networks.
                      </p>
                    </div>
                  </div>

                  {/* Treatment guide card */}
                  <div className="p-6 rounded-2xl border border-emerald-500/10 bg-[#060e0a]/85 backdrop-blur-xl shadow-xl">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-450 mb-4 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#10b981]" />
                      Treatment Recommendations
                    </h4>
                    
                    {result.is_healthy ? (
                      <div className="text-slate-300 text-sm leading-relaxed space-y-3">
                        <p className="font-medium">
                          Your crop leaf appears highly healthy. Continue regular agricultural monitoring and maintain good soil health!
                        </p>
                        <ul className="space-y-2 text-xs text-slate-500 list-disc pl-4 font-semibold">
                          <li>Ensure balanced watering schedules.</li>
                          <li>Inspect under leaf surfaces once a week.</li>
                          <li>Apply nitrogen-rich compost to strengthen fibers.</li>
                        </ul>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-[#030805] border border-emerald-500/10 text-sm text-slate-300 leading-relaxed font-medium">
                          {result.treatment || "No treatment data available."}
                        </div>
                        
                        <div className="flex gap-2.5 items-start text-xs text-slate-400 bg-emerald-950/10 border border-emerald-500/10 p-4 rounded-xl">
                          <Info className="w-4 h-4 shrink-0 text-[#10b981] mt-0.5" />
                          <p className="font-medium leading-relaxed">
                            We recommend applying bio-rational organic pesticides first to preserve beneficial soil microbiomes before chemical spraying.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Scan another crop button */}
                  <button
                    onClick={clearSelection}
                    className="w-full py-3.5 border border-emerald-500/10 bg-[#060e0a]/40 hover:bg-[#060e0a] text-slate-205 font-bold rounded-xl transition text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Diagnose Another Crop
                  </button>
                </motion.div>
              ) : (
                /* Idle state instructions */
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 rounded-2xl border border-[#10b981]/15 bg-[#060e0a]/30 border-dashed text-center flex flex-col items-center justify-center h-full min-h-[300px]"
                >
                  <div className="w-12 h-12 rounded-full border border-emerald-500/10 bg-[#060e0a] flex items-center justify-center text-slate-500 mb-4 animate-bounce">
                    <Leaf className="w-6 h-6 text-[#10b981]/50" />
                  </div>
                  <h3 className="text-base font-bold text-slate-350">
                    Awaiting Diagnostic Scan
                  </h3>
                  <p className="text-xs text-slate-500 max-w-[200px] mt-1 font-medium leading-relaxed">
                    Please upload or capture a crop leaf image to initiate the AI inference process.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  )
}

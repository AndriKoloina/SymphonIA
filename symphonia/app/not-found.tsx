"use client"

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Custom404() {
   const router = useRouter()
   const [seconds, setSeconds] = useState(5)
   const [progress, setProgress] = useState(500)

   useEffect(() => {
     if(seconds <= 0) {
      const timer = setTimeout(() => router.push('/home'), 500)
      return () => clearTimeout(timer)
     }

     const interval = setInterval(() => {
      setSeconds((prev) => prev - 1)
     }, 1000)

     const progressInterval = setInterval(() => {
      setProgress((prev) => Math.max(0, prev -(100 / 500)))
     })

     return() => {
      clearInterval(interval)
      clearInterval(progressInterval)
     }
   }, [seconds, router])

    return(
       <div className="min-h-screen flex flex-col items-center justify-center bg-[#17083F] text-white overflow-hidden font-sans">
     <div className="absolute inset-0 z-0 opacity-20" 
           style={{ backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', size: '40px 40px', backgroundSize: '40px 40px' }} />
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-indigo-500/30 w-1 h-1 rounded-full pointer-events-none"
          initial={{ x: Math.random() * 1920, y: Math.random() * 1080 }}
          animate={{ 
            y: [null, -100, -200],
            opacity: [0, 0.7, 0]
          }}
          transition={{ 
            duration: Math.random() * 5 + 5, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 5
          }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center">
        
        {/* TITRE AVEC EFFET GLITCH SUBTIL */}
        <div className="relative group">
          <motion.h1 
            animate={{ textShadow: ["0 0 10px #4f46e5", "0 0 20px #4f46e5", "0 0 10px #4f46e5"] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-[12rem] font-black leading-none tracking-tighter text-white/5 select-none"
          >
            404
          </motion.h1>
          <div className="absolute inset-0 flex items-center justify-center">
             
          </div>
        </div>

        <div className="relative mt-[2rem]">
          
          {/* Ondes de choc synchronisées sur les secondes */}
          <AnimatePresence>
            <motion.div
              key={seconds}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 rounded-full border border-indigo-500/50"
            />
          </AnimatePresence>

          <div className="relative w-56 h-56 rounded-full bg-slate-950/80 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-[0_0_50px_-12px_rgba(79,70,229,0.5)]">
            
           
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/20 via-transparent to-transparent z-20"
            />

            <svg className="absolute inset-0 w-full h-full p-4">
              {/* Cercle de base pointillé */}
              <circle cx="50%" cy="50%" r="42%" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 4" className="opacity-10" />
       
              <motion.circle
                cx="50%" cy="50%" r="42%"
                fill="none"
                stroke="url(#cyberGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="300"
                animate={{ strokeDashoffset: 300 - (300 * progress) / 100 }}
                transition={{ ease: "linear" }}
              />
              <defs>
                <linearGradient id="cyberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#4338ca" />
                </linearGradient>
              </defs>
            </svg>

            <div className="text-center z-30">
              <AnimatePresence mode="wait">
                <motion.div
                  key={seconds}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.5 }}
                  className="text-7xl font-mono font-bold"
                >
                  {seconds}
                </motion.div>
              </AnimatePresence>
              <div className="flex gap-1 justify-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-1 w-3 rounded-full ${i < seconds ? 'bg-indigo-500' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

   
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-12 group cursor-default"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="h-[1px] w-12 bg-indigo-500/50 group-hover:w-24 transition-all duration-500" />
            <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">
              Relocalisation en cours...
            </p>
          </div>
        </motion.div>

      </div>
    </div>
    )
}
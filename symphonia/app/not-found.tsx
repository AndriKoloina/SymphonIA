"use client"

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Custom404() {
   const router = useRouter()
   const [seconds, setSeconds] = useState(5)
   const [progress, setProgress] = useState(100) // Corrigé : part de 100 pour le cercle

   useEffect(() => {
     if(seconds <= 0) {
      const timer = setTimeout(() => router.push('/home'), 500)
      return () => clearTimeout(timer)
     }

     const interval = setInterval(() => {
      setSeconds((prev) => prev - 1)
     }, 1000)

     const progressInterval = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - (100 / 500)))
     }, 10)

     return() => {
      clearInterval(interval)
      clearInterval(progressInterval)
     }
   }, [seconds, router])

   return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#17083F] text-white overflow-hidden font-sans relative p-4">
      {/* Background Grids */}
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{ backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Particules */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-indigo-500/30 w-1 h-1 rounded-full pointer-events-none"
          initial={{ x: Math.random() * 1920, y: Math.random() * 1080 }}
          animate={{ y: [null, -100, -200], opacity: [0, 0.7, 0] }}
          transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl">
        
        {/* TITRE : Taille réduite sur les écrans courts (max-h-[600px]) */}
        <div className="relative group">
          <motion.h1 
            animate={{ textShadow: ["0 0 10px #4f46e5", "0 0 20px #4f46e5", "0 0 10px #4f46e5"] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-[9rem] sm:text-[2rem] lg:text-[8rem] short:text-[5rem] font-black leading-none tracking-tighter text-white/5 select-none transition-all"
          >
            404 not-found
          </motion.h1>
        </div>

     
        <div className="relative -mt-12 sm:-mt-20 short:mt-0">
          
          <AnimatePresence>
            <motion.div
              key={seconds}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 rounded-full border border-indigo-500/50"
            />
          </AnimatePresence>

          {/* Taille du cercle adaptative : plus petit sur mobile et écrans courts */}
          <div className="relative w-32 h-32 sm:w-56 sm:h-56 short:w-28 short:h-28 rounded-full bg-slate-950/80 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-[0_0_50px_-12px_rgba(79,70,229,0.5)]">
            
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/20 via-transparent to-transparent z-20"
            />

            <svg className="absolute inset-0 w-full h-full p-2 sm:p-4">
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
                  className="text-4xl sm:text-7xl short:text-3xl font-mono font-bold"
                >
                  {seconds}
                </motion.div>
              </AnimatePresence>
              <div className="hidden sm:flex gap-1 justify-center mt-1 short:hidden">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-1 w-3 rounded-full ${i < seconds ? 'bg-indigo-500' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER TEXT : Réduit sur les petits écrans */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-6 sm:mt-12 group cursor-default"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="h-[1px] w-8 sm:w-12 bg-indigo-500/50 group-hover:w-24 transition-all duration-500" />
            <p className="text-slate-400 font-mono text-xs sm:text-sm tracking-widest text-center px-4">
              Relocalisation en cours...
            </p>
          </div>
        </motion.div>

      </div>
    </div>
   )
}
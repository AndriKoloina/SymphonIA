"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Custom404() {
    const titleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.6,
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

    return(
        <div className="min-h-screen flex flex-col items-center justify-center  text-white overflow-hidden p-4">
            <motion.h1
                initial={{opacity:0, y: -50}}
                animate = {{opacity: 1, y: 0}}
                transition={{duration: 0.8, ease: "easeOut"}}
                className="text-[12rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-indigo-500 to-purple-800 opacity-50"
            >
                404
            </motion.h1>
            <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        className="mt-[-4rem] z-10 text-center"
      >
        <motion.h2 
          className="text-5xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400"
          initial="hidden"
          animate="visible"
          variants={titleVariants}
        >
          Not-found page
        </motion.h2>
        {/* La petite touche d'humour */}
        <p className="text-gray-400 italic mb-8 max-w-md mx-auto">
           
        </p>
      </motion.div>

      {/* Cercles de fond animés pour le décor */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1] 
        }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute w-[500px] h-[500px] bg-indigo-900 rounded-full blur-[120px] -z-10"
      />
        </div>
    )
}
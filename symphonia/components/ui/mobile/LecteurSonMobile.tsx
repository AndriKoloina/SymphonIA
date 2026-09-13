'use client'
import React, { useState, useRef, useEffect } from "react"
import { PlayIcon, PauseIcon, BackwardIcon, ForwardIcon } from "@heroicons/react/24/outline";

interface LecteurSonProps {
    title: string;
    duration: string;
    url: string;
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
}

export default function LecteurSonMobile({ title, duration, isPlaying, setIsPlaying }: LecteurSonProps) {
    const [currentTime, setCurrentTime] = useState(0)
    const svgRef = useRef<SVGSVGElement>(null)
    const [bars, setBars] = useState([0,0,0,0,0,0,0,0,0,0,0,0,0,0])

    const parseDurationToSeconds = (timeStr: string) => {
        if (!timeStr) return 0

        const parts = timeStr.split(':')
        if(parts.length === 2){
            return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)
        }
        return 0
    }

    const totalSeconds = parseDurationToSeconds(duration)

    const formatTime = (secs: number) => {
        const minuts = Math.floor(secs / 60)
        const seconds = Math.floor(secs % 60)
        return `${minuts} : ${seconds < 10 ? '0':''}${seconds} `
    }

    const radius = 180
    const strokeWidth = 4
    const circumference = 2 * Math.PI * radius
    const semiCircumference = circumference / 2

    const progress = totalSeconds > 0 ? Math.min(Math.max(currentTime / totalSeconds, 0), 1) : 0
    const strokeDashoffset = semiCircumference - (progress * semiCircumference)

    const handleArc = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
        if (!svgRef.current || totalSeconds === 0) return

        const rect = svgRef.current.getBoundingClientRect()
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

        const centerX = rect.left + rect.width / 2 
        const centerY = rect.bottom - strokeWidth

        const dx = clientX - centerX
        const dy = clientY - centerY

        let angle = Math.atan2(dy, dx)

        if(angle < 0) {
            angle = dx < 0 ? Math.PI : 0
        }

        const percentage = 1 - (angle / Math.PI)
        setCurrentTime(Math.round(percentage * totalSeconds))
    }

    const buttonRadius = 70

    const getButtonStyle = (
    angleDegrees: number, 
    offsetX: number = 0, 
    offsetY: number = 0  
) => {
    const angleRadians = (angleDegrees * Math.PI) / 180
    
    const x = -buttonRadius * Math.cos(angleRadians) + offsetX
    const y = buttonRadius * Math.sin(angleRadians) + offsetY

    return {
      
        transform: `translate(calc(-50% + ${x}px), ${y}px)`
    }
}

    useEffect(() => {
        const interval = setInterval(() => {
            setBars((prev) => prev.map(() => Math.floor(Math.random() * 70) + 20))
        }, 200)
        return() => clearInterval(interval)
    }, [])


    return (
       <div className="block lg:hidden w-full flex flex-col items-center p-6 mt-15 overflow-x">
    
    <div className="text-center mb-10 w-[80%]">
        <h1 className="text-xl font-bold">{title ||"Titre"}</h1>
    </div>

   
    <div 
        className="relative flex flex-col items-center justify-end" 
        style={{ 
            width: (radius + strokeWidth) * 2, 
            height: radius + strokeWidth + 20 
        }}
    >
      
        <div className="absolute top-0 left-0" style={{ width: (radius + strokeWidth) * 2, height: radius + strokeWidth }}>
            <svg
                ref={svgRef}
                width={(radius + strokeWidth) * 2}
                height={radius + strokeWidth * 2}
                className="cursor-pointer"
                onClick={handleArc}
                onMouseMove={(e) => e.buttons === 1 && handleArc(e)}
                onTouchMove={handleArc}
            >
                <path
                    d={`M ${strokeWidth},${radius + strokeWidth} A ${radius},${radius} 0 0,1 ${(radius * 2) + strokeWidth},${radius + strokeWidth}`}
                    fill="none"
                    className="stroke-zinc-200/30 dark:stroke-white/10"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
                <path
                    d={`M ${strokeWidth},${radius + strokeWidth} A ${radius},${radius} 0 0,1 ${(radius * 2) + strokeWidth},${radius + strokeWidth}`}
                    fill="none"
                    stroke="url(#symphonia-mobile-grad)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={semiCircumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-150 ease-out"
                />
                <defs>
                    <linearGradient id="symphonia-mobile-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
        <div 
            className="flex justify-between items-center text-xs font-bold text-zinc-400 dark:text-zinc-500 font-mono z-10 top-50 absolute "
            style={{ width: radius * 2 }} 
        >
            <span>{formatTime(currentTime)}</span>
            <span>{duration || "0:00"}</span>
        </div>

        <div className="absolute top-60 left-45 w-full h-full pointer-events-none">
            <button 
                style={getButtonStyle(15, -65)}
                className="absolute p-2  rounded-full  bg-white/20 text-pink-500 shadow-md active:scale-95 transition-transform pointer-events-auto"
            >
                <BackwardIcon className="w-5 h-5" />
            </button>

            <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={getButtonStyle(90 ,0)}
                className="absolute p-2 rounded-full text-pink-500 shadow-xl bg-white/20 active:scale-95 transition-transform z-10 pointer-events-auto"
            >
                {isPlaying ? <PauseIcon className="w-7 h-7" /> : <PlayIcon className="w-7 h-7 ml-0.5" />}
            </button>

            <button
                style={getButtonStyle(165, 65)}
                className="absolute p-2 rounded-full bg-white/20  text-pink-500 shadow-md active:scale-95 transition-transform pointer-events-auto"
            >
                <ForwardIcon className="w-5 h-5" />
            </button>
        </div>
        <div 
      className="flex items-end justify-center gap-1 h-10 w-60"
      style={{
        
        WebkitBoxReflect: "below 2px linear-gradient(transparent, rgba(255, 255, 255, 0.57))"
      }}
    >
      {bars.map((height, index) => (
        <div
          key={index}
          className="w-1 m-0.5 rounded-t-full bg-gradient-to-t from-pink-500 to-indigo-500"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
    </div>
</div>
    )
}
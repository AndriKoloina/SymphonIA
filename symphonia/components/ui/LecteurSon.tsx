'use client'

import React, { useEffect, useState } from 'react'
import { PlayIcon, PauseIcon, BackwardIcon, ForwardIcon, SpeakerWaveIcon } from "@heroicons/react/24/outline";
import type { SongCardProps } from '@/types/play_interface';

interface LecteurSonProps extends SongCardProps {}

export default function LecteurSon({ title, duration }: LecteurSonProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)

    const parseDuration = (dur: string) => {
        if (!dur || !dur.includes(":")) return 0
        try {
            const parts = dur.split(":")
            return (Number(parts[0]) || 0) * 60 + (Number(parts[1]) || 0)
        } catch (error) {
            return 0
        }
    };

    const totalSeconds = parseDuration(duration)

    const formaTime = (second: number) => {
        const min = Math.floor(second / 60)
        const sec = Math.floor(second % 60)
        return `${min}:${sec.toString().padStart(2, "0")}`
    }

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null
        if (isPlaying && currentTime < totalSeconds) {
            interval = setInterval(() => {
                setCurrentTime((prev) => prev + 1)
            }, 1000)
        } else if (currentTime >= totalSeconds) {
            setIsPlaying(false);
        }
        return () => { if (interval) clearInterval(interval) }
    }, [isPlaying, currentTime, totalSeconds])

    const progressPercent = totalSeconds > 0 ? (currentTime / totalSeconds) * 100 : 0;

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentTime(Number(e.target.value))
    }

    return (
        <div className="fixed bottom-6 left-[340px] right-8 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/70 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800 shadow-2xl rounded-3xl p-4 flex items-center gap-6">

                <div className="flex items-center gap-4 min-w-[180px]">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${isPlaying ? 'bg-indigo-600 rotate-3 shadow-lg shadow-indigo-500/50' : 'bg-gray-200 dark:bg-gray-800'}`}>
                        <svg className={`w-7 h-7 ${isPlaying ? 'text-white animate-pulse' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{title}</h4>
                        <p className="text-[10px] font-medium text-purple-500 uppercase tracking-tighter">Lecture en cours</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="text-gray-400 hover:text-purple-500 transition-colors"><BackwardIcon className="w-5 h-5" /></button>
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-11 h-11 rounded-full bg-gray-900 dark:bg-[var(--color-falling-barre)] text-white dark:text-gray-900 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
                    >
                        {isPlaying ? <PauseIcon className="w-6 h-6 text-white" /> : <PlayIcon className="w-6 h-6 ml-0.5 text-white" />}
                    </button>
                    <button className="text-gray-400 hover:text-purple-500 transition-colors"><ForwardIcon className="w-5 h-5" /></button>
                </div>

                <div className="flex-1 flex items-center gap-3 group">
                    <span className="text-[10px] font-mono text-gray-400 w-8">{formaTime(currentTime)}</span>

                    <div className="relative flex-1 h-1.5 flex items-center">
                        <input
                            type="range"
                            min="0"
                            max={totalSeconds}
                            value={currentTime}
                            onChange={handleSeek}
                            className="absolute w-full h-full opacity-0 cursor-pointer z-30"
                        />
                
                        <div className="absolute w-full h-full bg-gray-200 dark:bg-gray-700 rounded-full" />
                        <div
                            className="absolute h-full bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full z-10"
                            style={{ width: `${progressPercent}%` }}
                        />
                        <div 
                            className="absolute w-3 h-3 bg-white border-2 border-purple-500 rounded-full z-20 shadow-sm transition-transform group-hover:scale-125"
                            style={{ left: `calc(${progressPercent}% - 6px)` }}
                        />
                    </div>

                    <span className="text-[10px] font-mono text-gray-400 w-8">{duration}</span>
                </div>

                
                <div className="flex items-center gap-2 pr-2 border-l border-gray-100 dark:border-gray-800 pl-4">
                    <SpeakerWaveIcon className="w-4 h-4 text-gray-400" />
                    <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="bg-gray-400 h-full w-[70%]" />
                    </div>
                </div>
            </div>
        </div>
    )
}
'use client'

import { PlayIcon, ArrowPathIcon, EyeIcon } from "@heroicons/react/24/outline"

interface SongCardScannedProps {
  title: string
  duration: string
  dateCreated: string
  onPlay: () => void
}

export default function SongCardScanned({ title, duration, dateCreated, onPlay }: SongCardScannedProps) {
    return (
        <div 
            onClick={onPlay}
            className="group flex items-center gap-4 w-full p-2 rounded-xl transition-all duration-300 hover:bg-white/50 dark:hover:bg-gray-800/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer"
        >
            {/* 1. L'aperçu miniature (Style Papier) */}
            <div className="relative h-12 w-12 flex-shrink-0 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden">
                {/* Simulation de lignes de partition très petites */}
                <div className="flex flex-col gap-1 p-2 opacity-20">
                    <div className="h-[1px] w-full bg-black dark:bg-white" />
                    <div className="h-[1px] w-full bg-black dark:bg-white" />
                    <div className="h-[1px] w-full bg-black dark:bg-white" />
                </div>
                
                {/* Play icon au survol de la miniature */}
                <div className="absolute inset-0 bg-indigo-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayIcon className="w-5 h-5 text-white fill-current" />
                </div>
            </div>

            {/* 2. Infos Textuelles en Flex (Centre) */}
            <div className="flex flex-1 items-center justify-between min-w-0">
                <div className="flex flex-col min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate tracking-tight">
                        {title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter bg-indigo-500/10 px-1.5 py-0.5 rounded">
                            Scan
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                            {dateCreated}
                        </span >
                    </div>
                </div>

                {/* 3. Actions et Durée (Droite) */}
                <div className="flex items-center gap-4 ml-4">
                    <span className="text-xs font-mono text-gray-400 hidden sm:block">
                        {duration || "--:--"}
                    </span>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded-full transition-all">
                            <EyeIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-full transition-all">
                            <ArrowPathIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
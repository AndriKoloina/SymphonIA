import React from 'react'
import { MusicalNoteIcon, CalendarDateRangeIcon, ClockIcon, PlayIcon, PauseIcon } from "@heroicons/react/24/outline"

// 1. On ajoute isPlaying dans les types de vos props
interface SongCardMobileProps {
  title: string
  duration: string
  dateCreated: string
  isPlaying: boolean // Indique si ce morceau est actuellement joué
  onPlay: (playState: boolean) => void // Envoie le nouvel état au parent
}

export default function SongCardMobile({ title, duration, dateCreated, isPlaying, onPlay }: SongCardMobileProps) {
    return (
        <div className="block lg:hidden relative w-full bg-transparent p-4 text-slate-200"> 
             <div className="flex items-center gap-4">
                {/* Icône de note fixée en hauteur/largeur pour éviter les déformations */}
                <MusicalNoteIcon className="w-9 h-9 bg-white/10 p-1.5 border border-white/20 rounded-md text-fuchsia-400 flex-shrink-0" />
             
                <div className="flex flex-1 items-center justify-between min-w-0">
                    <div className="flex flex-col gap-1 min-w-0">
                        {/* truncate évite que les longs titres ne cassent le bouton Play */}
                        <span className="tracking-wide text-xs text-slate-100 font-semibold truncate block">
                            {title}
                        </span>
                        
                        <div className="flex items-center text-[0.75rem] text-slate-400 gap-2">
                            <span className="flex items-center gap-0.5">
                                <CalendarDateRangeIcon className="w-3.5 h-3.5 text-slate-500" />
                                {dateCreated}
                            </span>
                            <span className="flex items-center gap-0.5 ml-1">
                                <ClockIcon className="w-3.5 h-3.5 text-slate-500" />
                                {duration}
                            </span>
                        </div>
                    </div>
                    
                    {/* 2. Condition basée sur isPlaying pour afficher le bon bouton */}
                    {isPlaying ? (
                        <PauseIcon 
                            className="w-7 h-7 text-fuchsia-500 hover:text-fuchsia-400 cursor-pointer flex-shrink-0 transition-colors"
                            onClick={() => onPlay(false)} // Clic sur Pause -> on arrête la lecture
                        />
                    ) : (
                        <PlayIcon 
                            className="w-7 h-7 text-fuchsia-500 hover:text-fuchsia-400 cursor-pointer flex-shrink-0 transition-colors"
                            onClick={() => onPlay(true)} // Clic sur Play -> on lance la lecture
                        />
                    )}
                </div>
            </div>
            <div className="absolute bottom-0 left-10 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        </div>
    )
}
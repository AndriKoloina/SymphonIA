'use client'
import type { PlayButtonInterface } from "@/types/play_interface"

export default function PlayButton({isPlaying, onToggle, label= "Mélodie"} : PlayButtonInterface) {
    return (
    <div className="flex items-center gap-4 p-2 bg-[transparent]/50 rounded-[0.8rem] border border-white/5 backdrop-blur-sm shadow-xl m-5" >
      <button 
        onClick={onToggle}
        className={`group relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 active:scale-90
          ${isPlaying 
            ? 'bg-red-500/20 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
            : 'bg-gradient-to-br from-purple-600 to-indigo-700 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]'
          }`}
      >
        {isPlaying ? (
          <div className="flex gap-1.5">
            <div className="w-1.5 h-4 bg-red-400 rounded-full animate-pulse"></div>
            <div className="w-1.5 h-4 bg-red-400 rounded-full animate-pulse"></div>
          </div>
        ) : (
          <div className="ml-1 w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent group-hover:scale-110 transition-transform"></div>
        )}
        {isPlaying && (
          <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20"></span>
        )}
      </button>

      <div className="flex flex-col pr-4">
        <span className="text-[9px] text-purple-400 font-bold tracking-widest uppercase opacity-70">
          {label}
        </span>
        <span className={`text-[11px] font-medium transition-colors ${isPlaying ? 'text-red-400  translate-all duration-300' : 'text-white/80  translate-all duration-300'}`}>
          {isPlaying ? "STOP" : "PLAY"}
        </span>
      </div>
    </div>
  );
}


import { MusicalNoteIcon, PlayIcon } from "@heroicons/react/24/outline"

interface SongCardCreatedProps {
  title: string
  duration: string
  dateCreated: string
  onPlay: () => void
}

export default function SongCardCreated({ title, duration, dateCreated, onPlay }: SongCardCreatedProps) {
    return (
        <div className="hidden lg:block group relative flex flex-col w-full max-w-1 md:max-w-25 mx-auto snap-start">
            <div className="relative aspect-square mb-3 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/15 to-indigo-500/10 border border-white/10 transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(168,_85,_247,_0.35)] group-hover:-translate-y-2">
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-all duration-300 z-10 flex items-center justify-center">
                    <button 
                        onClick={onPlay}
                        className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-2xl hover:bg-purple-500 hover:scale-110 active:scale-95"
                    >
                        <PlayIcon className="w-6 h-6 text-white ml-0.5 fill-current" />
                    </button>
                </div>

              
                <div className="w-full h-full flex items-center justify-center">
                    <MusicalNoteIcon className="w-10 h-10 text-purple-300/80" />
                </div>
            </div>

            <div className="px-1">
                <h3 className="text-xs md:text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                    {title}
                </h3>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-slate-400 uppercase">{dateCreated}</span>
                    <span className="text-[10px] text-slate-300 font-mono">{duration}</span>
                </div>
            </div>
        </div>
    )
}
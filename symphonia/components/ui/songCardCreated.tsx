import { MusicalNoteIcon, PlayIcon } from "@heroicons/react/24/outline"

export default function SongCardCreated({ title, duration, dateCreated, onPlay }: any) {
    return (
        <div className="flex-shrink-0 w-[10rem] snap-start group">
            <div className="relative aspect-[4/3] mb-4 overflow-hidden rounded-3xl bg-gray-100 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-purple-500/20 group-hover:-translate-y-2">
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 z-10 flex items-center justify-center">
                    <button 
                        onClick={onPlay}
                        className="w-14 h-14 bg-white rounded-full flex items-center justify-center opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-xl hover:bg-purple-50"
                    >
                        <PlayIcon className="w-7 h-7 text-purple-600 ml-1 fill-purple-600" />
                    </button>
                </div>

                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                    <MusicalNoteIcon className="w-16 h-16 text-gray-300 dark:text-gray-700 group-hover:text-purple-300 dark:group-hover:text-purple-900 transition-colors duration-500" />
                </div>
            </div>

            <div className="px-2">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-purple-500 transition-colors">
                    {title}
                </h3>
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded font-mono">
                            {duration}
                        </span>
                    </div>
                    <span className="text-[10px] text-purple-500 font-bold uppercase tracking-widest opacity-80">
                        {dateCreated}
                    </span>
                </div>
            </div>
        </div>
    )
}
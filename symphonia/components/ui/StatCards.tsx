import React from "react"
import type { StatCardProps } from "@/types/play_interface"

export default function StatCard({ title, value,  icon: Icon, colorClass } : StatCardProps) {

    return(
       <div className="flex w-full max-w-[240px] mx-auto bg-white/[0.06] backdrop-blur rounded-2xl shadow-lg shadow-black/30 border border-white/10 overflow-hidden hover:shadow-purple-500/20 hover:-translate-y-0.5 transition-all duration-200">
            <div className={`w-1.5 flex-shrink-0 ${colorClass}`} />
            <div className="flex items-center p-4 w-full gap-3">

                <div className="p-2 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500/30 to-indigo-500/20 border border-white/10 flex-shrink-0">
                    {Icon && <Icon className="w-5 h-5 text-white" />}
                </div>


                <div className="flex flex-col justify-center min-w-0">
                    <span className="text-lg sm:text-xl font-bold text-white leading-none truncate">
                        {value}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider mt-1 truncate">
                        {title}
                    </span>
                </div>
                
            </div>
        </div>
    )
}



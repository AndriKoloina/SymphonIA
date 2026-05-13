import React from "react"
import type { StatCardProps } from "@/types/play_interface"

interface StatCard extends StatCardProps {}

export default function StatCard({ title, value,  icon: Icon, colorClass } : StatCard) {

    return(
       <div className="flex w-full max-w-[240px] mx-auto bg-gray-900  border-gray-800 dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className={`w-1.5 flex-shrink-0 ${colorClass}`} />
            <div className="flex items-center p-4 w-full gap-3">
                
                <div className="p-2 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800 flex-shrink-0">
                    {Icon && <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
                </div>

               
                <div className="flex flex-col justify-center min-w-0">
                    <span className="text-lg sm:text-xl font-bold text-white/85 dark:text-white leading-none truncate">
                        {value}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400  tracking-wider mt-1 truncate">
                        {title}
                    </span>
                </div>
                
            </div>
        </div>
    )
}



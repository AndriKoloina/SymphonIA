'use client'

import { ScrollSectionPage } from "@/types/play_interface";

export function VerticalSection({ title, children }: ScrollSectionPage) {
    return (
        <div className="mb-12 w-full">
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {title}
                </h2>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {Array.isArray(children) ? children.length : 0} éléments
                </span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                {children}
            </div>
        </div>
    );
}
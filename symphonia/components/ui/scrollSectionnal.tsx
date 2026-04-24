'use client'

import React from 'react'
import { ScrollSectionPage } from "@/types/play_interface"

export function ScrollSectionnal({ title, children }: ScrollSectionPage) {
    return (
      <div className="mb-12 w-full flex flex-col border border-zinc-200/50 dark:border-white/5 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/30 overflow-hidden ">
            
            <div className="p-6 pb-2">
                <div className="flex items-end justify-between mb-4">
                    <div className="space-y-1">
                        <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                            {title}
                        </h2>
                        <div className="h-1 w-10 bg-purple-600 rounded-full" />
                    </div>
                </div>
            </div>
            <div className="h-[20rem] overflow-y-auto px-6 pb-6 custom-scrollbar">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-x-4 gap-y-6 content-start">
                    {children}
                </div>
            </div>
        </div>
    )
}
'use client'

import React from 'react'
import { ScrollSectionPage } from "@/types/play_interface"

export function ScrollSectionnal({ title, children }: ScrollSectionPage) {
    return (
      <div className="hidden lg:block ml-[9%] lg:ml-0 mt-4 lg:mt-0 mb-12 w-[90%] lg:w-full h-[50%] lg:h-auto flex flex-col border border-white/10 rounded-3xl bg-[#1B2945]/60 backdrop-blur overflow-hidden shadow-xl shadow-black/20">
            <div className="p-6 pb-2">
                <div className="flex items-end justify-between mb-4">
                    <div className="space-y-1">
                        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                            {title}
                        </h2>
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
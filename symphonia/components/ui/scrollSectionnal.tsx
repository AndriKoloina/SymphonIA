'use client'

import React, { useRef } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import { ScrollSectionPage } from "@/types/play_interface";

export function ScrollSectionnal({ title, children }: ScrollSectionPage) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -current.offsetWidth : current.offsetWidth;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="mb-12 w-full group/section">
            <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {title}
                </h2>
            </div>

            <div className="relative overflow-visible">
                <button 
                    onClick={() => scroll('left')}
                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 group-hover/section:opacity-100 transition-all hover:scale-110 text-gray-700 dark:text-white"
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <div 
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                >
                    {children}
                    <div className="flex-shrink-0 w-8" /> 
                </div>

                <button 
                    onClick={() => scroll('right')}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 group-hover/section:opacity-100 transition-all hover:scale-110 text-gray-700 dark:text-white"
                >
                    <ChevronRightIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
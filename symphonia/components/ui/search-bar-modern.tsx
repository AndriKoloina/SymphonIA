"use client";

import React from "react";
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { SearchBarProps } from "@/types/play_interface";

interface SearchBar extends SearchBarProps {}


export default function SearchBar({ placeholder = "Rechercher une partition, un enregistrement...", onChange }: SearchBar) {
  return (
    <div className="relative w-xl max-w-2xl group mr-4">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10"> 
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors"/>
        </div>

        <input 
            type="text"
            placeholder={placeholder}
            onChange={(e) => onChange && onChange(e.target.value)}
            className="block w-full pl-12 pr-12 py-3 bg-white/50 dark:bg-gray-900/50  backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-sm text-xs "
        />

    </div>
  )
}
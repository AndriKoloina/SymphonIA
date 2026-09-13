"use client";

import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { SearchBarProps } from "@/types/play_interface";

export default function SearchBar({ placeholder = "Rechercher une partition, un enregistrement...", onChange }: SearchBarProps) {
  return (
    <div className="relative w-100 pb-2 mr-auto ml-5 lg:w-[25rem] sm:max-w-md lg:max-w-2xl group transition-all duration-300">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
        <MagnifyingGlassIcon className="h-5 w-5 text-slate-300 group-focus-within:text-purple-300 group-focus-within:scale-110 transition-all duration-300"/>
      </div>

      <input
  type="text"
  placeholder={placeholder}
  onChange={(e) => onChange && onChange(e.target.value)}
  className="block w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl text-xs md:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/60 focus:border-purple-400 transition-all shadow-lg shadow-black/20 border border-white/15"
/>
  
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500" />
    </div>
  )
}
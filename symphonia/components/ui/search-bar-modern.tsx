"use client";

import React from "react";
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { SearchBarProps } from "@/types/play_interface";

interface SearchBar extends SearchBarProps {}


export default function SearchBar({ placeholder = "Rechercher une partition, un enregistrement...", onChange }: SearchBar) {
  return (
    <div className="relative w-[30rem] sm:max-w-md lg:max-w-2xl group transition-all duration-300">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10"> 
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 group-focus-within:scale-110 transition-all duration-300"/>
      </div>

      <input 
        type="text"
        placeholder={placeholder}
        onChange={(e) => onChange && onChange(e.target.value)}
        
        className="block w-full pl-12 pr-4 py-3 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 rounded-2xl text-sm md:text-base placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all shadow-sm dark:text-white"
      />

  
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500" />
    </div>
  )
}
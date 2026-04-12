'use client'

import React, { useState } from 'react'
import SymphoniaSidebar from "@/components/ui/Side-bar-modern"
import { TitlePage } from "@/components/ui/TitlePage"
import SearchBar from "@/components/ui/search-bar-modern"
import AudioPlayer from "@/components/ui/LecteurSon"
import { ScrollSectionnal } from "@/components/ui/scrollSectionnal"
import SongCardCreated from "@/components/ui/songCardCreated"

export default function LibraryPage() {
  // 1. Tes données (on peut imaginer deux listes séparées plus tard)
  const mesSons = [
    {
      id: 1,
      title: "Analyse Mélodique #1",
      duration: "3:45",
      dateCreated: "2024-06-15"
    },
    {
      id: 2,
      title: "Composition IA #2",
      duration: "2:30",
      dateCreated: "2024-06-16"
    },
    {
      id: 3,
      title: "Analyse Mélodique #1",
      duration: "3:45",
      dateCreated: "2024-06-15"
    },
    {
      id: 4,
      title: "Composition IA #2",
      duration: "2:30",
      dateCreated: "2024-06-16"
    },{
      id: 5,
      title: "Analyse Mélodique #1", 
      duration: "3:45",
      dateCreated: "2024-06-15"
    },
    {
      id: 6,
      title: "Composition IA #2",
      duration: "2:30",
      dateCreated: "2024-06-16"
    },{
      id: 7,
      title: "Analyse Mélodique #1", 
      duration: "3:45",
      dateCreated: "2024-06-15"
    },
    {
      id: 8,
      title: "Composition IA #2",
      duration: "2:30",
      dateCreated: "2024-06-16"
    }
  ]

  const [activeTrack, setActiveTrack] = useState(mesSons[0])

  return (
    <div className="flex min-h-screen overflow-hidden">
      <SymphoniaSidebar />
      
      <main className="flex-1 ml-80 p-8 pb-32">
  
        <div className="flex items-center justify-between mb-10 gap-8">
          <TitlePage title="Bibliothèque" />
          <div className="flex-1 max-w-xl">
            <SearchBar placeholder="Rechercher dans votre bibliothèque..." />
          </div>
        </div>

        <div className="relative pl-8 py-4 mb-12 group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.3)]" />
          
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight transition-colors">
            {activeTrack.title}
          </h1>
          
          <div className="flex items-center mt-2 text-gray-500 dark:text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">
              Enregistré le :
            </span>
            <p className="ml-3 px-2 py-0.5 rounded font-mono text-xs font-bold text-pink-500 bg-pink-500/10 border border-pink-500/20">
              {activeTrack.dateCreated}
            </p>
          </div>
        </div>

      
        <div className="w-[37rem] bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg border border-white/20 dark:border-gray-800 rounded-3xl p-5 mb-12 shadow-xl">
          <ScrollSectionnal title="Mes Scans Récents">
          {mesSons.map(item => (
            <SongCardCreated 
              key={item.id} 
              title={item.title}
              duration={item.duration}
              dateCreated={item.dateCreated}
              onPlay={() => setActiveTrack(item)}
            />
          ))}
        </ScrollSectionnal>
        </div>

        <AudioPlayer
          title={activeTrack.title}
          duration={activeTrack.duration}
        />
      </main>
    </div>
  )
}
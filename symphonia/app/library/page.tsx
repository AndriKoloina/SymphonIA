'use client'

import React, { useState } from 'react'
import SymphoniaSidebar from "@/components/ui/Side-bar-modern"
import { TitlePage } from "@/components/ui/TitlePage"
import SearchBar from "@/components/ui/search-bar-modern"
import { ScrollSectionnal } from "@/components/ui/scrollSectionnal"
import SongCardCreated from "@/components/ui/songCardCreated"
import LecteurSon from '@/components/ui/LecteurSon'
import SideMobile from '@/components/ui/mobile/bar_options'
import { ScrollSectionnalMobile } from '@/components/ui/mobile/scrollSectionnalMobile'
import SongCardMobile from '@/components/ui/mobile/songCardsMobile'
import { MusicalNoteIcon } from '@heroicons/react/24/outline'

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)

  const mesSons = [
  {
    id: 1,
    title: "L'Envol des Murmures (Soprano)",
    duration: "4:12",
    dateCreated: "2024-06-10"
  },
  {
    id: 2,
    title: "Résonance de l'Âme (Alto)",
    duration: "3:25",
    dateCreated: "2024-06-12"
  },
  {
    id: 3,
    title: "Chœur des Ombres - Acte I",
    duration: "5:40",
    dateCreated: "2024-06-14"
  },
  {
    id: 4,
    title: "Éclat de Ténor (Solo)",
    duration: "2:55",
    dateCreated: "2024-06-15"
  },
  {
    id: 5,
    title: "Vocalise en Ré Mineur",
    duration: "1:50",
    dateCreated: "2024-06-16"
  },
  {
    id: 6,
    title: "Sérénade au Clair de Lune",
    duration: "3:15",
    dateCreated: "2024-06-18"
  },
  {
    id: 7,
    title: "L'Aube Grise (Baryton)",
    duration: "4:05",
    dateCreated: "2024-06-20"
  },
  {
    id: 8,
    title: "Hymne à la Lumière",
    duration: "6:20",
    dateCreated: "2024-06-21"
  },
  {
    id: 9,
    title: "Souffle d'Hiver (Choral)",
    duration: "3:30",
    dateCreated: "2024-06-22"
  },
  {
    id: 10,
    title: "Cantique de la Mer",
    duration: "4:45",
    dateCreated: "2024-06-23"
  },
  {
    id: 11,
    title: "L'Écho des Montagnes",
    duration: "2:10",
    dateCreated: "2024-06-25"
  },
  {
    id: 12,
    title: "Ballade de l'Oubli",
    duration: "3:55",
    dateCreated: "2024-06-26"
  },
  {
    id: 13,
    title: "Requiem Imaginaire",
    duration: "7:12",
    dateCreated: "2024-06-27"
  },
  {
    id: 14,
    title: "Aria pour Cœur Brisé",
    duration: "3:20",
    dateCreated: "2024-06-28"
  },
  {
    id: 15,
    title: "Chant du Crépuscule",
    duration: "4:00",
    dateCreated: "2024-06-29"
  },
  {
    id: 16,
    title: "Alléluia Éphémère",
    duration: "2:45",
    dateCreated: "2024-06-30"
  }
]
  
  const filteredSons = mesSons.filter(son =>
    son.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const [activeTrack, setActiveTrack] = useState(mesSons[0])

  const handlePlayTrack = (track: any, requestedState?: boolean) => {
    if (activeTrack?.id === track.id && requestedState === false) {
      setIsPlaying(false)
      return
    }
    setActiveTrack(track)
    setIsPlaying(true)
  }
  return (
      <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden">
      <div className="hidden lg:block">
              <SymphoniaSidebar/>
            </div>
      <div className="block lg:hidden">
              <SideMobile/>
      </div>
      <main className="flex-1 ml-0 lg:ml-80 pt-3 ">
        <div className="flex items-center justify-between  gap-8">
          <TitlePage title="Bibliothèque" />
          <div>
            <SearchBar
             placeholder="Rechercher dans votre bibliothèque..." 
             onChange={(val) => setSearchQuery(val)}
             />
          </div>
        </div>

        <div className="flex items-start gap-12">
 
    <div className="relative pl-8 py-4 group flex flex-1 justify-content items-between">
      <div>
        <div className="absolute left-4 top-0 bottom-0 w-1.5 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
      
      <span className="text-[0.5rem] lg:text-[10px] font-black uppercase text-purple-500 tracking-[0.3em] mb-2 block">
        Lecture en cours
      </span>
      
      <h1 className="text-[1rem] lg:text-3xl font-black text-white/95 dark:text-white tracking-tight leading-tight mb-4 break-words">
        {activeTrack.title}
      </h1>
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <span className="text-[0.5rem] lg:text-[9px] font-bold uppercase tracking-wider opacity-60">
            Enregistré le :
          </span>
          <p className="ml-3 px-2 py-0.5 rounded font-mono text-[0.5em] lg:text-[11px] font-bold text-pink-500 bg-pink-500/10 border border-pink-500/20">
            {activeTrack.dateCreated}
          </p>

              <div className="flex items-center text-gray-500 dark:text-gray-400 ml-5">
              <span className="text-[0.5rem] lg:text-[9px] font-bold uppercase tracking-wider opacity-60">
                Durée :
              </span>
              <p className="ml-3 font-mono text-[0.5em] lg:text-[11px] font-bold dark:text-gray-300">
                {activeTrack.duration}
              </p>
            </div>
        </div>
          
      </div>
      </div>
      <div className='block lg:hidden relative top-1'>
        <MusicalNoteIcon
          className={`w-15 h-15 rounded-xl p-2 ml-4 transition-all duration-300 ${
            isPlaying
              ? 'text-white bg-gradient-to-tr from-pink-500 to-indigo-500 animate-pulse ring-2 ring-purple-500/20'
              : 'text-slate-500 bg-white/5 border border-white/10'
          }`}
        />
      </div>
    </div>
  </div>

  
        
    <ScrollSectionnal title="Mon playlist">
          {filteredSons.length > 0 ? (
            filteredSons.map(item => (
              <SongCardCreated 
                key={item.id} 
                title={item.title}
                duration={item.duration}
                dateCreated={item.dateCreated}
                onPlay={() => handlePlayTrack(item)}
              />
            ))
          ) : (
            <div className="py-10 text-center w-full">
              <p className="text-gray-400 italic">Aucun résultat pour "{searchQuery}"</p>
            </div>
          )}
        </ScrollSectionnal>

        <ScrollSectionnalMobile title="Mon playlist"> 
          {filteredSons.length > 0 ? (
            filteredSons.map(item => (
              <SongCardMobile
                key={item.id} 
                title={item.title}
                duration={item.duration}
                dateCreated={item.dateCreated}
                isPlaying={activeTrack.id === item.id && isPlaying}
                onPlay={(requestedState) => handlePlayTrack(item, requestedState)}
              />
            ))
          ) : (
            <div className="py-10 text-center w-full">
              <p className="text-gray-400 italic">Aucun résultat pour "{searchQuery}"</p>
            </div>
          )}
        </ScrollSectionnalMobile>
  
        <LecteurSon
          title={activeTrack.title}
          duration={activeTrack.duration}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          url='/'
        />
      </main>
    </div>
  )
}
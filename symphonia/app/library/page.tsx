'use client'

import React, { useState } from 'react'
import SymphoniaSidebar from "@/components/ui/Side-bar-modern"
import { TitlePage } from "@/components/ui/TitlePage"
import SearchBar from "@/components/ui/search-bar-modern"
import { ScrollSectionnal } from "@/components/ui/scrollSectionnal"
import SongCardCreated from "@/components/ui/songCardCreated"
import LecteurSon from '@/components/ui/LecteurSon'
import SideMobile from '@/components/ui/mobile/bar_options'
// import { ScrollSectionnalMobile } from '@/components/ui/mobile/scrollSectionnalMobile'
// import SongCardMobile from '@/components/ui/mobile/songCardsMobile'
import { MusicalNoteIcon } from '@heroicons/react/24/outline'
import { SONGS, type Song } from '@/hooks/songs'
import ContentMain from "@/components/ui/ContentMain"

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)

  const mesSons = SONGS
  
  const filteredSons = mesSons.filter(son =>
    son.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const [activeTrack, setActiveTrack] = useState(mesSons[0])

  const handlePlayTrack = (track: Song, requestedState?: boolean) => {
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
      <ContentMain className="pt-3">
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
      
      <span className="text-[0.5rem] lg:text-[10px] font-black uppercase text-purple-300 tracking-[0.3em] mb-2 block">
        Lecture en cours
      </span>

      <h1 className="text-[1rem] lg:text-3xl font-black text-white tracking-tight leading-tight mb-4 break-words">
        {activeTrack.title}
      </h1>

      <div className="flex flex-col gap-2">
        <div className="flex items-center text-slate-300">
          <span className="text-[0.5rem] lg:text-[9px] font-bold uppercase tracking-wider">
            Enregistré le :
          </span>
          <p className="ml-3 px-2 py-0.5 rounded font-mono text-[0.5em] lg:text-[11px] font-bold text-pink-300 bg-pink-500/15 border border-pink-400/30">
            {activeTrack.dateCreated}
          </p>

              <div className="flex items-center text-slate-300 ml-5">
              <span className="text-[0.5rem] lg:text-[9px] font-bold uppercase tracking-wider">
                Durée :
              </span>
              <p className="ml-3 font-mono text-[0.5em] lg:text-[11px] font-bold text-slate-100">
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
              ? 'text-white bg-gradient-to-tr from-pink-500 to-indigo-500 animate-pulse ring-2 ring-purple-400/40'
              : 'text-slate-200 bg-white/10 border border-white/20'
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
              <p className="text-slate-300 font-medium">Aucun résultat pour « {searchQuery} »</p>
            </div>
          )}
        </ScrollSectionnal>

        {/* <ScrollSectionnalMobile title="Mon playlist"> 
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
              <p className="text-slate-300 font-medium">Aucun résultat pour « {searchQuery} »</p>
            </div>
          )}
        </ScrollSectionnalMobile> */}
  
        <LecteurSon
          title={activeTrack.title}
          duration={activeTrack.duration}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          url='/'
        />
      </ContentMain>
    </div>
  )
}
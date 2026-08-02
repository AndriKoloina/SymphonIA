'use client'

import React, { useState, useMemo, useEffect, useRef } from "react"
import { generateKeys } from "@/hooks/pianoNote"
import PlayButton from "./playButton"
import PianoWaterFall from "@/hooks/pianoWaterFall"
import { useMusicSimulation } from "@/types/simulationTest"
import { usePianoRealAudio } from "@/hooks/usePianoRealAudio"

export default function PianoBase() {
  const allKeys = useMemo(() => generateKeys(), [])
  const [isPlaying, setIsPlaying] = useState(false)
  const { fallingNotes, activePianoNotes, startSimulation, stopSimulation } = useMusicSimulation(allKeys)
  const { playNote, isReady } = usePianoRealAudio()
  
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const previousActiveRef = useRef<string[]>([])

  const whiteKeyWidth = 22
  const blackKeyWidth = 18
  const whiteKeys = useMemo(() => allKeys.filter(k => !k.isBlack), [allKeys])
  const totalPianoWidth = whiteKeys.length * whiteKeyWidth

  // Déclenchement du son au moment précis de l'impact sans modifier l'UI du piano
  useEffect(() => {
    activePianoNotes.forEach(noteId => {
      if (!previousActiveRef.current.includes(noteId)) {
        playNote(noteId)
      }
    })
    previousActiveRef.current = activePianoNotes
  }, [activePianoNotes, playNote])

  const handleTogglePlay = () => {
    if (!isPlaying) {
      startSimulation()
    } else {
      stopSimulation()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full">
      
      {/* Bouton de contrôle */}
      <div className="fixed mb-[40%] right-4 z-50 flex flex-col items-end">
        <PlayButton 
          isPlaying={isPlaying} 
          onToggle={handleTogglePlay} 
          label="SymphonIA" 
        />
        {!isReady && (
          <span className="text-[10px] text-amber-400 bg-slate-900/80 px-2 py-1 rounded mt-1 border border-amber-400/30">
            Chargement audio...
          </span>
        )}
      </div>

      {/* Waterfall */}
      <div className="w-full flex justify-center mb-1 overflow-hidden">
        <PianoWaterFall 
          activeNotes={fallingNotes} 
          totalWidth={totalPianoWidth} 
        />
      </div>

      {/* Piano (Structure et styles neutres d'origine, totalement fixe) */}
      <div className="inline-block bg-[#0F172A] p-2 rounded-t-lg rounded-b-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border-t-8 border-[#1e293b]">
        <div className="mb-2 text-center">
          <span className="text-[9px] text-white/20 tracking-[0.5em] uppercase font-bold italic">
            SymphonIA Piano
          </span>
        </div>

        <div 
          ref={scrollContainerRef}
          className="max-w-[95vw] overflow-x-auto custom-scrollbar rounded-b-xl"
        >
          <div 
            className="relative flex bg-black p-[1px] select-none" 
            style={{ width: `${totalPianoWidth}px` }}
          >
            {/* TOUCHES BLANCHES (Style neutre d'origine - Sans changement de couleur ni déplacement) */}
            <div className="flex">
              {whiteKeys.map((k, i) => {
                const noteId = `${k.note}${k.octave}`
                const isNoteActive = activePianoNotes.includes(noteId)

                return (
                  <div
                    key={`white-${noteId}-${i}`}
                    style={{ width: `${whiteKeyWidth}px` }}
                    onClick={() => playNote(noteId)}
                    className={`h-48 border-[0.5px] border-gray-400/30 rounded-b-lg transition-opacity duration-75 cursor-pointer relative
                      ${isNoteActive 
                        ? 'bg-gradient-to-b from-gray-200 via-gray-100 to-gray-300 shadow-inner'
                        : 'bg-gradient-to-b from-gray-100 via-white to-gray-200'              
                      }`}
                  >
                    {k.note === 'C' && (
                      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[7px] font-black text-gray-400">
                        C{k.octave}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* TOUCHES NOIRES (Style neutre d'origine - Sans changement de couleur ni déplacement) */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {allKeys.map((k, i) => {
                if (!k.isBlack) return null
                const whiteBefore = allKeys.slice(0, i).filter(key => !key.isBlack).length
                const leftPos = (whiteBefore * whiteKeyWidth) - (blackKeyWidth / 2)
                const noteId = `${k.note}${k.octave}`
                const isNoteActive = activePianoNotes.includes(noteId)

                return (
                  <div
                    key={`black-${noteId}-${i}`}
                    style={{ 
                      left: `${leftPos}px`, 
                      width: `${blackKeyWidth}px` 
                    }}
                    onClick={() => playNote(noteId)}
                    className={`absolute top-0 h-28 border-x border-b border-black/40 rounded-b-md z-10 pointer-events-auto cursor-pointer transition-opacity duration-75
                      ${isNoteActive 
                        ? 'bg-gradient-to-b from-[#0F172A] to-[#020617] opacity-90' 
                        : 'bg-gradient-to-b from-[#1E293B] to-[#020617]'                  
                      }`}
                  />
                )
              })}
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  )
}
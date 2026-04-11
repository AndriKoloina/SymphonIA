'use client'
import { generateKeys } from "@/hooks/pianoNote"
import PlayButton from "./playButton"
import { useState } from "react"
import PianoWaterFall from "@/hooks/pianoWaterFall"
import { useMusicSimulation } from "@/types/simulationTest"

export default function PianoBase() {
  const allKeys = generateKeys()
  const [isPlaying, setIsPlaying] = useState(false)
  const {activeNotes, startSimulation, stopSimulation} = useMusicSimulation(allKeys)

  const whiteKeyWidth = 22
  const blackKeyWidth = 18

  const whiteKeysCount = allKeys.filter(k => !k.isBlack).length
  const totalPianoWidth = whiteKeysCount * whiteKeyWidth

  const handleTogglePlay = () => {
    if (!isPlaying) {
      startSimulation()
    } else {
      stopSimulation()
    }
    setIsPlaying(!isPlaying)
  }

    return (
    <div className="flex flex-col items-center justify-center p-4">

      <div className="fixed -top-1 -right-4 z-50">
          <PlayButton 
            isPlaying={isPlaying} 
            onToggle={handleTogglePlay} 
            label="SymphonIA" 
          />
        </div>
         <PianoWaterFall activeNotes={activeNotes} totalWidth={totalPianoWidth} width={blackKeyWidth} />

      <div className="inline-block bg-[#0F172A] p-2 rounded-t-lg rounded-b-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border-t-8 border-[#1e293b]">
       
        <div className="mb-2 text-center">
            <span className="text-[9px] text-white/20 tracking-[0.5em] uppercase font-bold italic">
                SymphonIA Piano
            </span>
        </div>
        <div className="max-w-[90vw] overflow-x-hidden custom-scrollbar rounded-b-xl">
          
          <div className="relative flex bg-black p-[1px] select-none" 
               style={{ width: `${allKeys.filter(k => !k.isBlack).length * whiteKeyWidth}px` }}>

            <div className="flex">
              {allKeys.filter(k => !k.isBlack).map((k, i) => (
                <div
                  key={`white-${k.note}-${k.octave}-${i}`}
                  style={{ width: `${whiteKeyWidth}px` }}
                  className="h-50 bg-gradient-to-b from-gray-200 via-white to-gray-100 border-[0.5px] border-gray-400/50 
                             rounded-b-lg active:from-purple-100 active:to-purple-300 transition-all cursor-pointer relative"
                >
                  {k.note === 'C' && (
                    <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[8px] font-black text-gray-400">
                      C{k.octave}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {allKeys.map((k, i) => {
                if (!k.isBlack) return null;
                
                const whiteBefore = allKeys.slice(0, i).filter(key => !key.isBlack).length;
                const leftPos = (whiteBefore * whiteKeyWidth) - (blackKeyWidth / 2);

                return (
                  <div
                    key={`black-${k.note}-${k.octave}-${i}`}
                    style={{ 
                        left: `${leftPos}px`, 
                        width: `${blackKeyWidth}px` 
                    }}
                    className="absolute top-0 h-30 bg-gradient-to-b from-[#1E293B] to-[#020617] border-x border-b border-white/5 
                               rounded-b-md z-10 pointer-events-auto cursor-pointer
                               hover:from-purple-900 hover:to-black active:from-purple-600 shadow-[2px_5px_10px_rgba(0,0,0,0.5)]"
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
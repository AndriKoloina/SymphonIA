'use client'

import React from 'react'
import FallingNote from '@/hooks/pianoNote'

interface PianoWaterFallProps {
  activeNotes: any[]
  totalWidth: number
}

export default function PianoWaterFall({ activeNotes, totalWidth }: PianoWaterFallProps) {
  return (
    <div 
      className="relative overflow-hidden h-48 bg-slate-950/60 rounded-t-xl border-b border-slate-800"
      style={{ width: `${totalWidth}px` }}
    >
      {activeNotes.map((note) => (
        <FallingNote 
          key={note.id} 
          leftPosition={note.leftPosition} 
          width={note.width || 22} 
          duration={note.duration || 3} 
          color={note.color}
        />
      ))}
    </div>
  )
}
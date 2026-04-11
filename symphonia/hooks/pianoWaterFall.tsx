'use client'
import FallingNote from "./pianoNote" 

export default function PianoWaterFall({ activeNotes, totalWidth, width }: { activeNotes: any[], totalWidth: number, width?:number }) {
  return (
    <div 
      className="relative h-64 overflow-hidden bg-gradient-to-t from-[#0F172A] to-transparent rounded-t-xl mx-auto"
      style={{ width: `${totalWidth}px` }}
    >
   
      <div className="absolute bottom-0 w-full h-[2px] bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]" />

      {activeNotes.map((note) => (
        <FallingNote 
          key={note.id} 
          lane={note.lane} 
          duration={3}
          width={width}
        />
      ))}
    </div>
  )
}
  
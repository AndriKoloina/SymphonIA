import React from 'react'

export const octave_structure = [
  { note: 'C', isBlack: false },
  { note: 'C#', isBlack: true },
  { note: 'D', isBlack: false },
  { note: 'D#', isBlack: true },
  { note: 'E', isBlack: false },
  { note: 'F', isBlack: false },
  { note: 'F#', isBlack: true },
  { note: 'G', isBlack: false },
  { note: 'G#', isBlack: true },
  { note: 'A', isBlack: false },
  { note: 'A#', isBlack: true },
  { note: 'B', isBlack: false },
]

export const generateKeys = () => {
  const keys = []
  keys.push({ note: 'A', octave: 0, isBlack: false })
  keys.push({ note: 'A#', octave: 0, isBlack: true })
  keys.push({ note: 'B', octave: 0, isBlack: false })

  for (let oct = 1; oct <= 7; oct++) {
    octave_structure.forEach(s => {
      keys.push({ ...s, octave: oct })
    })
  }
  keys.push({ note: 'C', octave: 8, isBlack: false })
  return keys
}

interface FallingNoteProps {
  leftPosition?: number
  duration?: number
  width?: number
  color?: string
}

export default function FallingNote({ 
  leftPosition = 0, 
  duration = 2, 
  width = 22,
  color
}: FallingNoteProps) {
  return (
    <>
      <style>{`
        @keyframes fallToKey {
          0% { 
            transform: translateY(-80px);
            opacity: 0.9;
          }
          100% { 
            transform: translateY(192px); /* Hauteur exacte du container Waterfall (h-48 = 192px) */
            opacity: 1;
          }
        }

        .falling-piano-note {
          position: absolute;
          top: 0;
          height: 50px;
          border-radius: 4px;
          will-change: transform;
        }
      `}</style>

      <div 
        className="falling-piano-note" 
        style={{ 
          left: `${leftPosition}px`, 
          width: `${width}px`,
          background: color || 'linear-gradient(180deg, #6366F1, #A855F7)',
          animation: `fallToKey ${duration}s linear forwards`
        }} 
      />
    </>
  )
}
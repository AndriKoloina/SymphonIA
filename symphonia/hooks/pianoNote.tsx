export const octave_structure = [
    {
        note: 'C',
        isBlack: false
    },
    {
        note: 'C#',
        isBlack: true
    },
    {
        note: 'D',
        isBlack: false
    },
    {
        note: 'D#',
        isBlack: true
    },
    {
        note: 'E',
        isBlack: false
    },
    {
        note: 'F',
        isBlack: false
    },
    {
        note: 'F#',
        isBlack: true
    },
    {
        note: 'G',
        isBlack: false
    },
    {
        note: 'G#',
        isBlack: true
    },
    {
        note: 'A',
        isBlack: false
    },
    {
        note: 'A#',
        isBlack: true
    },
    {
        note: 'B',
        isBlack: false
    },
]

export const generateKeys = () => {
    const keys = []
    keys.push({note: 'A', octave: 0, isBlack: false})
    keys.push({note: 'A#', octave: 0, isBlack: true})
    keys.push({note: 'B', octave: 0, isBlack: false})

    for (let oct = 1; oct <= 7; oct++) {
        octave_structure.forEach(s => {
            keys.push({...s, octave: oct})
        })
    }
    keys.push({note: 'C', octave: 8, isBlack: false})
    return keys
}

export default function FallingNote({ lane, duration = 1, width }: { lane: number, duration?: number, width?: number }) {
  return (
    <>
      <style>{`
        @keyframes fall {
          0% { 
            transform: translateY(-200px); 
            opacity: 0.8; 
          }
          90% { 
            opacity: 1; 
          }
          100% { 
            transform: translateY(600px);
            opacity: 0.5;
            filter: brightness(1.5);
          }
        }

        .piano-note {
          position: absolute;
          width: 40px;
          height: 80px;
          background: linear-gradient(180deg, #FF0098, #10b981);
          border-radius: 4px;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
          animation: fall ${duration}s linear forwards;
        }
      `}</style>

      <div 
        className="piano-note" 
        style={{ left: `${lane * 22}px`, width: width }} 
      />
    </>
  )
}
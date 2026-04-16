import { octave_structure } from '@/hooks/pianoNote';
import React, { useState } from 'react';


interface PlacedNote {
  x: number;
  y: number;
}

export default function PianoEditor() {
  // État des notes placées dans la grille
  const [placedNotes, setPlacedNotes] = useState<PlacedNote[]>([]);

  const toggleNote = (x: number, y: number) => {
    // Logique de sélection/désélection visuelle uniquement
    const exists = placedNotes.find(n => n.x === x && n.y === y);
    if (exists) {
      setPlacedNotes(placedNotes.filter(n => n.x !== x || n.y !== y));
    } else {
      setPlacedNotes([...placedNotes, { x, y }]);
    }
  };

  return (
    <div className="w-full h-full flex select-none">
        
      {/* 1. LE CLAVIER (Utilisant octave_structure importée) */}
      <div className="w-16 flex flex-col border-r border-slate-800 bg-[#1e1e2e] shrink-0">
        {octave_structure.map((item, index) => (
          <div 
            key={`${item.note}-${index}`} 
            className={`flex-1 flex items-center justify-end pr-2 text-[10px] font-bold border-b border-slate-800/50
              ${item.isBlack ? 'bg-black text-gray-500' : 'bg-white text-gray-800'}`}
          >
            {item.note}
          </div>
        ))}
      </div>

      {/* 2. LA GRILLE (Séquenceur interactif) */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full min-w-[1000px]">
          {Array.from({ length: 32 }).map((_, x: number) => (
            <div key={x} className="flex-1 flex flex-col border-r border-slate-800/40 p-[2px]">
              {octave_structure.map((item, y: number) => {
                const isSelected = placedNotes.some(n => n.x === x && n.y === y);
                return (
                  <div 
                    key={`${x}-${y}`}
                    onClick={() => toggleNote(x, y)}
                    className={`flex-1 border-b border-slate-800/20 rounded-sm cursor-pointer transition-colors 
                      ${isSelected 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.4)]' 
                        : 'hover:bg-white/5'}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
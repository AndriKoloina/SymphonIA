"use client";
import React from 'react';

// 1. On définit la structure d'une note
interface PlacedNote {
  x: number;
  y: number;
}

// 2. On définit ce que le composant attend de la part du parent (StudioPage)
interface PianoEditorProps {
  placedNotes: PlacedNote[];
  setPlacedNotes: React.Dispatch<React.SetStateAction<PlacedNote[]>>;
  octave_structure: { note: string; isBlack: boolean }[];
}

export default function PianoEditor({ 
  placedNotes, 
  setPlacedNotes, 
  octave_structure 
}: PianoEditorProps) {

  // Cette fonction modifie maintenant l'état du PARENT
  const toggleNote = (x: number, y: number) => {
    const exists = placedNotes.find(n => n.x === x && n.y === y);
    if (exists) {
      // Si elle existe, on filtre le tableau du parent pour l'enlever
      setPlacedNotes(placedNotes.filter(n => n.x !== x || n.y !== y));
    } else {
      // Sinon, on l'ajoute au tableau du parent
      setPlacedNotes([...placedNotes, { x, y }]);
    }
  };

  return (
    <div className="w-full h-full flex select-none bg-[#1a1a2e]">
      
      {/* CLAVIER GAUCHE (Touches fixes) */}
      <div className="w-16 flex flex-col border-r border-slate-800 bg-[#1e1e2e] shrink-0 shadow-xl z-10">
        {octave_structure.map((item, index) => (
          <div 
            key={`${item.note}-${index}`} 
            className={`flex-1 flex items-center justify-end pr-2 text-[10px] font-bold border-b border-slate-700/50
              ${item.isBlack ? 'bg-black text-slate-300' : 'bg-white text-slate-700'}`}
          >
            {item.note}
          </div>
        ))}
      </div>

      {/* GRILLE DE NOTES (Scrollable horizontalement) */}
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <div className="flex h-full min-w-[1200px]">
          {/* On crée 32 colonnes pour la timeline */}
          {Array.from({ length: 32 }).map((_, x: number) => (
            <div key={x} className="flex-1 flex flex-col border-r border-slate-800/30">
              {octave_structure.map((_, y: number) => {
                // Vérification si la note est présente dans l'état du parent
                const isSelected = placedNotes.some(n => n.x === x && n.y === y);
                
                return (
                  <div 
                    key={`${x}-${y}`}
                    onClick={() => toggleNote(x, y)}
                    className={`flex-1 border-b border-slate-800/10 cursor-pointer transition-all
                      ${isSelected 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] z-20 mx-[1px] rounded-sm' 
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
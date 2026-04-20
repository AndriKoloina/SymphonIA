"use client";
import React, { useState } from "react";

// props pour recevoir le state du parent (StudioPage)
interface GuitarEditorProps {
  placedNotes: { x: number; y: number }[];
  setPlacedNotes: React.Dispatch<React.SetStateAction<{ x: number; y: number }[]>>;
}

export default function GuitarEditor({ placedNotes, setPlacedNotes }: GuitarEditorProps) {
  const STRINGS_DATA = [
    { label: "E", root: 64 }, // Mi aigu (MIDI)
    { label: "B", root: 59 },
    { label: "G", root: 55 },
    { label: "D", root: 50 },
    { label: "A", root: 45 },
    { label: "E", root: 40 }, // Mi grave (MIDI)
  ];

  const fretCount = 14;
  const [activeNote, setActiveNote] = useState<{ s: number; f: number } | null>(null);

  const handlePress = (sIdx: number, fIdx: number) => {
    // 1. Calcul de la note MIDI (Fréquence)
    // La note est la racine de la corde + le numéro de la frette
    const midiNote = STRINGS_DATA[sIdx].root + fIdx;

    // 2. Enregistrement dans le Studio (on utilise x=0 pour l'instant ou un index de temps)
    const newNote = { x: Date.now(), y: midiNote };
    setPlacedNotes([...placedNotes, newNote]);

    // 3. Animation visuelle
    setActiveNote({ s: sIdx, f: fIdx });
    setTimeout(() => setActiveNote(null), 150);
    
    console.log(`Note enregistrée : ${midiNote} (Corde ${STRINGS_DATA[sIdx].label}, Frette ${fIdx})`);
  };

  return (
    <div className="w-full h-full flex items-stretch select-none p-1 font-sans bg-[#1a1a2e]">
      
      {/* 1. NOMS DES CORDES */}
      <div className="flex flex-col w-12 mr-2 py-2">
        {STRINGS_DATA.map((string, i) => (
          <div key={`name-${i}`} className="flex-1 flex items-center justify-center">
            <div className={`w-7 h-7 flex items-center justify-center rounded-full border transition-all duration-200 ${
              activeNote?.s === i
                ? "border-pink-500 bg-pink-500/20 scale-110 text-white shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                : "border-yellow-500/40 bg-yellow-500/5 text-yellow-500"
            } text-[10px] font-bold`}>
              {string.label}
            </div>
          </div>
        ))}
      </div>

      {/* 2. LE MANCHE DE GUITARE */}
      <div className="relative flex-grow rounded-xl border border-slate-700/50 overflow-hidden shadow-2xl"
           style={{ background: 'linear-gradient(135deg, #1e1e2e 0%, #161625 100%)' }}>
        
        {/* Frettes */}
        <div className="absolute inset-0 flex justify-between pointer-events-none">
          {[...Array(fretCount + 1)].map((_, i) => (
            <div key={`fret-${i}`} className="w-[1px] h-full bg-slate-700/50 relative" />
          ))}
        </div>

        {/* Cordes visuelles */}
        <div className="absolute inset-0 flex flex-col py-2 pointer-events-none">
          {STRINGS_DATA.map((_, i) => {
            const isActive = activeNote?.s === i;
            return (
              <div key={`string-line-${i}`} className="flex-1 flex items-center relative">
                <div 
                  className={`w-full transition-all duration-75 ${
                    isActive ? 'brightness-200 scale-y-150 shadow-[0_0_15px_#ec4899]' : 'opacity-60'
                  }`}
                  style={{ 
                    height: `${0.8 + i * 0.5}px`, 
                    background: isActive 
                      ? 'linear-gradient(to right, #fdf2f8, #ec4899, #fdf2f8)' 
                      : 'linear-gradient(to bottom, #d1d5db, #4b5563, #1f2937)' 
                  }} 
                />
              </div>
            );
          })}
        </div>

        {/* Grille d'interaction */}
        <div className="absolute inset-0 flex flex-col py-2">
          {STRINGS_DATA.map((_, sIdx) => (
            <div key={`string-row-${sIdx}`} className="flex-1 flex">
              {[...Array(fretCount)].map((_, fIdx) => (
                <div
                  key={`cell-${sIdx}-${fIdx}`}
                  className="flex-1 cursor-pointer hover:bg-white/[0.03] active:bg-white/[0.08] relative"
                  onMouseDown={() => handlePress(sIdx, fIdx)}
                >
                  {activeNote?.s === sIdx && activeNote?.f === fIdx && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-6 h-6 bg-pink-500/30 rounded-full animate-ping absolute" />
                      <div className="w-3 h-3 bg-pink-400 rounded-full shadow-[0_0_15px_#ec4899] z-20" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
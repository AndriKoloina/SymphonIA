import React, { useState } from "react";

export default function GuitarEditor() {
  const STRINGS_DATA = [
    { label: "E", root: "E4" }, 
    { label: "B", root: "B3" },
    { label: "G", root: "G3" },
    { label: "D", root: "D3" },
    { label: "A", root: "A2" },
    { label: "E", root: "E2" }, 
  ];

  const fretCount = 14;
  const [activeNote, setActiveNote] = useState<{ s: number; f: number } | null>(null);

  const handlePress = (sIdx: number, fIdx: number) => {

    console.log(`Note cliquée : Corde ${STRINGS_DATA[sIdx].label}, Frette ${fIdx}`);

    // Déclenchement de l'animation visuelle
    setActiveNote({ s: sIdx, f: fIdx });
    setTimeout(() => setActiveNote(null), 150);
  };

  return (
    <div className="w-full h-full flex items-stretch select-none p-1 font-sans">
      
      {/* 1. NOMS DES CORDES (GAUCHE) */}
      <div className="flex flex-col w-12 mr-2 py-4">
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
        
        {/* Effet de profondeur */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.5)]" />

        {/* Grille de fond subtile */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ 
               backgroundImage: `radial-gradient(#818cf8 0.5px, transparent 0.5px)`,
               backgroundSize: '24px 24px' 
             }} />

        {/* Ligne de lumière supérieure */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-slate-500/20 to-transparent" />

        {/* Frettes (Lignes Verticales) */}
        <div className="absolute inset-0 flex justify-between pointer-events-none">
          {[...Array(fretCount + 1)].map((_, i) => (
            <div key={`fret-${i}`} className="w-[1px] h-full bg-slate-700/50 relative">
               <div className="absolute inset-0 w-[1px] bg-indigo-400/10 ml-[1px]" />
            </div>
          ))}
        </div>

        {/* Cordes (Visuel avec effet néon au clic) */}
        <div className="absolute inset-0 flex flex-col py-4 pointer-events-none">
          {STRINGS_DATA.map((_, i) => {
            const isActive = activeNote?.s === i;
            return (
              <div key={`string-line-${i}`} className="flex-1 flex items-center relative">
                <div 
                  className={`w-full transition-all duration-75 ${
                    isActive 
                      ? 'brightness-200 scale-y-150 shadow-[0_0_15px_rgba(255,255,255,0.8),0_0_20px_#ec4899]' 
                      : 'opacity-60'
                  }`}
                  style={{ 
                    height: `${0.8 + i * 0.5}px`, 
                    background: isActive 
                      ? 'linear-gradient(to right, #fdf2f8, #ec4899, #fdf2f8)' 
                      : 'linear-gradient(to bottom, #d1d5db, #4b5563, #1f2937)' 
                  }} 
                />
                {isActive && (
                  <div className="absolute w-full bg-pink-400/30 animate-pulse"
                       style={{ height: `${2 + i}px`, filter: 'blur(4px)' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* GRILLE D'INTERACTION */}
        <div className="absolute inset-0 flex flex-col py-4">
          {STRINGS_DATA.map((_, sIdx) => (
            <div key={`string-row-${sIdx}`} className="flex-1 flex">
              {[...Array(fretCount)].map((_, fIdx) => (
                <div
                  key={`cell-${sIdx}-${fIdx}`}
                  className="flex-1 cursor-pointer hover:bg-white/[0.03] active:bg-white/[0.08] relative transition-colors"
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

        <canvas className="absolute inset-0 pointer-events-none z-10" id="guitar-visualizer" />
      </div>
    </div>
  );
};


'use client'


export default function PianoMobile() {
  // Piano mobile désactivé pour le moment (implémentation commentée ci-dessous).
  // Retourne null pour garder la page scanner fonctionnelle sur mobile.
  return null;
  //    const allKeys = useMemo(() => generateKeys(), [])
  //   const [isPlaying, setIsPlaying] = useState(false)
  //   const { activeNotes, startSimulation, stopSimulation } = useMusicSimulation(allKeys)
    
  //   const whiteKeyWidth = 8.5
  //   const blackKeyWidth = 6
  //   const whiteKeys = allKeys.filter(k => !k.isBlack)
  //   const totalPianoWidth = whiteKeys.length * whiteKeyWidth

  //   const handleTogglePlay = () => {
   
  // }

  //   return(
  //       <div>
  //           piano mobile
            
  //           <div>
  //               <PlayButton 
  //                   isPlaying={isPlaying}
  //                   onToggle={handleTogglePlay}
  //                   label="SymphonIA"
  //               />
  //           </div>
  //           {/*<Corps du iano mobile*/}
  //           <div className="inline-block bg-[#0F172A] p-2 rounded-t-lg rounded-b-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border-t-8 border-[#1e293b]">
        
  //       {/* Branding */}
  //       <div className="mb-2 text-center">
  //         <span className="text-[9px] text-white/20 tracking-[0.5em] uppercase font-bold italic">
  //           SymphonIA Piano
  //         </span>
  //       </div>

  //       {/* Zone de défilement des touches */}
  //       <div className="ml-5 w-115 overflow-x-auto custom-scrollbar rounded-b-xl scroll-smooth">
  //         <div 
  //           className="relative flex bg-black p-[1px] select-none" 
  //           style={{ width: `${totalPianoWidth}px` }}
  //         >
            
  //           {/* TOUCHES BLANCHES */}
  //           <div className="flex">
  //             {whiteKeys.map((k, i) => {
  //               const noteId = `${k.note}${k.octave}`;
  //               const isNoteActive = activeNotes.includes(noteId);

  //               return (
  //                 <div
  //                   key={`white-${noteId}-${i}`}
  //                   style={{ width: `${whiteKeyWidth}px` }}
  //                   // 3. Changement conditionnel de la classe CSS
  //                   className={`h-48 border-[0.5px] border-gray-400/30 rounded-b-lg transition-all duration-75 cursor-pointer relative
  //                     ${isNoteActive 
  //                       ? 'bg-gradient-to-b from-purple-400 to-purple-600 shadow-[inset_0_0_15px_rgba(255,255,255,0.7)]'
  //                       : 'bg-gradient-to-b from-gray-100 via-white to-gray-200 active:from-purple-100'              
  //                     }`}
  //                 >
  //                   {k.note === 'C' && (
  //                     <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[7px] font-black text-gray-400">
  //                       C{k.octave}
  //                     </span>
  //                   )}
  //                 </div>
  //               )
  //             })}
  //           </div>

           
  //           {/* TOUCHES NOIRES */}
  //           <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
  //             {allKeys.map((k, i) => {
  //               if (!k.isBlack) return null;
  //               const whiteBefore = allKeys.slice(0, i).filter(key => !key.isBlack).length;
  //               const leftPos = (whiteBefore * whiteKeyWidth) - (blackKeyWidth / 2);
  //               const noteId = `${k.note}${k.octave}`;
  //               const isNoteActive = activeNotes.includes(noteId);

  //               return (
  //                 <div
  //                   key={`black-${noteId}-${i}`}
  //                   style={{ 
  //                     left: `${leftPos}px`, 
  //                     width: `${blackKeyWidth}px` 
  //                   }}
                    
  //                   className={`absolute top-0 h-28 border-x border-b border-black/40 rounded-b-md z-10 pointer-events-auto cursor-pointer transition-all duration-75
  //                     ${isNoteActive 
  //                       ? 'bg-gradient-to-b from-purple-600 to-purple-900 shadow-[0_0_15px_rgba(168,85,247,0.7)]' 
  //                       : 'bg-gradient-to-b from-[#1E293B] to-[#020617] hover:from-[#2d3a4f]'                   
  //                     }`}
  //                 />
  //               );
  //             })}
  //           </div>
  //         </div>
  //       </div>
  //     </div>

  //       </div>
  //   )
}
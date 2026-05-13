"use client";
import UserProfile from "@/components/auth/userprofil/page";
import GuitarEditor from "@/components/ui/GuitarEditor";
import PianoEditor from "@/components/ui/PianoEditor";
import SymphoniaSidebar from "@/components/ui/Side-bar-modern";
import { TitlePage } from "@/components/ui/TitlePage";
import { octave_structure } from '@/hooks/pianoNote';
import {
  SparklesIcon,
  PlayIcon,
  StopIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";
export default function StudioPage() {
  const profileData = {
    profilePicture: "/user.png",
    username: "Klwnn",
    email: "koloina@example.com",
  };

  const [activeInstrument, setActiveInstrument] = useState("piano");
  
  const [placedNotes, setPlacedNotes] = useState<{x: number, y: number}[]>([]);

  const handleTrash = () => {
    if (placedNotes.length > 0) {
      setPlacedNotes([]); // Vide les notes
    }
  };

  const handleAction = (message: string) => {
    alert(message);
  };

  const renderEditor = () => {
    switch (activeInstrument) {
      case "piano":
        return <PianoEditor placedNotes={placedNotes} setPlacedNotes={setPlacedNotes} octave_structure={octave_structure} />;
      case "guitar":
        return <GuitarEditor placedNotes={[]} setPlacedNotes={ setPlacedNotes} />;
      default:
        return <PianoEditor placedNotes={placedNotes} setPlacedNotes={setPlacedNotes} octave_structure={octave_structure} />;
    }
  };

  return (

      <div className="flex min-h-screen">
      <SymphoniaSidebar />
      <main className="flex-1 ml-80 mt-4">
        <div className="flex">
          <TitlePage title="Studio" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full h-[476px] p-4">
          <div className="lg:col-span-3 p-4 items-center justify-center ">
            <div className="w-full flex items-center justify-between gap-4">
              {/* Bloc Outils */}
              <div className="bg-[#1e1e2e] border border-slate-700 rounded-xl px-4 py-2 flex items-center gap-6 shadow-lg w-fit">
                <PencilIcon 
                  onClick={() => handleAction("Outil Crayon activé")}
                  className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" 
                />
                <TrashIcon 
                  onClick={handleTrash}
                  className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer transition-colors" 
                />
              </div>

              {/* Bloc Lecture */}
              <div className="bg-[#1e1e2e] border border-slate-700 rounded-xl px-4 py-2 flex items-center gap-6 shadow-lg w-fit">
                <div 
                  onClick={() => handleAction("Enregistrement...")}
                  className="w-3 h-3 bg-gray-400 rounded-full hover:bg-red-500 cursor-pointer"
                ></div>
                <PlayIcon 
                  onClick={() => handleAction("Lecture en cours...")}
                  className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" 
                />
                <StopIcon 
                  onClick={() => handleAction("Arrêt de la lecture")}
                  className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" 
                />
              </div>
            </div>

            <div className="mt-3 w-full h-[370px] bg-[#1e1e2e] border border-slate-700 rounded-xl px-4 py-2 shadow-lg">
              {renderEditor()}
            </div>
          </div>

          <div className="lg:col-span-1 bg-[#1e1e2e] border border-slate-700 rounded-2xl p-6 shadow-xl">
            <h3 className="text-white mb-4">Choisir l'instrument</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setActiveInstrument("piano")}
                className={`p-2 rounded text-white ${activeInstrument === 'piano' ? 'bg-purple-600' : 'bg-slate-800'}`}
              >
                Piano
              </button>
              <button
                onClick={() => setActiveInstrument("guitar")}
                className={`p-2 rounded text-white ${activeInstrument === 'guitar' ? 'bg-purple-600' : 'bg-slate-800'}`}
              >
                Guitare
              </button>
              <button
                onClick={() => setActiveInstrument("drums")}
                className={`p-2 rounded text-white ${activeInstrument === 'drums' ? 'bg-purple-600' : 'bg-slate-800'}`}
              >
                Batterie
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
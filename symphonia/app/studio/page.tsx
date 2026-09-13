"use client";
import UserProfile from "@/components/auth/userprofil/page";
import GuitarEditor from "@/components/ui/GuitarEditor";
import PianoEditor from "@/components/ui/PianoEditor";
import SymphoniaSidebar from "@/components/ui/Side-bar-modern";
import { TitlePage } from "@/components/ui/TitlePage";
import SideMobile from "@/components/ui/mobile/bar_options";
import ContentMain from "@/components/ui/ContentMain";
import { octave_structure } from '@/hooks/pianoNote';
import {
  PlayIcon,
  StopIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";

type Instrument = "piano" | "guitar" | "drums";

export default function StudioPage() {
  const [user] = useState<{ username: string; email: string } | null>(() => {
    try {
      const storedUser = localStorage.getItem('symphonia_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [activeInstrument, setActiveInstrument] = useState<Instrument>("piano");
  const [placedNotes, setPlacedNotes] = useState<{ x: number; y: number }[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const handleTrash = () => {
    if (placedNotes.length > 0) {
      setPlacedNotes([]);
      setStatus("Piste effacée.");
    } else {
      setStatus("La piste est déjà vide.");
    }
  };

  const instruments: { id: Instrument; label: string }[] = [
    { id: "piano", label: "Piano" },
    { id: "guitar", label: "Guitare" },
    { id: "drums", label: "Batterie" },
  ];

  const renderEditor = () => {
    switch (activeInstrument) {
      case "piano":
        return <PianoEditor placedNotes={placedNotes} setPlacedNotes={setPlacedNotes} octave_structure={octave_structure} />;
      case "guitar":
        return <GuitarEditor placedNotes={placedNotes} setPlacedNotes={setPlacedNotes} />;
      case "drums":
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center text-center gap-2 p-8">
            <p className="text-white font-semibold">Éditeur de batterie bientôt disponible.</p>
            <p className="text-sm text-slate-300">En attendant, composez au piano ou à la guitare : les notes sont conservées.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen lg:flex-row">
      <div className="hidden lg:block">
        <SymphoniaSidebar />
      </div>
      <div className="block lg:hidden">
        <SideMobile />
      </div>
      <ContentMain className="mt-4 px-4 sm:px-6 lg:px-8 pb-10">
        <div className="hidden lg:flex justify-between items-center mb-6">
          <TitlePage title="Studio" />
          {user && (
            <UserProfile
              profilePicture="/user.png"
              username={user.username}
              email={user.email}
            />
          )}
        </div>
        <h1 className="text-xs lg:text-lg font-black text-white tracking-tight leading-tight mb-2 lg:mb-4 break-words">Studio de composition</h1>
        <p className="text-sm text-slate-300 mb-4">
          {placedNotes.length} note{placedNotes.length > 1 ? "s" : ""} sur la piste.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full">
          <div className="lg:col-span-3 items-center justify-center">
            <div className="w-full flex flex-wrap items-center justify-between gap-4">
              {/* Bloc Outils */}
              <div className="bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2 flex items-center gap-6 shadow-lg shadow-black/20 w-fit">
                <PencilIcon
                  onClick={() => setStatus("Outil crayon actif : cliquez sur la grille pour placer une note.")}
                  className="w-5 h-5 text-slate-200 hover:text-white cursor-pointer transition-colors"
                />
                <TrashIcon
                  onClick={handleTrash}
                  className="w-6 h-6 text-slate-200 hover:text-red-300 cursor-pointer transition-colors"
                />
              </div>

              {/* Bloc Lecture */}
              <div className="bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2 flex items-center gap-6 shadow-lg shadow-black/20 w-fit">
                <div
                  onClick={() => setStatus("Enregistrement bientôt disponible.")}
                  title="Enregistrer"
                  className="w-3 h-3 bg-slate-300 rounded-full hover:bg-red-400 cursor-pointer transition-colors"
                ></div>
                <PlayIcon
                  onClick={() => setStatus("Lecture bientôt disponible.")}
                  className="w-6 h-6 text-slate-200 hover:text-white cursor-pointer transition-colors"
                />
                <StopIcon
                  onClick={() => setStatus("Lecture arrêtée.")}
                  className="w-6 h-6 text-slate-200 hover:text-white cursor-pointer transition-colors"
                />
              </div>
            </div>

            {status && (
              <p role="status" className="mt-3 text-sm text-slate-200 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                {status}
              </p>
            )}

            <div className="mt-3 w-full h-[370px] bg-[#1e1e2e] border border-white/10 rounded-xl px-4 py-2 shadow-xl shadow-black/30 overflow-hidden">
              {renderEditor()}
            </div>
          </div>

          <div className="lg:col-span-1 bg-white/[0.06] border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/20 h-fit">
            <h3 className="text-white font-semibold mb-4">Choisir l&apos;instrument</h3>
            <div className="flex flex-col gap-2">
              {instruments.map((inst) => (
                <button
                  key={inst.id}
                  onClick={() => {
                    setActiveInstrument(inst.id);
                    setStatus(null);
                  }}
                  className={`p-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeInstrument === inst.id
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-white/5 text-slate-200 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {inst.label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-400">
              Astuce : cliquez sur les cases de la grille pour placer ou retirer des notes.
            </p>
          </div>
        </div>
      </ContentMain>
    </div>
  );
}

"use client";
import UserProfile from "@/components/auth/userprofil/page";
import GuitarEditor from "@/components/ui/GuitarEditor";
import PianoEditor from "@/components/ui/PianoEditor";
import SymphoniaSidebar from "@/components/ui/Side-bar-modern";
import { TitlePage } from "@/components/ui/TitlePage";
import {
  CircleStackIcon,
  PlayCircleIcon,
  SparklesIcon,
  StopIcon,
} from "@heroicons/react/24/outline";
import { ArrowDownCircleIcon, PencilIcon } from "@heroicons/react/24/outline";
import {
  BackspaceIcon,
  HandRaisedIcon,
  PauseCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import {
  ArrowPathIcon,
  PencilSquareIcon,
  PlayIcon,
  PlayPauseIcon,
  StopCircleIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";
export default function StudioPage() {
  const profileData = {
    profilePicture: "/user.png",
    username: "Klwnn",
    email: "koloina@example.com",
  };
  const [activeInstrument, setActiveInstrument] = useState("piano");

  // Fonction pour rendre le bon composant
  const renderEditor = () => {
    switch (activeInstrument) {
      case "piano":
        return <PianoEditor />;
      case "guitar":
        return <GuitarEditor />;
      default:
        return <PianoEditor />;
    }
  };
  return (
    <div className="flex min-h-screen">
      <SymphoniaSidebar />
      <main className="flex-1 ml-80 mt-4">
        <div className="flex">
          <TitlePage title="Studio" />
          <UserProfile
            profilePicture={profileData.profilePicture}
            username={profileData.username}
            email={profileData.email}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4  w-full h-[476px] p-4">
          <div className="lg:col-span-3 p-4 items-center justify-center ">
            {/* Conteneur principal en Flex pour que les blocs ne s'étirent pas */}
            <div className="w-full flex items-center justify-between gap-4">
              {/* Bloc Outils (Reste à gauche par défaut) */}
              <div className="bg-[#1e1e2e] border border-slate-700 rounded-xl px-4 py-2 flex items-center gap-6 shadow-lg w-fit">
                <PencilIcon className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <TrashIcon className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </div>

              {/* Bloc Lecture (Poussé à droite grâce à justify-between) */}
              <div className="bg-[#1e1e2e] border border-slate-700 rounded-xl px-4 py-2 flex items-center gap-6 shadow-lg w-fit">
                <div className="w-3 h-3 bg-gray-400 rounded-full hover:bg-red-500 cursor-pointer"></div>
                <PlayIcon className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                <StopIcon className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>

            <div className="mt-3 w-full h-[370px] bg-[#1e1e2e] border border-slate-700 rounded-xl px-4 py-2 shadow-lg">
              {renderEditor()}
            </div>
          </div>

          <div className="lg:col-span-1 bg-[#1e1e2e] border  border-slate-700 rounded-2xl p-6 shadow-xl  ">
            <h3 className="text-white mb-4">Choisir l'instrument</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setActiveInstrument("piano")}
                className="p-2 bg-slate-800 text-white rounded"
              >
                Piano
              </button>
              <button
                onClick={() => setActiveInstrument("guitar")}
                className="p-2 bg-slate-800 text-white rounded"
              >
                Guitare
              </button>
              <button
                onClick={() => setActiveInstrument("drums")}
                className="p-2 bg-slate-800 text-white rounded"
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

'use client';

import UserProfile from "@/components/auth/userprofil/page"
import SymphoniaSidebar from "@/components/ui/Side-bar-modern"
import StatCard from "@/components/ui/StatCards"
import { TitlePage } from "@/components/ui/TitlePage"
import { title } from "process"
import { 
  DocumentMagnifyingGlassIcon, 
  MusicalNoteIcon, 
  ClockIcon, 
  CpuChipIcon 
} from "@heroicons/react/24/outline";
import StatisticCard from "@/components/ui/StatisticCard";

export default function HomePage() {

  const profileData = {
  profilePicture: "/user.png",
  username: "Klwnn",
  email: "koloina@example.com"
  }

  const cardContainer = [
    {
      id: 1,
      title: "Scans réalisés",
      value: 24,
      icon: DocumentMagnifyingGlassIcon,
      colorClass: "bg-indigo-600"
    },
    {
      id: 2,
      title: "Projets musicaux",
      value: 24,
      icon:MusicalNoteIcon,
      colorClass: "bg-blue-600"
    },
    {
      id: 3,
      title: "Temps d'activité",
      value: `${24} heures`,
      icon: ClockIcon,
      colorClass: "bg-emerald-600" 
    },
    {
      id: 4,
      title: "Instrument",
      value: "Piano",
      icon: CpuChipIcon,
      colorClass: "bg-amber-500"
    }
  ]

  return(
    <div className="flex min-h-screen">
      <SymphoniaSidebar/>
      <main className="flex-1 ml-80 mt-4">
        <div className="flex">
          <TitlePage
          title="accueil"
        />
        <div className="relative flex items-center justify-end  pr-4 bg-[transparent] pl-8 pt-5 mb-2 absolute rounded-2xl shadow-xl border border-white/5">
          <img 
            src="/download 1.png" 
            className="relative  top-[-0.4rem] w-15 h-auto animate-pulse" 
            alt="Status indicator"
          />
        <UserProfile
          profilePicture={profileData.profilePicture}
          username={profileData.username}
          email=  {profileData.email}
        />
        </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cardContainer.map((card) => (
              <StatCard 
                title = {card.title}
                value = {card.value}
                icon = {card.icon}
                colorClass = {card.colorClass}
              />
            ))}
        </div>
        <div  className="top- left-0 mt-4 rounded-xl">
          <h1 className="text-l font-bold mb-4">Fréquence d'utilisation</h1>
          <StatisticCard/>
        </div>
      </main>
      

    </div>
  )
}
'use client';

import { useState } from "react";
import UserProfile from "@/components/auth/userprofil/page"
import SymphoniaSidebar from "@/components/ui/Side-bar-modern"
import StatCard from "@/components/ui/StatCards"
import { TitlePage } from "@/components/ui/TitlePage"
import { 
  DocumentMagnifyingGlassIcon, 
  MusicalNoteIcon, 
  ClockIcon, 
  CpuChipIcon 
} from "@heroicons/react/24/outline";
import StatisticCard from "@/components/ui/StatisticCard";
import SideMobile from "@/components/ui/mobile/bar_options";
import ContentMain from "@/components/ui/ContentMain";
export default function HomePage() {

  const [user] = useState<{ username: string; email: string } | null>(() => {
    try {
      const storedUser = localStorage.getItem('symphonia_user')
      return storedUser ? JSON.parse(storedUser) : null
    } catch {
      return null
    }
  })

  if (!user) return (
  <div className="flex h-screen items-center justify-center bg-[#17083E]">
    <p className="text-white text-xl">Utilisateur non trouvé - Redirection...</p>
  </div>
)

  const profileData = {
  profilePicture: "/user.png",
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
    <div className="flex flex-col min-h-screen lg:flex-row">
      <div className="hidden lg:block">
        <SymphoniaSidebar/>
      </div>
      <div className="block lg:hidden">
        <SideMobile/>
      </div>
      <ContentMain className="mt-4 px-4 sm:px-6 lg:px-8 pb-10 lg:mt-[1%]">
        <div className="hidden lg:flex justify-between items-center mb-6">
          <TitlePage
          title="accueil"
        />
        
        <UserProfile
          profilePicture={profileData.profilePicture}
          username={user.username}
          email={user.email}
        />
        
        </div>
        <h1 className="text-xs lg:text-lg font-black text-white/100 tracking-tight leading-tight mb-2 lg:mb-4 break-words">Tableau de bord</h1>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cardContainer.map((card) => (
              <StatCard 
                key = {card.id}
                title = {card.title}
                value = {card.value}
                icon = {card.icon}
                colorClass = {card.colorClass}
              />
            ))}
        </div>
        <div  className="top- left-0 mt-4 rounded-xl">
          <h1 className="text-xs lg:text-lg font-black text-white/100 tracking-tight leading-tight mb-4 break-words">Fréquence d&apos;utilisation</h1>
          <StatisticCard/>
        </div>
      </ContentMain>
      

    </div>
  )
}
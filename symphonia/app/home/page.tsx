'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter()

  const [user, setUser] = useState<{ username: string; email: string } | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('symphonia_token')
    const storedUser = localStorage.getItem('symphonia_user')

    if(!token || !storedUser) {
      router.push('/auth/login')
    }
    else {
      setUser(JSON.parse(storedUser))
    }
  }, [router])

  if(!user) return null

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
    <div className="flex min-h-screen">
      <SymphoniaSidebar/>
      <main className="flex-1 ml-80 mt-4">
        <div className="flex">
          <TitlePage
          title="accueil"
        />
        
        <UserProfile
          profilePicture={profileData.profilePicture}
          username={user.username}
          email={user.email}
        />
        
        </div>
        <h1 className="text-l font-black text-white/100 tracking-tight leading-tight mb-4 break-words">Tableau de bord</h1>
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
          <h1 className="text-l font-black text-white/100 tracking-tight leading-tight mb-4 break-words">Fréquence d'utilisation</h1>
          <StatisticCard/>
        </div>
      </main>
      

    </div>
  )
}
import UserProfile from "@/components/auth/userprofil/page"
import SymphoniaSidebar from "@/components/ui/Side-bar-modern"
import StatCard from "@/components/ui/StatCards"
import { TitlePage } from "@/components/ui/TitlePage"
import { title } from "process"

export default function HomePage() {

  const profileData = {
  profilePicture: "/profile.jpg",
  username: "Koloina",
  email: "koloina@example.com"
  }

  const cardContainer = [
    {
      id: 1,
      title: "Scans réalisés",
      value: 24,
      icon: "/partition.png",
      colorClass: "bg-indigo-600"
    },
    {
      id: 2,
      title: "Projets musicaux",
      value: 24,
      icon:"/music.png",
      colorClass: "bg-blue-600"
    },
    {
      id: 3,
      title: "Temps d'activité",
      value: `${24} heures`,
      icon: "/clock.png",
      colorClass: "bg-emerald-600" 
    },
    {
      id: 4,
      title: "Instrument",
      value: "Piano",
      icon: "/instrument.png",
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
          username={profileData.username}
          email=  {profileData.email}
        />
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
      </main>
      

    </div>
  )
}
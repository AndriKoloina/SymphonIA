'use client'
import { useEffect, useState } from "react"
import { OptionsMenuMobile } from "@/hooks/menu"
import { usePathname } from "next/navigation"
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation"
import { Cog6ToothIcon, PowerIcon } from '@heroicons/react/24/outline'
import Link from "next/link"
export default function SideMobile() {
    const menuItems = OptionsMenuMobile
    const[hovereId, setHoverId] = useState<number | null>(1)
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    const [user, setUser] = useState<{username: string; email: string} | null>(null)

    useEffect(() => {
      const token = localStorage.getItem('symphonia_token')
      const storedUser = localStorage.getItem('symphonia_user')

      if(!token || !storedUser) {
        router.push('/auth/login')
      }
      else{
        setUser(JSON.parse(storedUser))
      }

    }, [router])

    const navigateTo = () => {
    router.push("/parameter")
}
    const handleLogout = () => {
      router.push("/auth/login")
    }

    const burgerOptions = [
        {
            label:'Paramètres', 
            onclick: navigateTo,
            icon:  Cog6ToothIcon,
            danger:false
        },
        {
            label:'Deconnexion', 
            onclick: handleLogout,
            icon: PowerIcon,
            danger: true
        }
    ]

  return (
    <div className="flex flex-col h-auto">
    <main className="flex-1 p-1 text-white relative">
      <div className="w-full h-auto bg-[#1B2945] rounded-2xl">
        <div className="w-full flex flex-row justify-between items-center p-1">
            <div className="flex flex-col items-center justify-center select-none pointer-events-none opacity-90">
                <div className="relative w-6 h-6 mb-0.5 transition-transform duration-500 hover:rotate-12">
                    <img src="/symphonia-logo.png" className="w-full h-full object-contain" alt="Symphonia Logo" />
                </div>
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/80 italic">
                    Symphon<span className="text-purple-400 font-extrabold drop-shadow-[0_0_5px_rgba(168,85,247,0.4)]">ia</span>
                </span>
                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent mt-0.5"></div>
            </div>
          {/* 2. Au clic, on inverse la valeur de isOpen (true/false) */}
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-700 hover:text-black transition-colors rounded-lg hover:bg-black/5 relative z-50"
          >
            {/* Si le menu est ouvert, on affiche la croix X, sinon les 3 barres */}
            {isOpen ? <XMarkIcon className="w-8 h-8 text-white/50" /> : <Bars3Icon className="w-8 h-8 text-white/50" />}
          </button>
        </div>

        {/* 3. MENU DÉROULANT (S'affiche uniquement si isOpen est true) */}
        {isOpen && (
          <div className="absolute top-15 right-2 w-48 bg-[#1B2945] rounded-xl shadow-2xl p-2 z-40 border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1 ">
                    <div className="flex items-center gap-3 px-3 py-2.5 mb-1 border-b border-white/10">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
                U
              </div>
              <h1 className="text-sm font-medium text-white/95 truncate">{user?.username}</h1>
            </div>
              {burgerOptions.map((option, index) => {
                const Icon = option.icon
                return (
                  <div className="flex flex hover:text-purple-500">
                      <button
                      key={index}
                  onClick={() => {
                    option.onclick()  
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2.5 flex text-xs rounded-lg transition-colors ${
                    option.danger 
                      ? 'text-red-400 hover:bg-red-500/10' 
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                >
                   <Icon className="w-6 hover:text-purple-500"/>
                  <span className="mt-1 ml-2 hover:text-bold">{option.label}</span>
                </button>
                  </div>
                
              )
              })}
            </div>
          </div>
        )}

      </div>
    </main>

    <div 
        className="fixed bottom-0 left-0 right-0 h-20 z-50 filter drop-shadow-[0_-10px_25px_rgba(27,41,69,0.5)]"
      
    >
        <div className="absolute inset-0 bg-[#1B2945]/50 backdrop-blur-md border border-white/20 flex flex-col justify-between items-center pt-10 pb-3 rounded-3xl m-1">
  <div className="flex flex-row items-center justify-around w-4/5 max-w-sm px-4 mt-[-2rem]">
    {menuItems.map((item) => {
      const isActive = pathname === item.path
      const isHighlighted = hovereId === item.id || isActive
      const Icon = item.icon
      
      return (
        /*  CORRECTION ICI : On utilise <Link> à la place de <div> */
        <Link 
          href={item.path}
          key={item.id} 
          className="relative flex flex-col items-center justify-center cursor-pointer group py-2"
          onMouseEnter={() => setHoverId(item.id)}
          onMouseLeave={() => setHoverId(null)}
        >
          {/* Effet de halo lumineux derrière l'icône active */}
          {isActive && (
            <span className="absolute -top-1 w-12 h-12 bg-purple-500/20 rounded-full blur-md animate-pulse" />
          )}

          <Icon 
            className={`w-7 h-7 transition-all duration-300 relative z-10 ${
              isActive 
                ? 'scale-110 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]' 
                : isHighlighted
                ? 'text-white scale-105'
                : 'text-gray-400'
            }`}
          />

          {/* Petite barre indicatrice sous l'icône active */}
          <span className={`absolute bottom-0 h-[3px] bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-300 ${
            isActive ? 'w-5' : 'w-0 group-hover:w-3'
          }`} />
        </Link>
      )
    })}
  </div>
</div>
    </div>
</div>
  )
}
'use client'

import type { ReactNode } from "react"
import { useSidebar } from "@/components/ui/SidebarContext"

interface ContentMainProps {
  children: ReactNode
  className?: string
}

// Conteneur principal : sa marge gauche suit l'état replié / déplié du sidebar desktop.
// Sur mobile (sidebar caché), aucune marge.
export default function ContentMain({ children, className = "" }: ContentMainProps) {
  const { collapsed } = useSidebar()
  return (
    <main className={`flex-1 ml-0 ${collapsed ? "lg:ml-28" : "lg:ml-80"} transition-all duration-300 ${className}`}>
      {children}
    </main>
  )
}

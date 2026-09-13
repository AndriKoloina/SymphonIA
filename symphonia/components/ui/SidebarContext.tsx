'use client'

import { createContext, useCallback, useContext, useState } from "react"
import type { ReactNode } from "react"

interface SidebarState {
  collapsed: boolean
  toggle: () => void
}

const SidebarContext = createContext<SidebarState>({ collapsed: false, toggle: () => {} })

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const toggle = useCallback(() => setCollapsed((prev) => !prev), [])
  return <SidebarContext.Provider value={{ collapsed, toggle }}>{children}</SidebarContext.Provider>
}

export function useSidebar(): SidebarState {
  return useContext(SidebarContext)
}

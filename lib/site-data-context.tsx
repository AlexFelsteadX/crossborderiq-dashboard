"use client"

import { createContext, useContext, ReactNode } from "react"

interface SiteDataContextValue {
  lastUpdated: string | null
}

const SiteDataContext = createContext<SiteDataContextValue>({ lastUpdated: null })

export function SiteDataProvider({ 
  children, 
  lastUpdated 
}: { 
  children: ReactNode
  lastUpdated: string | null 
}) {
  return (
    <SiteDataContext.Provider value={{ lastUpdated }}>
      {children}
    </SiteDataContext.Provider>
  )
}

export function useSiteData() {
  return useContext(SiteDataContext)
}

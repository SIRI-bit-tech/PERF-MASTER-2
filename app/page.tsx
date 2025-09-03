"use client"

import { useState, useEffect } from "react"
import { ParticleBackground } from "@/components/particle-background"
import { LoadingScreen } from "@/components/loading-screen"
import { PerformanceDashboard } from "@/components/performance-dashboard"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      <ParticleBackground />
      <PerformanceDashboard />
    </div>
  )
}

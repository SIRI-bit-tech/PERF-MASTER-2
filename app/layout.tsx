import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Navigation } from "@/components/navigation"
import { SessionProvider } from "@/components/providers/session-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "PerfMaster - AI-Powered Performance Analyzer",
  description: "Real-time performance monitoring and optimization for React applications",
  generator: "PerfMaster",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <SessionProvider>
          <Navigation />
          <Suspense fallback={null}>{children}</Suspense>
          <Analytics />
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
}
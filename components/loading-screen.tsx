"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function LoadingScreen() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 bg-[#0b0909] flex items-center justify-center z-50">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-[#6b81b7] mb-2">PerfMaster</h1>
          <p className="text-[#747880]">AI-Powered Performance Analyzer</p>
        </motion.div>

        {/* Audio Equalizer Animation */}
        <div className="flex items-end justify-center space-x-1 mb-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="bg-[#6b81b7] w-2 rounded-t"
              animate={{
                height: [10, Math.random() * 40 + 20, 10],
              }}
              transition={{
                duration: 0.8,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#6b81b7] to-[#8b9dc3]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <p className="text-[#747880] mt-4 text-sm">
          Initializing performance analysis engine... {Math.round(progress)}%
        </p>
      </div>
    </div>
  )
}

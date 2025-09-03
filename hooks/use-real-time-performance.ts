"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { apiClient, type PerformanceMetrics } from "@/lib/api"

interface RealTimeData {
  metrics: PerformanceMetrics
  timestamp: string
  alerts: Array<{
    type: string
    severity: "low" | "medium" | "high"
    message: string
  }>
}

export function useRealTimePerformance(projectId: string) {
  const [data, setData] = useState<RealTimeData | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  const connect = useCallback(() => {
    try {
      const ws = apiClient.createWebSocketConnection(projectId)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
        setError(null)
        console.log("[v0] WebSocket connected")
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          console.log("[v0] Received real-time data:", message)

          if (message.type === "performance_update") {
            setData({
              metrics: message.data.metrics,
              timestamp: message.data.timestamp,
              alerts: message.data.alerts || [],
            })
          }
        } catch (err) {
          console.error("[v0] Failed to parse WebSocket message:", err)
        }
      }

      ws.onclose = (event) => {
        setConnected(false)
        console.log("[v0] WebSocket disconnected:", event.code, event.reason)

        // Attempt to reconnect after 3 seconds
        if (!event.wasClean) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("[v0] Attempting to reconnect...")
            connect()
          }, 3000)
        }
      }

      ws.onerror = (error) => {
        setError("WebSocket connection error")
        console.error("[v0] WebSocket error:", error)
      }
    } catch (err) {
      setError("Failed to establish WebSocket connection")
      console.error("[v0] WebSocket setup error:", err)
    }
  }, [projectId])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    if (wsRef.current) {
      wsRef.current.close(1000, "Manual disconnect")
      wsRef.current = null
    }

    setConnected(false)
  }, [])

  const sendMetrics = useCallback((metrics: PerformanceMetrics) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "performance_metrics",
          data: metrics,
        }),
      )
    }
  }, [])

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    data,
    connected,
    error,
    sendMetrics,
    reconnect: connect,
    disconnect,
  }
}

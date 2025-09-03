"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRealTimePerformance } from "@/hooks/use-real-time-performance"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { AlertTriangle, Wifi, WifiOff, Zap, MemoryStick, HardDrive, Cpu } from "lucide-react"

interface RealTimePerformanceMonitorProps {
  projectId: string
}

export function RealTimePerformanceMonitor({ projectId }: RealTimePerformanceMonitorProps) {
  const { data, connected, error, sendMetrics, reconnect } = useRealTimePerformance(projectId)
  const [metricsHistory, setMetricsHistory] = useState<Array<any>>([])
  const [alerts, setAlerts] = useState<Array<any>>([])

  useEffect(() => {
    if (data?.metrics) {
      const timestamp = new Date().toLocaleTimeString()
      const newMetric = {
        timestamp,
        renderTime: data.metrics.render_time,
        memoryUsage: data.metrics.memory_usage,
        cpuUsage: data.metrics.cpu_usage,
        bundleSize: data.metrics.bundle_size,
      }

      setMetricsHistory((prev) => {
        const updated = [...prev, newMetric]
        return updated.slice(-20) // Keep last 20 data points
      })
    }

    if (data?.alerts) {
      setAlerts((prev) => [...data.alerts, ...prev].slice(0, 10)) // Keep last 10 alerts
    }
  }, [data])

  useEffect(() => {
    if (!connected) return

    const interval = setInterval(() => {
      const simulatedMetrics = {
        lcp: Math.random() * 3000 + 1000,
        fid: Math.random() * 100 + 50,
        cls: Math.random() * 0.2,
        fcp: Math.random() * 2000 + 800,
        ttfb: Math.random() * 500 + 200,
        memory_usage: Math.random() * 100 + 50,
        cpu_usage: Math.random() * 80 + 20,
        bundle_size: Math.random() * 5 + 2,
        render_time: Math.random() * 100 + 20,
        network_requests: Math.floor(Math.random() * 50) + 10,
        component_path: "/components/Dashboard",
      }

      sendMetrics(simulatedMetrics)
    }, 2000)

    return () => clearInterval(interval)
  }, [connected, sendMetrics])

  const getMetricColor = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return "text-green-500"
    if (value <= thresholds.poor) return "text-yellow-500"
    return "text-red-500"
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            {connected ? (
              <>
                <Wifi className="h-5 w-5 text-green-500" />
                <span>Real-time Monitoring Active</span>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-red-500" />
                <span>Connection Lost</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant={connected ? "default" : "destructive"}>{connected ? "Connected" : "Disconnected"}</Badge>
              {error && <span className="text-sm text-red-500">{error}</span>}
            </div>
            {!connected && (
              <Button onClick={reconnect} size="sm">
                Reconnect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Metrics */}
      {data?.metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Render Time</span>
              </div>
              <div
                className={`text-2xl font-bold ${getMetricColor(data.metrics.render_time, { good: 50, poor: 100 })}`}
              >
                {data.metrics.render_time.toFixed(1)}ms
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MemoryStick className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Memory Usage</span>
              </div>
              <div
                className={`text-2xl font-bold ${getMetricColor(data.metrics.memory_usage, { good: 50, poor: 100 })}`}
              >
                {formatBytes(data.metrics.memory_usage * 1024 * 1024)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">CPU Usage</span>
              </div>
              <div className={`text-2xl font-bold ${getMetricColor(data.metrics.cpu_usage, { good: 50, poor: 80 })}`}>
                {data.metrics.cpu_usage.toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Bundle Size</span>
              </div>
              <div className={`text-2xl font-bold ${getMetricColor(data.metrics.bundle_size, { good: 2, poor: 5 })}`}>
                {formatBytes(data.metrics.bundle_size * 1024 * 1024)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Real-time Charts */}
      {metricsHistory.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Render Time Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={metricsHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="renderTime" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Memory & CPU Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={metricsHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="memoryUsage"
                    stackId="1"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="cpuUsage"
                    stackId="2"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Real-time Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Performance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={alert.severity === "high" ? "destructive" : "secondary"}>{alert.severity}</Badge>
                    <span className="text-sm">{alert.message}</span>
                  </div>
                  <span className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

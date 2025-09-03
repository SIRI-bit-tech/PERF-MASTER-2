"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Activity, Zap, Cpu, Database } from "lucide-react"

interface MetricData {
  timestamp: string
  renderTime: number
  memoryUsage: number
  bundleSize: number
  cpuUsage: number
}

interface ChartProps {
  data: MetricData[]
  isRealTime?: boolean
}

export function RealTimeCharts({ data, isRealTime = true }: ChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>("renderTime")
  const [timeRange, setTimeRange] = useState<string>("1h")

  // Generate sample real-time data
  const [realtimeData, setRealtimeData] = useState<MetricData[]>(data)

  useEffect(() => {
    if (!isRealTime) return

    const interval = setInterval(() => {
      const newDataPoint: MetricData = {
        timestamp: new Date().toISOString(),
        renderTime: Math.random() * 50 + 10,
        memoryUsage: Math.random() * 100 + 20,
        bundleSize: Math.random() * 500 + 200,
        cpuUsage: Math.random() * 80 + 10,
      }

      setRealtimeData((prev) => [...prev.slice(-29), newDataPoint])
    }, 2000)

    return () => clearInterval(interval)
  }, [isRealTime])

  const chartData = isRealTime ? realtimeData : data

  const getMetricColor = (metric: string) => {
    const colors = {
      renderTime: "#6b81b7",
      memoryUsage: "#747880",
      bundleSize: "#b4b9c1",
      cpuUsage: "#8b9dc3",
    }
    return colors[metric as keyof typeof colors] || "#6b81b7"
  }

  const getMetricIcon = (metric: string) => {
    const icons = {
      renderTime: Zap,
      memoryUsage: Cpu,
      bundleSize: Database,
      cpuUsage: Activity,
    }
    const Icon = icons[metric as keyof typeof icons] || Activity
    return <Icon className="w-4 h-4" />
  }

  const calculateTrend = (data: MetricData[], metric: string) => {
    if (data.length < 2) return 0
    const recent = data.slice(-5)
    const older = data.slice(-10, -5)

    const recentAvg = recent.reduce((sum, item) => sum + item[metric as keyof MetricData], 0) / recent.length
    const olderAvg = older.reduce((sum, item) => sum + item[metric as keyof MetricData], 0) / older.length

    return ((recentAvg - olderAvg) / olderAvg) * 100
  }

  return (
    <div className="space-y-6">
      {/* Metric Selection */}
      <div className="flex flex-wrap gap-2">
        {["renderTime", "memoryUsage", "bundleSize", "cpuUsage"].map((metric) => {
          const trend = calculateTrend(chartData, metric)
          const isSelected = selectedMetric === metric

          return (
            <Button
              key={metric}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMetric(metric)}
              className={`flex items-center space-x-2 ${
                isSelected ? "bg-[#6b81b7] hover:bg-[#5a6fa0]" : "border-[#2a2a2a] hover:bg-[#2a2a2a]"
              }`}
            >
              {getMetricIcon(metric)}
              <span className="capitalize">{metric.replace(/([A-Z])/g, " $1").trim()}</span>
              <div className="flex items-center space-x-1">
                {trend > 0 ? (
                  <TrendingUp className="w-3 h-3 text-red-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-green-400" />
                )}
                <span className={`text-xs ${trend > 0 ? "text-red-400" : "text-green-400"}`}>
                  {Math.abs(trend).toFixed(1)}%
                </span>
              </div>
            </Button>
          )
        })}
      </div>

      {/* Main Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {getMetricIcon(selectedMetric)}
              <h3 className="text-lg font-semibold text-[#b4b9c1] capitalize">
                {selectedMetric.replace(/([A-Z])/g, " $1").trim()} Trends
              </h3>
              {isRealTime && (
                <Badge variant="outline" className="text-green-400 border-green-400 animate-pulse">
                  Live
                </Badge>
              )}
            </div>

            <div className="flex space-x-2">
              {["1h", "6h", "24h", "7d"].map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className={timeRange === range ? "bg-[#6b81b7] hover:bg-[#5a6fa0]" : ""}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`gradient-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getMetricColor(selectedMetric)} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={getMetricColor(selectedMetric)} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#747880"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis stroke="#747880" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: "8px",
                    color: "#b4b9c1",
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke={getMetricColor(selectedMetric)}
                  strokeWidth={2}
                  fill={`url(#gradient-${selectedMetric})`}
                  dot={{ fill: getMetricColor(selectedMetric), strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: getMetricColor(selectedMetric), strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Performance Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-6">
          <h3 className="text-lg font-semibold text-[#b4b9c1] mb-4">Performance Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Excellent", value: 35, color: "#22c55e" },
                    { name: "Good", value: 40, color: "#6b81b7" },
                    { name: "Needs Improvement", value: 20, color: "#f59e0b" },
                    { name: "Poor", value: 5, color: "#ef4444" },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[
                    { name: "Excellent", value: 35, color: "#22c55e" },
                    { name: "Good", value: 40, color: "#6b81b7" },
                    { name: "Needs Improvement", value: 20, color: "#f59e0b" },
                    { name: "Poor", value: 5, color: "#ef4444" },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: "8px",
                    color: "#b4b9c1",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-6">
          <h3 className="text-lg font-semibold text-[#b4b9c1] mb-4">Component Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { component: "Header", score: 95 },
                  { component: "Dashboard", score: 87 },
                  { component: "UserProfile", score: 72 },
                  { component: "DataTable", score: 68 },
                  { component: "Chart", score: 91 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="component" stroke="#747880" fontSize={12} />
                <YAxis stroke="#747880" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: "8px",
                    color: "#b4b9c1",
                  }}
                />
                <Bar dataKey="score" fill="#6b81b7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}

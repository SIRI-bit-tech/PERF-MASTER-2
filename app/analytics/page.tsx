"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, TrendingDown, Clock, Users, Globe, Zap, AlertTriangle } from "lucide-react"
import { useApi } from "@/lib/api"

interface AnalyticsData {
  performance_trends: {
    lcp: { current: number; previous: number; trend: "up" | "down" }
    fid: { current: number; previous: number; trend: "up" | "down" }
    cls: { current: number; previous: number; trend: "up" | "down" }
  }
  user_metrics: {
    total_sessions: number
    bounce_rate: number
    avg_session_duration: number
    page_views: number
  }
  optimization_impact: {
    total_optimizations: number
    performance_improvement: number
    estimated_savings: string
  }
  top_issues: Array<{
    id: string
    type: string
    description: string
    impact: "high" | "medium" | "low"
    affected_pages: number
  }>
}

export default function AnalyticsPage() {
  const { getAnalytics } = useApi()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState("7d")
  const [selectedProject, setSelectedProject] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [timeRange, selectedProject])

  const loadAnalytics = async () => {
    try {
      const analyticsData = await getAnalytics(timeRange, selectedProject)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error("Failed to load analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTrendIcon = (trend: "up" | "down") => {
    return trend === "up" ? (
      <TrendingUp className="h-4 w-4 text-green-400" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-400" />
    )
  }

  const getTrendColor = (trend: "up" | "down", isGoodTrend: boolean) => {
    const isPositive = (trend === "up" && isGoodTrend) || (trend === "down" && !isGoodTrend)
    return isPositive ? "text-green-400" : "text-red-400"
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-900/50 text-red-300"
      case "medium":
        return "bg-yellow-900/50 text-yellow-300"
      case "low":
        return "bg-blue-900/50 text-blue-300"
      default:
        return "bg-slate-600 text-slate-300"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading analytics...</div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Failed to load analytics data</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Analytics
              </h1>
              <p className="text-xl text-slate-300">Deep insights into your application performance</p>
            </div>
            <div className="flex gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 bg-slate-800/50 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-40 bg-slate-800/50 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="project1">Project 1</SelectItem>
                  <SelectItem value="project2">Project 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="users">User Metrics</TabsTrigger>
            <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400">Largest Contentful Paint</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{analytics.performance_trends.lcp.current}ms</div>
                      <div
                        className={`flex items-center gap-1 text-sm ${getTrendColor(analytics.performance_trends.lcp.trend, false)}`}
                      >
                        {getTrendIcon(analytics.performance_trends.lcp.trend)}
                        {Math.abs(analytics.performance_trends.lcp.current - analytics.performance_trends.lcp.previous)}
                        ms
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-blue-900/50 text-blue-300">
                        Core Web Vital
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400">First Input Delay</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{analytics.performance_trends.fid.current}ms</div>
                      <div
                        className={`flex items-center gap-1 text-sm ${getTrendColor(analytics.performance_trends.fid.trend, false)}`}
                      >
                        {getTrendIcon(analytics.performance_trends.fid.trend)}
                        {Math.abs(analytics.performance_trends.fid.current - analytics.performance_trends.fid.previous)}
                        ms
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-purple-900/50 text-purple-300">
                        Core Web Vital
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400">Cumulative Layout Shift</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">{analytics.performance_trends.cls.current}</div>
                      <div
                        className={`flex items-center gap-1 text-sm ${getTrendColor(analytics.performance_trends.cls.trend, false)}`}
                      >
                        {getTrendIcon(analytics.performance_trends.cls.trend)}
                        {Math.abs(
                          analytics.performance_trends.cls.current - analytics.performance_trends.cls.previous,
                        ).toFixed(3)}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-green-900/50 text-green-300">
                        Core Web Vital
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  Performance Trends
                </CardTitle>
                <CardDescription>Historical performance data over the selected time period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-slate-400">
                  Performance chart visualization would be rendered here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Total Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.user_metrics.total_sessions.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    Bounce Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.user_metrics.bounce_rate}%</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Avg Session Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.user_metrics.avg_session_duration}s</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Page Views
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.user_metrics.page_views.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="optimizations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Total Optimizations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">
                    {analytics.optimization_impact.total_optimizations}
                  </div>
                  <p className="text-sm text-slate-400">Applied this period</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Performance Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">
                    +{analytics.optimization_impact.performance_improvement}%
                  </div>
                  <p className="text-sm text-slate-400">Overall improvement</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400">Estimated Savings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-400">
                    {analytics.optimization_impact.estimated_savings}
                  </div>
                  <p className="text-sm text-slate-400">In loading time</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="issues" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                  Top Performance Issues
                </CardTitle>
                <CardDescription>Critical issues that need immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.top_issues.map((issue) => (
                    <div key={issue.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getImpactColor(issue.impact)}>{issue.impact} impact</Badge>
                          <span className="font-medium">{issue.type}</span>
                        </div>
                        <p className="text-sm text-slate-300">{issue.description}</p>
                        <p className="text-xs text-slate-500 mt-1">Affects {issue.affected_pages} pages</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-600 hover:bg-slate-700 bg-transparent"
                      >
                        Fix Issue
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

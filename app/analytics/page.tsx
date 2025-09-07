"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, TrendingDown, Clock, Users, Globe, Zap, AlertTriangle, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { useApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/components/ui/use-mobile"
import { useAuthSync } from "@/hooks/use-auth-sync"

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
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const { session, status } = useAuthSync()
  
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState("7d")
  const [selectedProject, setSelectedProject] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [timeRange, selectedProject])

  useEffect(() => {
    setupWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  const setupWebSocket = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = process.env.NEXT_PUBLIC_WS_HOST || window.location.host
      const wsUrl = `${protocol}//${host}/ws/analytics/`

      console.info(`Connecting to WebSocket: ${wsUrl}`)
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        setLastUpdate(new Date())
        console.info('WebSocket connected to analytics endpoint')
        toast({
          title: "Connected",
          description: "Real-time analytics updates enabled",
        })
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.debug('Received WebSocket message:', data.type)
          
          if (data.type === 'analytics_update' && data.data) {
            updateAnalyticsWithRealtimeData(data.data)
            setLastUpdate(new Date())
            console.info('Analytics data updated via WebSocket')
          } else if (data.type === 'alert') {
            console.warn('Performance alert received:', data.data.message)
            toast({
              title: "Performance Alert",
              description: data.data.message,
              variant: data.data.severity === 'critical' ? 'destructive' : 'default',
            })
          } else if (data.type === 'optimization_update') {
            console.info('Optimization update received')
            toast({
              title: "Optimization Applied",
              description: "Performance optimizations have been updated",
            })
            loadAnalytics()
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        console.warn('WebSocket connection closed, attempting reconnection')
        
        toast({
          title: "Connection Lost",
          description: "Attempting to reconnect...",
          variant: "destructive",
        })

        // Attempt to reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          setupWebSocket()
        }, 5000)
      }

      ws.onerror = (error) => {
        setIsConnected(false)
        console.error('WebSocket connection error:', error)
      }

    } catch (error) {
      setIsConnected(false)
      console.error('Failed to setup WebSocket connection:', error)
    }
  }

  const updateAnalyticsWithRealtimeData = (realtimeData: any) => {
    if (!analytics) return

    console.debug('Updating analytics with real-time data')
    const updatedAnalytics = { ...analytics }
    
    if (realtimeData.average_performance) {
      if (realtimeData.average_performance.lcp !== undefined) {
        updatedAnalytics.performance_trends.lcp.current = realtimeData.average_performance.lcp
      }
      if (realtimeData.average_performance.fid !== undefined) {
        updatedAnalytics.performance_trends.fid.current = realtimeData.average_performance.fid
      }
      if (realtimeData.average_performance.cls !== undefined) {
        updatedAnalytics.performance_trends.cls.current = realtimeData.average_performance.cls
      }
    }

    if (realtimeData.active_alerts !== undefined) {
      // Update alert count (rough approximation)
      updatedAnalytics.user_metrics.page_views = realtimeData.metrics_count || updatedAnalytics.user_metrics.page_views
    }

    setAnalytics(updatedAnalytics)
  }

  const loadAnalytics = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }
      
      console.info(`Loading analytics data for ${timeRange} range`)
      const analyticsData = await getAnalytics(timeRange, selectedProject)
      setAnalytics(analyticsData)
      setLastUpdate(new Date())
      
      if (!showLoading) {
        console.info('Analytics data refreshed manually')
        toast({
          title: "Refreshed",
          description: "Analytics data has been updated",
        })
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error)
      toast({
        title: "Error",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    console.info('Manual refresh triggered')
    loadAnalytics(false)
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading analytics...</div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-lg mb-4">Failed to load analytics data</div>
          <Button onClick={() => loadAnalytics()} className="bg-blue-600 hover:bg-blue-700">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Analytics
              </h1>
              <p className="text-lg sm:text-xl text-slate-300 mt-1">
                Real-time insights into your application performance
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
              {/* Connection Status */}
              <div className="flex items-center gap-2 text-sm">
                {isConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-400" />
                    <span className="text-green-400">Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-400" />
                    <span className="text-red-400">Offline</span>
                  </>
                )}
                {lastUpdate && (
                  <span className="text-slate-400 text-xs hidden sm:inline">
                    Updated {lastUpdate.toLocaleTimeString()}
                  </span>
                )}
              </div>

              <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-24 sm:w-32 bg-slate-800/50 border-slate-600 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24h</SelectItem>
                    <SelectItem value="7d">7 days</SelectItem>
                    <SelectItem value="30d">30 days</SelectItem>
                    <SelectItem value="90d">90 days</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="w-32 sm:w-40 bg-slate-800/50 border-slate-600 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    <SelectItem value="project1">Project 1</SelectItem>
                    <SelectItem value="project2">Project 2</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  size={isMobile ? "sm" : "default"}
                  className="bg-slate-700 hover:bg-slate-600"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {!isMobile && <span className="ml-2">Refresh</span>}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="performance" className="space-y-4 sm:space-y-6">
          <TabsList className={`grid w-full grid-cols-2 sm:grid-cols-4 bg-slate-800/50 ${
            isMobile ? 'h-12' : ''
          }`}>
            <TabsTrigger value="performance" className="text-xs sm:text-sm">Performance</TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm">Users</TabsTrigger>
            <TabsTrigger value="optimizations" className="text-xs sm:text-sm">Optimizations</TabsTrigger>
            <TabsTrigger value="issues" className="text-xs sm:text-sm">Issues</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400">Largest Contentful Paint</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-xl sm:text-2xl font-bold">{analytics.performance_trends.lcp.current}ms</div>
                      <div
                        className={`flex items-center gap-1 text-xs sm:text-sm mt-1 ${getTrendColor(analytics.performance_trends.lcp.trend, false)}`}
                      >
                        {getTrendIcon(analytics.performance_trends.lcp.trend)}
                        {Math.abs(analytics.performance_trends.lcp.current - analytics.performance_trends.lcp.previous).toFixed(1)}
                        ms
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <Badge variant="outline" className="bg-blue-900/50 text-blue-300 text-xs">
                        Core Web Vital
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400">First Input Delay</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-xl sm:text-2xl font-bold">{analytics.performance_trends.fid.current}ms</div>
                      <div
                        className={`flex items-center gap-1 text-xs sm:text-sm mt-1 ${getTrendColor(analytics.performance_trends.fid.trend, false)}`}
                      >
                        {getTrendIcon(analytics.performance_trends.fid.trend)}
                        {Math.abs(analytics.performance_trends.fid.current - analytics.performance_trends.fid.previous).toFixed(1)}
                        ms
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <Badge variant="outline" className="bg-purple-900/50 text-purple-300 text-xs">
                        Core Web Vital
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400">Cumulative Layout Shift</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-xl sm:text-2xl font-bold">{analytics.performance_trends.cls.current}</div>
                      <div
                        className={`flex items-center gap-1 text-xs sm:text-sm mt-1 ${getTrendColor(analytics.performance_trends.cls.trend, true)}`}
                      >
                        {getTrendIcon(analytics.performance_trends.cls.trend)}
                        {Math.abs(analytics.performance_trends.cls.current - analytics.performance_trends.cls.previous).toFixed(3)}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <Badge variant="outline" className="bg-green-900/50 text-green-300 text-xs">
                        Core Web Vital
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  Performance Trends
                </CardTitle>
                <CardDescription>Historical performance data over the selected time period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 sm:h-64 flex items-center justify-center text-slate-400">
                  Performance chart visualization would be rendered here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Total Sessions</span>
                    <span className="sm:hidden">Sessions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{analytics.user_metrics.total_sessions.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    <span className="hidden sm:inline">Bounce Rate</span>
                    <span className="sm:hidden">Bounce</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{analytics.user_metrics.bounce_rate}%</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="hidden sm:inline">Avg Session</span>
                    <span className="sm:hidden">Session</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{analytics.user_metrics.avg_session_duration}s</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline">Page Views</span>
                    <span className="sm:hidden">Views</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{analytics.user_metrics.page_views.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="optimizations" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span className="hidden sm:inline">Total Optimizations</span>
                    <span className="sm:hidden">Optimizations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-blue-400">
                    {analytics.optimization_impact.total_optimizations}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400">Applied this period</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="hidden sm:inline">Performance Improvement</span>
                    <span className="sm:hidden">Improvement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-green-400">
                    +{analytics.optimization_impact.performance_improvement}%
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400">Overall improvement</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-sm font-medium text-slate-400">
                    <span className="hidden sm:inline">Estimated Savings</span>
                    <span className="sm:hidden">Savings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-purple-400">
                    {analytics.optimization_impact.estimated_savings}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400">In loading time</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="issues" className="space-y-4 sm:space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                  <span className="hidden sm:inline">Top Performance Issues</span>
                  <span className="sm:hidden">Issues</span>
                </CardTitle>
                <CardDescription>Critical issues that need immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {analytics.top_issues.length > 0 ? (
                    analytics.top_issues.map((issue) => (
                      <div key={issue.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-slate-900/50 rounded-lg gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <Badge className={`${getImpactColor(issue.impact)} text-xs`}>
                              {issue.impact} impact
                            </Badge>
                            <span className="font-medium text-sm sm:text-base truncate">{issue.type}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-300 mb-1">{issue.description}</p>
                          <p className="text-xs text-slate-500">Affects {issue.affected_pages} pages</p>
                        </div>
                        <Button
                          variant="outline"
                          size={isMobile ? "sm" : "default"}
                          className="border-slate-600 hover:bg-slate-700 bg-transparent text-xs sm:text-sm self-start sm:self-center"
                        >
                          Fix Issue
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 sm:py-8 text-slate-400">
                      <AlertTriangle className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm sm:text-base">No performance issues detected</p>
                      <p className="text-xs sm:text-sm mt-1">in the selected time period</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  BarChart3,
  Code,
  Database,
  Cpu,
  RefreshCw,
} from "lucide-react"
import { RealTimeCharts } from "./real-time-charts"
import { ComponentTreeVisualization } from "./component-tree-visualization"
import { AISuggestionsPanel } from "./ai-suggestions-panel"
import { RealTimePerformanceMonitor } from "./real-time-performance-monitor"
import { TeamCollaborationPanel } from "./team-collaboration-panel"
import { useAIAnalysis } from "@/hooks/use-ai-analysis"

export function PerformanceDashboard() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedProject, setSelectedProject] = useState("React Dashboard")
  const [activeTab, setActiveTab] = useState("overview")

  const { analyses, suggestions, loading, error, analyzeComponent, applySuggestion } = useAIAnalysis("project-123")

  const performanceMetrics = {
    overallScore: 87,
    renderTime: 12.4,
    memoryUsage: 45.2,
    bundleSize: 234.5,
    coreWebVitals: {
      lcp: 1.2,
      fid: 8,
      cls: 0.05,
    },
  }

  const recentIssues =
    analyses.length > 0
      ? analyses
          .flatMap((analysis) =>
            analysis.bottlenecks.map((bottleneck) => ({
              id: bottleneck.type,
              type: bottleneck.severity === "high" ? "error" : "warning",
              message: bottleneck.description,
              severity: bottleneck.severity,
            })),
          )
          .slice(0, 3)
      : [
          { id: 1, type: "warning", message: "Large bundle detected in UserProfile component", severity: "medium" },
          { id: 2, type: "error", message: "Memory leak in useEffect hook", severity: "high" },
          { id: 3, type: "info", message: "Optimization opportunity: React.memo recommended", severity: "low" },
        ]

  const chartData = Array.from({ length: 30 }, (_, i) => ({
    timestamp: new Date(Date.now() - (29 - i) * 60000).toISOString(),
    renderTime: Math.random() * 50 + 10,
    memoryUsage: Math.random() * 100 + 20,
    bundleSize: Math.random() * 500 + 200,
    cpuUsage: Math.random() * 80 + 10,
  }))

  const handleStartAnalysis = async () => {
    setIsAnalyzing(!isAnalyzing)

    if (!isAnalyzing) {
      try {
        await analyzeComponent({
          project_id: "project-123",
          component_path: "/components/Dashboard",
          source_code: `
            import React, { useState, useEffect } from 'react';
            
            export function Dashboard() {
              const [data, setData] = useState([]);
              
              useEffect(() => {
                fetchData().then(setData);
              }, []);
              
              return (
                <div>
                  {data.map(item => <div key={item.id}>{item.name}</div>)}
                </div>
              );
            }
          `,
          framework_version: "React 18",
          analysis_type: "full",
        })
      } catch (err) {
        console.error("Analysis failed:", err)
        setIsAnalyzing(false)
      }
    }
  }

  return (
    <div className="relative z-10 min-h-screen p-6">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-8 h-8 text-[#6b81b7]" />
            <h1 className="text-2xl font-bold text-[#b4b9c1]">PerfMaster</h1>
          </div>
          <Badge variant="outline" className="text-[#6b81b7] border-[#6b81b7]">
            v2.1.0
          </Badge>
          {loading && <Badge className="bg-yellow-600 animate-pulse">AI Analyzing...</Badge>}
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-[#2a2a2a] border border-[#6b81b7] rounded px-3 py-2 text-[#b4b9c1]"
          >
            <option>React Dashboard</option>
            <option>E-commerce App</option>
            <option>Blog Platform</option>
          </select>

          <Button
            onClick={handleStartAnalysis}
            disabled={loading}
            className={`${isAnalyzing ? "bg-red-600 hover:bg-red-700" : "bg-[#6b81b7] hover:bg-[#5a6fa0]"}`}
          >
            {isAnalyzing ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isAnalyzing ? "Stop Analysis" : "Start Analysis"}
          </Button>
        </div>
      </motion.header>

      {/* Performance Score */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#b4b9c1] mb-2">Overall Performance Score</h2>
              <div className="flex items-center space-x-4">
                <div className="text-4xl font-bold text-[#6b81b7]">{performanceMetrics.overallScore}</div>
                <div className="flex items-center text-green-400">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm">+5 from last week</span>
                </div>
              </div>
            </div>
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#2a2a2a" strokeWidth="8" fill="none" />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#6b81b7"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - performanceMetrics.overallScore / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#6b81b7]" />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Render Time",
            value: `${performanceMetrics.renderTime}ms`,
            icon: Zap,
            trend: -2.1,
            color: "text-green-400",
          },
          {
            title: "Memory Usage",
            value: `${performanceMetrics.memoryUsage}MB`,
            icon: Cpu,
            trend: 1.5,
            color: "text-yellow-400",
          },
          {
            title: "Bundle Size",
            value: `${performanceMetrics.bundleSize}KB`,
            icon: Database,
            trend: -5.2,
            color: "text-green-400",
          },
          {
            title: "Components",
            value: "47",
            icon: Code,
            trend: 0,
            color: "text-[#b4b9c1]",
          },
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-4">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className="w-5 h-5 text-[#6b81b7]" />
                {metric.trend !== 0 && (
                  <span className={`text-xs ${metric.trend > 0 ? "text-red-400" : "text-green-400"}`}>
                    {metric.trend > 0 ? "+" : ""}
                    {metric.trend}%
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-[#b4b9c1] mb-1">{metric.value}</div>
              <div className="text-sm text-[#747880]">{metric.title}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-[#2a2a2a]">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#6b81b7]">
            Overview
          </TabsTrigger>
          <TabsTrigger value="realtime" className="data-[state=active]:bg-[#6b81b7]">
            Real-time
          </TabsTrigger>
          <TabsTrigger value="components" className="data-[state=active]:bg-[#6b81b7]">
            Components
          </TabsTrigger>
          <TabsTrigger value="ai-suggestions" className="data-[state=active]:bg-[#6b81b7]">
            AI Suggestions
          </TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-[#6b81b7]">
            Team
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[#6b81b7]">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <RealTimeCharts data={chartData} />

          {/* Issues and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
              <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#b4b9c1]">Performance Issues</h3>
                  <Badge variant="destructive">{recentIssues.length}</Badge>
                </div>
                <div className="space-y-3">
                  {recentIssues.map((issue) => (
                    <div key={issue.id} className="flex items-start space-x-3 p-3 bg-[#2a2a2a] rounded-lg">
                      <AlertTriangle
                        className={`w-4 h-4 mt-0.5 ${
                          issue.severity === "high"
                            ? "text-red-400"
                            : issue.severity === "medium"
                              ? "text-yellow-400"
                              : "text-blue-400"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm text-[#b4b9c1]">{issue.message}</p>
                        <Badge
                          variant="outline"
                          className={`mt-1 text-xs ${
                            issue.severity === "high"
                              ? "border-red-400 text-red-400"
                              : issue.severity === "medium"
                                ? "border-yellow-400 text-yellow-400"
                                : "border-blue-400 text-blue-400"
                          }`}
                        >
                          {issue.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
              <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#b4b9c1]">Quick Actions</h3>
                  <Button size="sm" variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                <div className="space-y-3">
                  <Button className="w-full justify-start bg-[#2a2a2a] hover:bg-[#3a3a3a] text-left">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Run Full Performance Audit
                  </Button>

                  <Button className="w-full justify-start bg-[#2a2a2a] hover:bg-[#3a3a3a] text-left">
                    <Zap className="w-4 h-4 mr-2" />
                    Optimize Bundle Size
                  </Button>

                  <Button className="w-full justify-start bg-[#2a2a2a] hover:bg-[#3a3a3a] text-left">
                    <Code className="w-4 h-4 mr-2" />
                    Generate Performance Report
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="realtime">
          <RealTimePerformanceMonitor projectId="project-123" />
        </TabsContent>

        <TabsContent value="components">
          <ComponentTreeVisualization />
        </TabsContent>

        <TabsContent value="ai-suggestions">
          <AISuggestionsPanel />
        </TabsContent>

        <TabsContent value="team">
          <TeamCollaborationPanel projectId="project-123" />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-6">
              <h3 className="text-lg font-semibold text-[#b4b9c1] mb-4">Performance Trends</h3>
              <RealTimeCharts data={chartData} isRealTime={false} />
            </Card>

            <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-6">
              <h3 className="text-lg font-semibold text-[#b4b9c1] mb-4">Team Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded">
                  <span className="text-[#b4b9c1]">Total Optimizations Applied</span>
                  <Badge className="bg-green-600">{suggestions.filter((s) => s.status === "applied").length}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded">
                  <span className="text-[#b4b9c1]">Performance Score Improvement</span>
                  <Badge className="bg-blue-600">+23%</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded">
                  <span className="text-[#b4b9c1]">Bundle Size Reduction</span>
                  <Badge className="bg-purple-600">-156KB</Badge>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Lightbulb,
  Code,
  Zap,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Target,
  Gauge,
} from "lucide-react"

interface AISuggestion {
  id: string
  type: "performance" | "optimization" | "refactoring" | "security"
  title: string
  description: string
  impact: {
    performance: number
    effort: "low" | "medium" | "high"
    confidence: number
  }
  codeExample?: {
    before: string
    after: string
  }
  estimatedTime: string
  priority: 1 | 2 | 3 | 4 | 5
  status: "pending" | "applied" | "rejected" | "testing"
}

const sampleSuggestions: AISuggestion[] = [
  {
    id: "1",
    type: "performance",
    title: "Implement React.memo for UserCard component",
    description:
      "The UserCard component re-renders unnecessarily when parent state changes. Wrapping it with React.memo will prevent re-renders when props haven't changed.",
    impact: {
      performance: 25,
      effort: "low",
      confidence: 0.92,
    },
    codeExample: {
      before: `export function UserCard({ user, onClick }) {
  return (
    <div onClick={onClick}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  )
}`,
      after: `export const UserCard = React.memo(function UserCard({ user, onClick }) {
  return (
    <div onClick={onClick}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  )
})`,
    },
    estimatedTime: "5 minutes",
    priority: 1,
    status: "pending",
  },
  {
    id: "2",
    type: "optimization",
    title: "Add code splitting for Dashboard route",
    description:
      "The Dashboard component is large and not needed on initial page load. Implementing lazy loading will reduce the initial bundle size by ~45KB.",
    impact: {
      performance: 35,
      effort: "medium",
      confidence: 0.88,
    },
    codeExample: {
      before: `import Dashboard from './Dashboard'

function App() {
  return <Dashboard />
}`,
      after: `const Dashboard = lazy(() => import('./Dashboard'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  )
}`,
    },
    estimatedTime: "15 minutes",
    priority: 2,
    status: "pending",
  },
  {
    id: "3",
    type: "refactoring",
    title: "Optimize useEffect dependencies",
    description:
      "Several useEffect hooks are missing dependencies or have unnecessary dependencies causing extra re-runs.",
    impact: {
      performance: 18,
      effort: "low",
      confidence: 0.95,
    },
    estimatedTime: "10 minutes",
    priority: 3,
    status: "applied",
  },
]

export function AISuggestionsPanel() {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>(sampleSuggestions)
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "high-impact">("all")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const filteredSuggestions = suggestions.filter((suggestion) => {
    switch (filter) {
      case "pending":
        return suggestion.status === "pending"
      case "high-impact":
        return suggestion.impact.performance > 20
      default:
        return true
    }
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "performance":
        return <Gauge className="w-4 h-4" />
      case "optimization":
        return <Zap className="w-4 h-4" />
      case "refactoring":
        return <Code className="w-4 h-4" />
      case "security":
        return <Target className="w-4 h-4" />
      default:
        return <Lightbulb className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "performance":
        return "text-green-400 border-green-400"
      case "optimization":
        return "text-blue-400 border-blue-400"
      case "refactoring":
        return "text-yellow-400 border-yellow-400"
      case "security":
        return "text-red-400 border-red-400"
      default:
        return "text-[#6b81b7] border-[#6b81b7]"
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return "text-red-400 border-red-400"
    if (priority <= 3) return "text-yellow-400 border-yellow-400"
    return "text-green-400 border-green-400"
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case "low":
        return "text-green-400 border-green-400"
      case "medium":
        return "text-yellow-400 border-yellow-400"
      case "high":
        return "text-red-400 border-red-400"
      default:
        return "text-[#747880] border-[#747880]"
    }
  }

  const applySuggestion = (suggestionId: string) => {
    setSuggestions((prev) => prev.map((s) => (s.id === suggestionId ? { ...s, status: "testing" as const } : s)))

    // Simulate application process
    setTimeout(() => {
      setSuggestions((prev) => prev.map((s) => (s.id === suggestionId ? { ...s, status: "applied" as const } : s)))
    }, 2000)
  }

  const generateNewSuggestions = () => {
    setIsAnalyzing(true)

    setTimeout(() => {
      setIsAnalyzing(false)
      // In real app, this would fetch from API
    }, 3000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Suggestions List */}
      <div className="lg:col-span-2">
        <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-[#6b81b7]" />
              <h3 className="text-lg font-semibold text-[#b4b9c1]">AI Suggestions</h3>
              <Badge variant="outline" className="text-[#6b81b7] border-[#6b81b7]">
                {filteredSuggestions.length}
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {["all", "pending", "high-impact"].map((filterType) => (
                  <Button
                    key={filterType}
                    variant={filter === filterType ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter(filterType as any)}
                    className={filter === filterType ? "bg-[#6b81b7] hover:bg-[#5a6fa0]" : ""}
                  >
                    {filterType.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Button>
                ))}
              </div>

              <Button
                onClick={generateNewSuggestions}
                disabled={isAnalyzing}
                className="bg-[#6b81b7] hover:bg-[#5a6fa0]"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate New
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {filteredSuggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`p-4 bg-[#2a2a2a] rounded-lg border cursor-pointer transition-colors ${
                    selectedSuggestion?.id === suggestion.id
                      ? "border-[#6b81b7] bg-[#6b81b7]/10"
                      : "border-[#3a3a3a] hover:border-[#4a4a4a]"
                  }`}
                  onClick={() => setSelectedSuggestion(suggestion)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(suggestion.type)}
                      <Badge variant="outline" className={getTypeColor(suggestion.type)}>
                        {suggestion.type}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(suggestion.priority)}>
                        P{suggestion.priority}
                      </Badge>
                      {suggestion.status === "applied" && <CheckCircle className="w-4 h-4 text-green-400" />}
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-xs text-[#747880]">
                        <TrendingUp className="w-3 h-3" />
                        <span>+{suggestion.impact.performance}%</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-[#747880]">
                        <Clock className="w-3 h-3" />
                        <span>{suggestion.estimatedTime}</span>
                      </div>
                    </div>
                  </div>

                  <h4 className="font-medium text-[#b4b9c1] mb-2">{suggestion.title}</h4>
                  <p className="text-sm text-[#747880] mb-3">{suggestion.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-[#747880]">Effort:</span>
                        <Badge variant="outline" className={getEffortColor(suggestion.impact.effort)} size="sm">
                          {suggestion.impact.effort}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-[#747880]">Confidence:</span>
                        <span className="text-xs text-[#b4b9c1]">
                          {Math.round(suggestion.impact.confidence * 100)}%
                        </span>
                      </div>
                    </div>

                    {suggestion.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          applySuggestion(suggestion.id)
                        }}
                        className="bg-[#6b81b7] hover:bg-[#5a6fa0]"
                      >
                        Apply
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Card>
      </div>

      {/* Suggestion Details */}
      <div>
        <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-6">
          <h3 className="text-lg font-semibold text-[#b4b9c1] mb-4">Suggestion Details</h3>

          {selectedSuggestion ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  {getTypeIcon(selectedSuggestion.type)}
                  <h4 className="font-semibold text-[#b4b9c1]">{selectedSuggestion.title}</h4>
                </div>
                <p className="text-sm text-[#747880]">{selectedSuggestion.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#747880] mb-1">Performance Impact</p>
                  <p className="text-2xl font-bold text-green-400">+{selectedSuggestion.impact.performance}%</p>
                </div>
                <div>
                  <p className="text-xs text-[#747880] mb-1">Confidence</p>
                  <p className="text-2xl font-bold text-[#b4b9c1]">
                    {Math.round(selectedSuggestion.impact.confidence * 100)}%
                  </p>
                </div>
              </div>

              {selectedSuggestion.codeExample && (
                <div>
                  <h5 className="font-medium text-[#b4b9c1] mb-2">Code Example</h5>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-[#747880] mb-1">Before:</p>
                      <pre className="text-xs bg-[#0f0f0f] p-3 rounded border overflow-x-auto">
                        <code className="text-[#b4b9c1]">{selectedSuggestion.codeExample.before}</code>
                      </pre>
                    </div>

                    <div>
                      <p className="text-xs text-[#747880] mb-1">After:</p>
                      <pre className="text-xs bg-[#0f0f0f] p-3 rounded border overflow-x-auto">
                        <code className="text-[#b4b9c1]">{selectedSuggestion.codeExample.after}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {selectedSuggestion.status === "pending" && (
                <Button
                  className="w-full bg-[#6b81b7] hover:bg-[#5a6fa0]"
                  onClick={() => applySuggestion(selectedSuggestion.id)}
                >
                  Apply Suggestion
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Lightbulb className="w-12 h-12 text-[#747880] mx-auto mb-4" />
              <p className="text-[#747880]">Select a suggestion to view details</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

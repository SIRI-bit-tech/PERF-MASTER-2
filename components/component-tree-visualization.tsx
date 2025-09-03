"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ChevronDown, Component, AlertTriangle, CheckCircle, Clock, Zap, Search } from "lucide-react"

interface ComponentNode {
  id: string
  name: string
  type: "component" | "hook" | "function"
  performanceScore: number
  renderTime: number
  children: ComponentNode[]
  issues: Array<{
    type: "warning" | "error" | "info"
    message: string
  }>
  optimizations: string[]
}

const sampleComponentTree: ComponentNode = {
  id: "app",
  name: "App",
  type: "component",
  performanceScore: 87,
  renderTime: 12.4,
  children: [
    {
      id: "header",
      name: "Header",
      type: "component",
      performanceScore: 95,
      renderTime: 2.1,
      children: [
        {
          id: "navigation",
          name: "Navigation",
          type: "component",
          performanceScore: 92,
          renderTime: 1.8,
          children: [],
          issues: [],
          optimizations: ["React.memo applied"],
        },
        {
          id: "user-menu",
          name: "UserMenu",
          type: "component",
          performanceScore: 88,
          renderTime: 3.2,
          children: [],
          issues: [{ type: "info", message: "Consider lazy loading" }],
          optimizations: [],
        },
      ],
      issues: [],
      optimizations: ["useCallback optimization"],
    },
    {
      id: "dashboard",
      name: "Dashboard",
      type: "component",
      performanceScore: 72,
      renderTime: 45.6,
      children: [
        {
          id: "metrics-grid",
          name: "MetricsGrid",
          type: "component",
          performanceScore: 68,
          renderTime: 23.4,
          children: [],
          issues: [
            { type: "warning", message: "Heavy re-renders detected" },
            { type: "error", message: "Missing key props in list" },
          ],
          optimizations: [],
        },
        {
          id: "chart-container",
          name: "ChartContainer",
          type: "component",
          performanceScore: 85,
          renderTime: 18.7,
          children: [],
          issues: [],
          optimizations: ["useMemo for expensive calculations"],
        },
      ],
      issues: [{ type: "warning", message: "Component too large, consider splitting" }],
      optimizations: [],
    },
  ],
  issues: [],
  optimizations: [],
}

interface TreeNodeProps {
  node: ComponentNode
  level: number
  onNodeSelect: (node: ComponentNode) => void
  selectedNode?: ComponentNode
}

function TreeNode({ node, level, onNodeSelect, selectedNode }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2)
  const isSelected = selectedNode?.id === node.id

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-400"
    if (score >= 70) return "text-yellow-400"
    return "text-red-400"
  }

  const getPerformanceBadgeColor = (score: number) => {
    if (score >= 90) return "border-green-400 text-green-400"
    if (score >= 70) return "border-yellow-400 text-yellow-400"
    return "border-red-400 text-red-400"
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "component":
        return <Component className="w-4 h-4" />
      case "hook":
        return <Zap className="w-4 h-4" />
      default:
        return <div className="w-4 h-4 rounded bg-[#6b81b7]" />
    }
  }

  return (
    <div className="select-none">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: level * 0.1 }}
        className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
          isSelected ? "bg-[#6b81b7]/20 border border-[#6b81b7]" : "hover:bg-[#2a2a2a]"
        }`}
        style={{ marginLeft: `${level * 20}px` }}
        onClick={() => onNodeSelect(node)}
      >
        {node.children.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        )}

        {node.children.length === 0 && <div className="w-6" />}

        {getTypeIcon(node.type)}

        <span className="text-[#b4b9c1] font-medium">{node.name}</span>

        <Badge variant="outline" className={getPerformanceBadgeColor(node.performanceScore)}>
          {node.performanceScore}
        </Badge>

        <div className="flex items-center space-x-1 text-xs text-[#747880]">
          <Clock className="w-3 h-3" />
          <span>{node.renderTime}ms</span>
        </div>

        {node.issues.length > 0 && (
          <div className="flex items-center space-x-1">
            {node.issues.some((i) => i.type === "error") && <AlertTriangle className="w-4 h-4 text-red-400" />}
            {node.issues.some((i) => i.type === "warning") && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
          </div>
        )}

        {node.optimizations.length > 0 && <CheckCircle className="w-4 h-4 text-green-400" />}
      </motion.div>

      {isExpanded &&
        node.children.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            level={level + 1}
            onNodeSelect={onNodeSelect}
            selectedNode={selectedNode}
          />
        ))}
    </div>
  )
}

export function ComponentTreeVisualization() {
  const [selectedNode, setSelectedNode] = useState<ComponentNode | undefined>()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "issues" | "optimized">("all")

  const filterNodes = (node: ComponentNode, term: string): boolean => {
    if (node.name.toLowerCase().includes(term.toLowerCase())) return true
    return node.children.some((child) => filterNodes(child, term))
  }

  const shouldShowNode = (node: ComponentNode): boolean => {
    if (searchTerm && !filterNodes(node, searchTerm)) return false

    switch (filterType) {
      case "issues":
        return node.issues.length > 0 || node.children.some(shouldShowNode)
      case "optimized":
        return node.optimizations.length > 0 || node.children.some(shouldShowNode)
      default:
        return true
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Component Tree */}
      <div className="lg:col-span-2">
        <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#b4b9c1]">Component Tree</h3>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#747880]" />
                <input
                  type="text"
                  placeholder="Search components..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-[#b4b9c1] text-sm focus:outline-none focus:border-[#6b81b7]"
                />
              </div>

              <div className="flex space-x-1">
                {["all", "issues", "optimized"].map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilterType(type as any)}
                    className={filterType === type ? "bg-[#6b81b7] hover:bg-[#5a6fa0]" : ""}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {shouldShowNode(sampleComponentTree) && (
              <TreeNode
                node={sampleComponentTree}
                level={0}
                onNodeSelect={setSelectedNode}
                selectedNode={selectedNode}
              />
            )}
          </div>
        </Card>
      </div>

      {/* Component Details */}
      <div>
        <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-6">
          <h3 className="text-lg font-semibold text-[#b4b9c1] mb-4">Component Details</h3>

          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Component className="w-5 h-5 text-[#6b81b7]" />
                  <h4 className="font-semibold text-[#b4b9c1]">{selectedNode.name}</h4>
                </div>
                <p className="text-sm text-[#747880] capitalize">{selectedNode.type}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#747880] mb-1">Performance Score</p>
                  <p
                    className={`text-2xl font-bold ${
                      selectedNode.performanceScore >= 90
                        ? "text-green-400"
                        : selectedNode.performanceScore >= 70
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                  >
                    {selectedNode.performanceScore}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#747880] mb-1">Render Time</p>
                  <p className="text-2xl font-bold text-[#b4b9c1]">{selectedNode.renderTime}ms</p>
                </div>
              </div>

              {selectedNode.issues.length > 0 && (
                <div>
                  <h5 className="font-medium text-[#b4b9c1] mb-2">Issues</h5>
                  <div className="space-y-2">
                    {selectedNode.issues.map((issue, index) => (
                      <div key={index} className="flex items-start space-x-2 p-2 bg-[#2a2a2a] rounded">
                        <AlertTriangle
                          className={`w-4 h-4 mt-0.5 ${
                            issue.type === "error"
                              ? "text-red-400"
                              : issue.type === "warning"
                                ? "text-yellow-400"
                                : "text-blue-400"
                          }`}
                        />
                        <p className="text-sm text-[#b4b9c1]">{issue.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedNode.optimizations.length > 0 && (
                <div>
                  <h5 className="font-medium text-[#b4b9c1] mb-2">Optimizations</h5>
                  <div className="space-y-2">
                    {selectedNode.optimizations.map((optimization, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-[#2a2a2a] rounded">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <p className="text-sm text-[#b4b9c1]">{optimization}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button className="w-full bg-[#6b81b7] hover:bg-[#5a6fa0]">Analyze Component</Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Component className="w-12 h-12 text-[#747880] mx-auto mb-4" />
              <p className="text-[#747880]">Select a component to view details</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

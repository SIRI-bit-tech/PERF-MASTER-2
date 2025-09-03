"use client"

import { useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Box, Sphere, Line } from "@react-three/drei"
import type * as THREE from "three"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, ZoomIn, ZoomOut, Maximize } from "lucide-react"

interface ComponentNode3D {
  id: string
  name: string
  position: [number, number, number]
  performance: number
  connections: string[]
  size: number
  color: string
}

const sampleNodes: ComponentNode3D[] = [
  {
    id: "app",
    name: "App",
    position: [0, 0, 0],
    performance: 87,
    connections: ["header", "dashboard", "footer"],
    size: 1.5,
    color: "#6b81b7",
  },
  {
    id: "header",
    name: "Header",
    position: [-3, 2, 0],
    performance: 95,
    connections: ["navigation", "user-menu"],
    size: 1.2,
    color: "#22c55e",
  },
  {
    id: "dashboard",
    name: "Dashboard",
    position: [0, -2, 0],
    performance: 72,
    connections: ["metrics", "charts"],
    size: 1.8,
    color: "#f59e0b",
  },
  {
    id: "footer",
    name: "Footer",
    position: [3, -3, 0],
    performance: 88,
    connections: [],
    size: 0.8,
    color: "#6b81b7",
  },
  {
    id: "navigation",
    name: "Navigation",
    position: [-5, 3, 1],
    performance: 92,
    connections: [],
    size: 0.8,
    color: "#22c55e",
  },
  {
    id: "user-menu",
    name: "UserMenu",
    position: [-1, 3, 1],
    performance: 88,
    connections: [],
    size: 0.6,
    color: "#6b81b7",
  },
  {
    id: "metrics",
    name: "Metrics",
    position: [-2, -4, 1],
    performance: 68,
    connections: [],
    size: 1.0,
    color: "#ef4444",
  },
  {
    id: "charts",
    name: "Charts",
    position: [2, -4, 1],
    performance: 85,
    connections: [],
    size: 1.2,
    color: "#22c55e",
  },
]

function ComponentNode({
  node,
  onClick,
  isSelected,
}: {
  node: ComponentNode3D
  onClick: (node: ComponentNode3D) => void
  isSelected: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
      if (isSelected) {
        meshRef.current.scale.setScalar(1.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1)
      } else {
        meshRef.current.scale.setScalar(hovered ? 1.1 : 1)
      }
    }
  })

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "#22c55e"
    if (performance >= 70) return "#f59e0b"
    return "#ef4444"
  }

  return (
    <group position={node.position}>
      <Sphere
        ref={meshRef}
        args={[node.size * 0.5, 32, 32]}
        onClick={() => onClick(node)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={getPerformanceColor(node.performance)}
          transparent
          opacity={0.8}
          emissive={getPerformanceColor(node.performance)}
          emissiveIntensity={isSelected ? 0.3 : hovered ? 0.2 : 0.1}
        />
      </Sphere>

      <Text position={[0, node.size * 0.8, 0]} fontSize={0.3} color="#b4b9c1" anchorX="center" anchorY="middle">
        {node.name}
      </Text>

      <Text
        position={[0, -node.size * 0.8, 0]}
        fontSize={0.2}
        color={getPerformanceColor(node.performance)}
        anchorX="center"
        anchorY="middle"
      >
        {node.performance}%
      </Text>
    </group>
  )
}

function ConnectionLines({ nodes }: { nodes: ComponentNode3D[] }) {
  const lines = []

  for (const node of nodes) {
    for (const connectionId of node.connections) {
      const connectedNode = nodes.find((n) => n.id === connectionId)
      if (connectedNode) {
        lines.push({
          start: node.position,
          end: connectedNode.position,
          color: "#6b81b7",
        })
      }
    }
  }

  return (
    <>
      {lines.map((line, index) => (
        <Line key={index} points={[line.start, line.end]} color={line.color} lineWidth={2} transparent opacity={0.6} />
      ))}
    </>
  )
}

function Scene({
  nodes,
  onNodeClick,
  selectedNode,
}: {
  nodes: ComponentNode3D[]
  onNodeClick: (node: ComponentNode3D) => void
  selectedNode: ComponentNode3D | null
}) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      <ConnectionLines nodes={nodes} />

      {nodes.map((node) => (
        <ComponentNode key={node.id} node={node} onClick={onNodeClick} isSelected={selectedNode?.id === node.id} />
      ))}

      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minDistance={5} maxDistance={20} />
    </>
  )
}

export function ThreeDVisualization() {
  const [selectedNode, setSelectedNode] = useState<ComponentNode3D | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const resetCamera = () => {
    // This would reset the camera position in a real implementation
    console.log("Reset camera")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 3D Visualization */}
      <div className={`${isFullscreen ? "fixed inset-0 z-50 bg-[#0b0909]" : "lg:col-span-2"}`}>
        <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-6 h-96">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#b4b9c1]">3D Component Visualization</h3>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={resetCamera}>
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="h-80 bg-[#0f0f0f] rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
              <Scene nodes={sampleNodes} onNodeClick={setSelectedNode} selectedNode={selectedNode} />
            </Canvas>
          </div>
        </Card>
      </div>

      {/* Node Details */}
      {!isFullscreen && (
        <div>
          <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-6">
            <h3 className="text-lg font-semibold text-[#b4b9c1] mb-4">Component Details</h3>

            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-[#b4b9c1] mb-2">{selectedNode.name}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#747880] mb-1">Performance</p>
                      <div className="flex items-center space-x-2">
                        <p
                          className={`text-2xl font-bold ${
                            selectedNode.performance >= 90
                              ? "text-green-400"
                              : selectedNode.performance >= 70
                                ? "text-yellow-400"
                                : "text-red-400"
                          }`}
                        >
                          {selectedNode.performance}%
                        </p>
                        <Badge
                          variant="outline"
                          className={
                            selectedNode.performance >= 90
                              ? "border-green-400 text-green-400"
                              : selectedNode.performance >= 70
                                ? "border-yellow-400 text-yellow-400"
                                : "border-red-400 text-red-400"
                          }
                        >
                          {selectedNode.performance >= 90
                            ? "Excellent"
                            : selectedNode.performance >= 70
                              ? "Good"
                              : "Needs Work"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-[#747880] mb-1">Connections</p>
                      <p className="text-2xl font-bold text-[#b4b9c1]">{selectedNode.connections.length}</p>
                    </div>
                  </div>
                </div>

                {selectedNode.connections.length > 0 && (
                  <div>
                    <h5 className="font-medium text-[#b4b9c1] mb-2">Connected Components</h5>
                    <div className="space-y-2">
                      {selectedNode.connections.map((connectionId) => {
                        const connectedNode = sampleNodes.find((n) => n.id === connectionId)
                        return connectedNode ? (
                          <div
                            key={connectionId}
                            className="flex items-center justify-between p-2 bg-[#2a2a2a] rounded"
                          >
                            <span className="text-sm text-[#b4b9c1]">{connectedNode.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {connectedNode.performance}%
                            </Badge>
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-[#2a2a2a]">
                  <h5 className="font-medium text-[#b4b9c1] mb-2">Actions</h5>
                  <div className="space-y-2">
                    <Button size="sm" className="w-full bg-[#6b81b7] hover:bg-[#5a6fa0]">
                      Analyze Component
                    </Button>
                    <Button size="sm" variant="outline" className="w-full bg-transparent">
                      View Source Code
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-[#6b81b7] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Box className="w-6 h-6 text-white" />
                </div>
                <p className="text-[#747880]">Click on a component in the 3D view to see details</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

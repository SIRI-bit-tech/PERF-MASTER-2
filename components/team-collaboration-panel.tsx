"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, MessageCircle, Share2, CheckCircle, User } from "lucide-react"

interface TeamCollaborationPanelProps {
  projectId: string
}

interface TeamMember {
  username: string
  status: "online" | "offline"
  lastSeen?: string
}

interface TeamMessage {
  user: string
  message: string
  timestamp: string
  type: "comment" | "optimization_applied" | "analysis_shared"
}

export function TeamCollaborationPanel({ projectId }: TeamCollaborationPanelProps) {
  const [connected, setConnected] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [messages, setMessages] = useState<TeamMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [ws, setWs] = useState<WebSocket | null>(null)

  useEffect(() => {
    const websocket = new WebSocket(`ws://localhost:8000/ws/team/${projectId}/`)

    websocket.onopen = () => {
      setConnected(true)
      console.log("[v0] Team collaboration WebSocket connected")
    }

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log("[v0] Team collaboration message:", data)

      switch (data.type) {
        case "user_joined":
          setTeamMembers((prev) => {
            const existing = prev.find((m) => m.username === data.user)
            if (existing) {
              return prev.map((m) => (m.username === data.user ? { ...m, status: "online" as const } : m))
            }
            return [...prev, { username: data.user, status: "online" as const }]
          })
          break

        case "user_left":
          setTeamMembers((prev) =>
            prev.map((m) =>
              m.username === data.user ? { ...m, status: "offline" as const, lastSeen: data.timestamp } : m,
            ),
          )
          break

        case "comment":
        case "optimization_applied":
        case "analysis_shared":
          setMessages((prev) =>
            [
              {
                user: data.user,
                message: data.message || `${data.type.replace("_", " ")} by ${data.user}`,
                timestamp: data.timestamp,
                type: data.type,
              },
              ...prev,
            ].slice(0, 50),
          )
          break
      }
    }

    websocket.onclose = () => {
      setConnected(false)
      console.log("[v0] Team collaboration WebSocket disconnected")
    }

    websocket.onerror = (error) => {
      console.error("[v0] Team collaboration WebSocket error:", error)
    }

    setWs(websocket)

    return () => {
      websocket.close()
    }
  }, [projectId])

  const sendMessage = () => {
    if (!ws || !newMessage.trim()) return

    ws.send(
      JSON.stringify({
        type: "comment",
        message: newMessage,
        context: { projectId },
      }),
    )

    setNewMessage("")
  }

  const shareOptimization = (optimizationId: string) => {
    if (!ws) return

    ws.send(
      JSON.stringify({
        type: "optimization_applied",
        optimization_id: optimizationId,
        message: `Applied optimization: ${optimizationId}`,
      }),
    )
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "optimization_applied":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "analysis_shared":
        return <Share2 className="h-4 w-4 text-blue-500" />
      default:
        return <MessageCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div className="space-y-6">
      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
            <Badge variant={connected ? "default" : "secondary"}>{connected ? "Connected" : "Offline"}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamMembers.length > 0 ? (
              teamMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{member.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-medium">{member.username}</span>
                      {member.lastSeen && (
                        <p className="text-xs text-gray-500">Last seen: {formatTimestamp(member.lastSeen)}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={member.status === "online" ? "default" : "secondary"}>{member.status}</Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No team members online</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Chat */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Team Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                disabled={!connected}
              />
              <Button onClick={sendMessage} disabled={!connected || !newMessage.trim()} size="sm">
                Send
              </Button>
            </div>

            {/* Messages */}
            <div className="max-h-64 overflow-y-auto space-y-3">
              {messages.length > 0 ? (
                messages.map((message, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getMessageIcon(message.type)}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{message.user}</span>
                          <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{message.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-xs">Start collaborating with your team!</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => shareOptimization("bundle-optimization")}
              disabled={!connected}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Analysis
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => shareOptimization("performance-boost")}
              disabled={!connected}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Apply Optimization
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

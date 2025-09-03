"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, UserPlus, BarChart3, Target, MessageSquare, Crown, Shield, Eye } from "lucide-react"
import { useApi } from "@/lib/api"

interface TeamMember {
  id: string
  name: string
  email: string
  role: "admin" | "developer" | "viewer"
  avatar?: string
  last_active: string
  performance_score: number
  contributions: number
}

interface TeamGoal {
  id: string
  title: string
  target_value: number
  current_value: number
  metric: string
  deadline: string
  status: "active" | "completed" | "overdue"
}

export default function TeamPage() {
  const { getTeamMembers, getTeamGoals, inviteTeamMember, updateMemberRole } = useApi()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [goals, setGoals] = useState<TeamGoal[]>([])
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"developer" | "viewer">("developer")

  useEffect(() => {
    loadTeamData()
  }, [])

  const loadTeamData = async () => {
    try {
      const [membersData, goalsData] = await Promise.all([getTeamMembers(), getTeamGoals()])
      setMembers(membersData)
      setGoals(goalsData)
    } catch (error) {
      console.error("Failed to load team data:", error)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail) return

    try {
      await inviteTeamMember(inviteEmail, inviteRole)
      setInviteEmail("")
      loadTeamData()
    } catch (error) {
      console.error("Failed to invite member:", error)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await updateMemberRole(memberId, newRole)
      loadTeamData()
    } catch (error) {
      console.error("Failed to update role:", error)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-yellow-400" />
      case "developer":
        return <Shield className="h-4 w-4 text-blue-400" />
      case "viewer":
        return <Eye className="h-4 w-4 text-slate-400" />
      default:
        return null
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-yellow-900/50 text-yellow-300"
      case "developer":
        return "bg-blue-900/50 text-blue-300"
      case "viewer":
        return "bg-slate-600 text-slate-300"
      default:
        return "bg-slate-600 text-slate-300"
    }
  }

  const getGoalStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-900/50 text-green-300"
      case "active":
        return "bg-blue-900/50 text-blue-300"
      case "overdue":
        return "bg-red-900/50 text-red-300"
      default:
        return "bg-slate-600 text-slate-300"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Team Management
          </h1>
          <p className="text-xl text-slate-300">Collaborate with your team on performance optimization goals</p>
        </div>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="goals">Performance Goals</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="insights">Team Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-blue-400" />
                  Invite Team Member
                </CardTitle>
                <CardDescription>Add new team members to collaborate on performance optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="bg-slate-900/50 border-slate-600"
                  />
                  <Select value={inviteRole} onValueChange={(value: "developer" | "viewer") => setInviteRole(value)}>
                    <SelectTrigger className="w-40 bg-slate-900/50 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleInvite} className="bg-blue-600 hover:bg-blue-700">
                    Invite
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-400" />
                  Team Members ({members.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={member.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-slate-700">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{member.name}</h4>
                            {getRoleIcon(member.role)}
                          </div>
                          <p className="text-sm text-slate-400">{member.email}</p>
                          <p className="text-xs text-slate-500">Last active: {member.last_active}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">Performance Score</div>
                          <div className="text-lg font-bold text-blue-400">{member.performance_score}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">Contributions</div>
                          <div className="text-lg font-bold text-green-400">{member.contributions}</div>
                        </div>
                        <Badge className={getRoleBadgeColor(member.role)}>{member.role}</Badge>
                        <Select value={member.role} onValueChange={(value) => handleRoleChange(member.id, value)}>
                          <SelectTrigger className="w-32 bg-slate-900/50 border-slate-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="developer">Developer</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  Performance Goals
                </CardTitle>
                <CardDescription>Track team progress towards performance optimization goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <div key={goal.id} className="p-4 bg-slate-900/50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{goal.title}</h4>
                        <Badge className={getGoalStatusColor(goal.status)}>{goal.status}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Progress</span>
                          <span>
                            {goal.current_value} / {goal.target_value} {goal.metric}
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((goal.current_value / goal.target_value) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Deadline: {goal.deadline}</span>
                          <span>{Math.round((goal.current_value / goal.target_value) * 100)}% complete</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-orange-400" />
                  Recent Team Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-slate-700 text-xs">JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">John Doe</span> implemented AI suggestion for component
                        optimization
                      </p>
                      <p className="text-xs text-slate-500">2 hours ago</p>
                    </div>
                    <Badge variant="outline" className="bg-green-900/50 text-green-300">
                      Optimization
                    </Badge>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-slate-700 text-xs">SM</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">Sarah Miller</span> commented on performance regression in
                        checkout flow
                      </p>
                      <p className="text-xs text-slate-500">4 hours ago</p>
                    </div>
                    <Badge variant="outline" className="bg-blue-900/50 text-blue-300">
                      Comment
                    </Badge>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-slate-700 text-xs">MJ</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">Mike Johnson</span> achieved LCP goal of under 2.5s
                      </p>
                      <p className="text-xs text-slate-500">1 day ago</p>
                    </div>
                    <Badge variant="outline" className="bg-purple-900/50 text-purple-300">
                      Goal Achieved
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-cyan-400" />
                  Team Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-400 mb-2">Team Average Score</h4>
                    <div className="text-2xl font-bold">87.5</div>
                    <p className="text-sm text-slate-400">+5.2 from last week</p>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-400 mb-2">Goals Completed</h4>
                    <div className="text-2xl font-bold">12/15</div>
                    <p className="text-sm text-slate-400">80% completion rate</p>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-400 mb-2">Optimizations Applied</h4>
                    <div className="text-2xl font-bold">34</div>
                    <p className="text-sm text-slate-400">This month</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-4">Top Contributors</h4>
                  <div className="space-y-3">
                    {members.slice(0, 3).map((member, index) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-slate-700 text-xs">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{member.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-400">{member.contributions}</div>
                          <div className="text-xs text-slate-500">contributions</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Settings, BarChart3, Trophy, Calendar, Upload } from "lucide-react"
import { useApi } from "@/lib/api"

interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  joined_date: string
  performance_score: number
  total_optimizations: number
  goals_completed: number
  current_streak: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earned_date: string
  category: "performance" | "collaboration" | "consistency"
}

interface Activity {
  id: string
  type: "optimization" | "goal_completed" | "suggestion_implemented"
  description: string
  timestamp: string
  impact_score: number
}

export default function ProfilePage() {
  const { getUserProfile, updateProfile, getUserAchievements, getUserActivity } = useApi()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
  })

  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    try {
      const [profileData, achievementsData, activitiesData] = await Promise.all([
        getUserProfile(),
        getUserAchievements(),
        getUserActivity(),
      ])
      setProfile(profileData)
      setAchievements(achievementsData)
      setActivities(activitiesData)
      setEditForm({
        name: profileData.name,
        email: profileData.email,
      })
    } catch (error) {
      console.error("Failed to load profile data:", error)
    }
  }

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editForm)
      setIsEditing(false)
      loadProfileData()
    } catch (error) {
      console.error("Failed to update profile:", error)
    }
  }

  const getAchievementIcon = (category: string) => {
    switch (category) {
      case "performance":
        return "🚀"
      case "collaboration":
        return "🤝"
      case "consistency":
        return "🔥"
      default:
        return "🏆"
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "optimization":
        return "⚡"
      case "goal_completed":
        return "🎯"
      case "suggestion_implemented":
        return "💡"
      default:
        return "📈"
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Profile
          </h1>
          <p className="text-xl text-slate-300">Manage your account and track your performance optimization journey</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-slate-700 text-2xl">
                      {profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">{profile.name}</CardTitle>
                <CardDescription>{profile.email}</CardDescription>
                <Badge className="bg-blue-900/50 text-blue-300 mt-2">{profile.role}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-slate-900/50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">{profile.performance_score}</div>
                    <div className="text-xs text-slate-400">Performance Score</div>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">{profile.current_streak}</div>
                    <div className="text-xs text-slate-400">Day Streak</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Optimizations</span>
                    <span className="font-medium">{profile.total_optimizations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Goals Completed</span>
                    <span className="font-medium">{profile.goals_completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Member Since</span>
                    <span className="font-medium">{profile.joined_date}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-slate-600 hover:bg-slate-700 bg-transparent"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-400" />
                      Performance Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-900/50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-400 mb-2">This Week</h4>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-sm text-slate-400">Optimizations applied</p>
                      </div>
                      <div className="bg-slate-900/50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-400 mb-2">This Month</h4>
                        <div className="text-2xl font-bold">45</div>
                        <p className="text-sm text-slate-400">Performance improvements</p>
                      </div>
                      <div className="bg-slate-900/50 p-4 rounded-lg">
                        <h4 className="font-medium text-purple-400 mb-2">Impact Score</h4>
                        <div className="text-2xl font-bold">892</div>
                        <p className="text-sm text-slate-400">Total impact points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle>Recent Milestones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                        <div className="text-2xl">🎯</div>
                        <div>
                          <h4 className="font-medium">LCP Goal Achieved</h4>
                          <p className="text-sm text-slate-400">Reduced LCP to under 2.5s across all pages</p>
                        </div>
                        <Badge variant="outline" className="bg-green-900/50 text-green-300 ml-auto">
                          Completed
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                        <div className="text-2xl">⚡</div>
                        <div>
                          <h4 className="font-medium">Bundle Size Optimization</h4>
                          <p className="text-sm text-slate-400">Reduced bundle size by 35% using code splitting</p>
                        </div>
                        <Badge variant="outline" className="bg-blue-900/50 text-blue-300 ml-auto">
                          Recent
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-400" />
                      Achievements ({achievements.length})
                    </CardTitle>
                    <CardDescription>Your performance optimization milestones and accomplishments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map((achievement) => (
                        <div key={achievement.id} className="p-4 bg-slate-900/50 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">{getAchievementIcon(achievement.category)}</div>
                            <div className="flex-1">
                              <h4 className="font-medium">{achievement.title}</h4>
                              <p className="text-sm text-slate-400 mb-2">{achievement.description}</p>
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                  {achievement.category}
                                </Badge>
                                <span className="text-xs text-slate-500">{achievement.earned_date}</span>
                              </div>
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
                      <Calendar className="h-5 w-5 text-green-400" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg">
                          <div className="text-xl">{getActivityIcon(activity.type)}</div>
                          <div className="flex-1">
                            <p className="text-sm">{activity.description}</p>
                            <p className="text-xs text-slate-500">{activity.timestamp}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-blue-400">+{activity.impact_score}</div>
                            <div className="text-xs text-slate-500">impact</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-purple-400" />
                      Profile Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Full Name</Label>
                          <Input
                            value={editForm.name}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                            className="bg-slate-900/50 border-slate-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email Address</Label>
                          <Input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                            className="bg-slate-900/50 border-slate-600"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">
                            Save Changes
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            className="border-slate-600 hover:bg-slate-700"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-slate-400">Full Name</Label>
                          <p className="text-lg">{profile.name}</p>
                        </div>
                        <div>
                          <Label className="text-slate-400">Email Address</Label>
                          <p className="text-lg">{profile.email}</p>
                        </div>
                        <div>
                          <Label className="text-slate-400">Role</Label>
                          <p className="text-lg">{profile.role}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle>Avatar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-slate-700 text-xl">
                          {profile.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <Button variant="outline" className="border-slate-600 hover:bg-slate-700 bg-transparent">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload New Avatar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

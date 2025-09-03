"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Zap, Users, Database, Code } from "lucide-react"
import { useApi } from "@/lib/api"

export default function SettingsPage() {
  const { updateSettings, getSettings } = useApi()
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      performance_alerts: true,
      ai_suggestions: true,
      team_updates: false,
    },
    performance: {
      monitoring_interval: 5000,
      alert_threshold_lcp: 2500,
      alert_threshold_fid: 100,
      alert_threshold_cls: 0.1,
      auto_optimization: false,
    },
    ai: {
      analysis_frequency: "hourly",
      suggestion_level: "detailed",
      auto_apply_safe_optimizations: false,
    },
    team: {
      share_insights: true,
      allow_comments: true,
      public_dashboard: false,
    },
  })

  const handleSave = async () => {
    try {
      await updateSettings(settings)
      // Show success message
    } catch (error) {
      // Show error message
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-xl text-slate-300">Configure PerfMaster to match your workflow and preferences</p>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="ai">AI Settings</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-400" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose how and when you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Email Notifications</Label>
                      <p className="text-sm text-slate-400">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          notifications: { ...prev.notifications, email: checked },
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Push Notifications</Label>
                      <p className="text-sm text-slate-400">Browser push notifications</p>
                    </div>
                    <Switch
                      checked={settings.notifications.push}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          notifications: { ...prev.notifications, push: checked },
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Performance Alerts</Label>
                      <p className="text-sm text-slate-400">Alerts for performance issues</p>
                    </div>
                    <Switch
                      checked={settings.notifications.performance_alerts}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          notifications: { ...prev.notifications, performance_alerts: checked },
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">AI Suggestions</Label>
                      <p className="text-sm text-slate-400">New optimization suggestions</p>
                    </div>
                    <Switch
                      checked={settings.notifications.ai_suggestions}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          notifications: { ...prev.notifications, ai_suggestions: checked },
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Team Updates</Label>
                      <p className="text-sm text-slate-400">Team member activities and comments</p>
                    </div>
                    <Switch
                      checked={settings.notifications.team_updates}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          notifications: { ...prev.notifications, team_updates: checked },
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-400" />
                  Performance Monitoring
                </CardTitle>
                <CardDescription>Configure performance monitoring and alert thresholds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Monitoring Interval (ms)</Label>
                    <div className="px-3">
                      <Slider
                        value={[settings.performance.monitoring_interval]}
                        onValueChange={([value]) =>
                          setSettings((prev) => ({
                            ...prev,
                            performance: { ...prev.performance, monitoring_interval: value },
                          }))
                        }
                        max={30000}
                        min={1000}
                        step={1000}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-slate-400 mt-1">
                        <span>1s</span>
                        <span>{settings.performance.monitoring_interval}ms</span>
                        <span>30s</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>LCP Alert Threshold (ms)</Label>
                      <Input
                        type="number"
                        value={settings.performance.alert_threshold_lcp}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            performance: { ...prev.performance, alert_threshold_lcp: Number.parseInt(e.target.value) },
                          }))
                        }
                        className="bg-slate-900/50 border-slate-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>FID Alert Threshold (ms)</Label>
                      <Input
                        type="number"
                        value={settings.performance.alert_threshold_fid}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            performance: { ...prev.performance, alert_threshold_fid: Number.parseInt(e.target.value) },
                          }))
                        }
                        className="bg-slate-900/50 border-slate-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>CLS Alert Threshold</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={settings.performance.alert_threshold_cls}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            performance: {
                              ...prev.performance,
                              alert_threshold_cls: Number.parseFloat(e.target.value),
                            },
                          }))
                        }
                        className="bg-slate-900/50 border-slate-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Auto-Optimization</Label>
                      <p className="text-sm text-slate-400">Automatically apply safe performance optimizations</p>
                    </div>
                    <Switch
                      checked={settings.performance.auto_optimization}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          performance: { ...prev.performance, auto_optimization: checked },
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-green-400" />
                  AI Analysis Settings
                </CardTitle>
                <CardDescription>Configure AI-powered code analysis and suggestions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Analysis Frequency</Label>
                    <Select
                      value={settings.ai.analysis_frequency}
                      onValueChange={(value) =>
                        setSettings((prev) => ({
                          ...prev,
                          ai: { ...prev.ai, analysis_frequency: value },
                        }))
                      }
                    >
                      <SelectTrigger className="bg-slate-900/50 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Suggestion Detail Level</Label>
                    <Select
                      value={settings.ai.suggestion_level}
                      onValueChange={(value) =>
                        setSettings((prev) => ({
                          ...prev,
                          ai: { ...prev.ai, suggestion_level: value },
                        }))
                      }
                    >
                      <SelectTrigger className="bg-slate-900/50 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                        <SelectItem value="comprehensive">Comprehensive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Auto-Apply Safe Optimizations</Label>
                      <p className="text-sm text-slate-400">Automatically implement low-risk optimizations</p>
                    </div>
                    <Switch
                      checked={settings.ai.auto_apply_safe_optimizations}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          ai: { ...prev.ai, auto_apply_safe_optimizations: checked },
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-400" />
                  Team Collaboration
                </CardTitle>
                <CardDescription>Manage team sharing and collaboration features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Share Insights</Label>
                      <p className="text-sm text-slate-400">Allow team members to share performance insights</p>
                    </div>
                    <Switch
                      checked={settings.team.share_insights}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          team: { ...prev.team, share_insights: checked },
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Allow Comments</Label>
                      <p className="text-sm text-slate-400">Enable commenting on performance data</p>
                    </div>
                    <Switch
                      checked={settings.team.allow_comments}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          team: { ...prev.team, allow_comments: checked },
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Public Dashboard</Label>
                      <p className="text-sm text-slate-400">Make dashboard publicly accessible</p>
                    </div>
                    <Switch
                      checked={settings.team.public_dashboard}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          team: { ...prev.team, public_dashboard: checked },
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-cyan-400" />
                  Integrations
                </CardTitle>
                <CardDescription>Connect PerfMaster with your development tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">GitHub</h4>
                      <Badge variant="outline" className="bg-green-900/50 text-green-300">
                        Connected
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">
                      Sync performance data with GitHub commits and pull requests
                    </p>
                    <Button variant="outline" size="sm" className="border-slate-600 bg-transparent">
                      Configure
                    </Button>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Slack</h4>
                      <Badge variant="outline" className="bg-slate-600 text-slate-300">
                        Not Connected
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">Receive performance alerts and updates in Slack</p>
                    <Button variant="outline" size="sm" className="border-slate-600 bg-transparent">
                      Connect
                    </Button>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Vercel</h4>
                      <Badge variant="outline" className="bg-green-900/50 text-green-300">
                        Connected
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">
                      Monitor deployments and track performance across environments
                    </p>
                    <Button variant="outline" size="sm" className="border-slate-600 bg-transparent">
                      Configure
                    </Button>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Jira</h4>
                      <Badge variant="outline" className="bg-slate-600 text-slate-300">
                        Not Connected
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">Create performance improvement tickets automatically</p>
                    <Button variant="outline" size="sm" className="border-slate-600 bg-transparent">
                      Connect
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import { 
  BookOpen, 
  Code, 
  Zap, 
  Users, 
  BarChart3, 
  Shield, 
  ArrowRight, 
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Cpu,
  HardDrive,
  Globe,
  Key,
  Copy,
  Check
} from "lucide-react"

export default function DocsPage() {
  const [apiKey, setApiKey] = useState('')
  const [projectId, setProjectId] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateApiKey = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'SDK Generated Key' })
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate API key')
      }
      
      const data = await response.json()
      setApiKey(data.key)
      setProjectId(data.projectId)
    } catch (error) {
      console.error('Failed to generate API key:', error)
      alert('Failed to generate API key. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            PerfMaster Documentation
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            AI-powered performance monitoring platform that helps developers build faster, more reliable web applications
          </p>
        </div>

        {/* What PerfMaster Does */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Zap className="h-6 w-6 text-yellow-400" />
              What PerfMaster Does
            </CardTitle>
            <CardDescription className="text-lg">
              PerfMaster is an intelligent performance monitoring and optimization platform designed specifically for web developers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-400">🔍 Real-Time Performance Monitoring</h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Continuous monitoring of Core Web Vitals (LCP, FID, CLS, FCP, TTFB)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Live tracking of memory usage, CPU utilization, and bundle sizes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Real-time performance alerts and notifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Historical performance trend analysis</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-400">🤖 AI-Powered Optimization</h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Intelligent code analysis for performance bottlenecks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Automated optimization suggestions with code examples</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Impact estimation for each optimization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>One-click code optimization implementation</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-400">👥 Team Collaboration</h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Shared performance insights across development teams</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Real-time collaboration on optimization efforts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Team performance goals and progress tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Role-based access control and permissions</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-orange-400">🚀 Developer Experience</h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Simple SDK integration with minimal setup</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Comprehensive REST API and WebSocket support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Interactive dashboards with detailed analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Custom metrics and alerting configurations</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <ArrowRight className="h-6 w-6 text-blue-400" />
              How PerfMaster Works
            </CardTitle>
            <CardDescription className="text-lg">
              Understanding the complete workflow from data collection to optimization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-500/20 rounded-full">
                    <span className="text-blue-400 font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">Data Collection</h3>
                    <p className="text-slate-300 mb-3">
                      PerfMaster SDK integrates with your application to collect performance data automatically.
                    </p>
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium">Browser Integration</span>
                      </div>
                      <ul className="text-sm text-slate-400 space-y-1">
                        <li>• Core Web Vitals API monitoring</li>
                        <li>• Navigation timing and resource loading</li>
                        <li>• User interaction tracking</li>
                        <li>• Error and exception monitoring</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-500/20 rounded-full">
                    <span className="text-purple-400 font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-400 mb-2">Real-Time Processing</h3>
                    <p className="text-slate-300 mb-3">
                      Data is processed in real-time using WebSocket connections and background tasks.
                    </p>
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-purple-400" />
                        <span className="text-sm font-medium">Live Processing</span>
                      </div>
                      <ul className="text-sm text-slate-400 space-y-1">
                        <li>• WebSocket streaming for live updates</li>
                        <li>• Celery background task processing</li>
                        <li>• Redis caching for performance</li>
                        <li>• Real-time alerting system</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-500/20 rounded-full">
                    <span className="text-green-400 font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-400 mb-2">AI Analysis</h3>
                    <p className="text-slate-300 mb-3">
                      Advanced AI models analyze performance data and code patterns.
                    </p>
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Cpu className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium">Machine Learning</span>
                      </div>
                      <ul className="text-sm text-slate-400 space-y-1">
                        <li>• Pattern recognition in performance data</li>
                        <li>• Code analysis for optimization opportunities</li>
                        <li>• Predictive modeling for future issues</li>
                        <li>• Automated suggestion generation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-500/20 rounded-full">
                    <span className="text-orange-400 font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-orange-400 mb-2">Optimization Delivery</h3>
                    <p className="text-slate-300 mb-3">
                      Actionable insights and code optimizations delivered to developers.
                    </p>
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <HardDrive className="h-4 w-4 text-orange-400" />
                        <span className="text-sm font-medium">Developer Tools</span>
                      </div>
                      <ul className="text-sm text-slate-400 space-y-1">
                        <li>• Interactive dashboard with visualizations</li>
                        <li>• Code examples and implementation guides</li>
                        <li>• Impact estimation and ROI calculations</li>
                        <li>• One-click optimization application</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="getting-started" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-slate-800/50">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
            <TabsTrigger value="real-time">Real-time</TabsTrigger>
            <TabsTrigger value="team">Team Features</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-400" />
                  Getting Started with PerfMaster
                </CardTitle>
                <CardDescription>Learn how to set up and start using PerfMaster for your projects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">1. Generate Your API Key</h3>
                    <p className="text-slate-300 mb-3">
                      Click the button below to generate your personal API key and project ID for SDK integration.
                    </p>
                    <div className="space-y-4">
                      <Button 
                        onClick={generateApiKey} 
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Key className="h-4 w-4 mr-2" />
                        {loading ? 'Generating...' : 'Generate API Key'}
                      </Button>
                      
                      {apiKey && projectId && (
                        <div className="space-y-3">
                          <div className="bg-slate-900/50 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-green-400">Your API Key:</h4>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => copyToClipboard(apiKey)}
                                className="h-6 w-6 p-0"
                              >
                                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              </Button>
                            </div>
                            <code className="text-green-400 text-sm break-all">{apiKey}</code>
                          </div>
                          
                          <div className="bg-slate-900/50 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-blue-400">Your Project ID:</h4>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => copyToClipboard(projectId)}
                                className="h-6 w-6 p-0"
                              >
                                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              </Button>
                            </div>
                            <code className="text-blue-400 text-sm">{projectId}</code>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">2. Install the SDK</h3>
                    <p className="text-slate-300 mb-3">
                      Install PerfMaster SDK in your frontend project.
                    </p>
                    <div className="bg-slate-900 p-4 rounded-lg">
                      <code className="text-green-400">
                        npm install perfmaster-sdk
                        <br /># or
                        <br />
                        yarn add perfmaster-sdk
                      </code>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">3. Initialize SDK</h3>
                    <p className="text-slate-300 mb-3">
                      Add PerfMaster to your application's main entry point with your generated credentials.
                    </p>
                    <div className="bg-slate-900 p-4 rounded-lg">
                      <code className="text-green-400">
                        {`import { PerfMaster } from 'perfmaster-sdk';

PerfMaster.init({
  apiKey: '${apiKey || 'your-generated-api-key'}',
  projectId: '${projectId || 'your-project-id'}',
  environment: 'production'
});`}
                      </code>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">4. Start Monitoring</h3>
                    <p className="text-slate-300 mb-3">
                      PerfMaster automatically starts collecting Core Web Vitals, component render times, and user interactions.
                    </p>
                    <Badge variant="secondary" className="bg-green-900/50 text-green-300">
                      Automatic Collection Enabled
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Key Features Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-400" />
                      <span className="font-medium">Real-time Performance Monitoring</span>
                    </div>
                    <p className="text-sm text-slate-400">
                      Live tracking of Core Web Vitals, component performance, and user experience metrics
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-purple-400" />
                      <span className="font-medium">AI-Powered Analysis</span>
                    </div>
                    <p className="text-sm text-slate-400">
                      Intelligent code analysis with optimization suggestions and performance insights
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-400" />
                      <span className="font-medium">Team Collaboration</span>
                    </div>
                    <p className="text-sm text-slate-400">
                      Share insights, collaborate on optimizations, and track team performance goals
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-orange-400" />
                      <span className="font-medium">Performance Alerts</span>
                    </div>
                    <p className="text-sm text-slate-400">
                      Automated alerts for performance regressions and optimization opportunities
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ... rest of the tabs remain the same ... */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Dashboard content */}
          </TabsContent>

          <TabsContent value="ai-analysis" className="space-y-6">
            {/* AI Analysis content */}
          </TabsContent>

          <TabsContent value="real-time" className="space-y-6">
            {/* Real-time content */}
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            {/* Team content */}
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            {/* API content */}
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
              <p className="text-slate-300 mb-4">
                Our support team is here to help you get the most out of PerfMaster.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" className="border-slate-600 hover:bg-slate-700 bg-transparent">
                  Contact Support
                </Button>
                <Button variant="outline" className="border-slate-600 hover:bg-slate-700 bg-transparent">
                  Join Community
                </Button>
                <Button variant="outline" className="border-slate-600 hover:bg-slate-700 bg-transparent">
                  View Examples
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
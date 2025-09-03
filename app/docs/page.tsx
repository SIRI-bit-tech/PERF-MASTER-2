"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Code, Zap, Users, BarChart3, Shield } from "lucide-react"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            PerfMaster Documentation
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Complete guide to using PerfMaster's AI-powered real-time performance analysis platform
          </p>
        </div>

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
                    <h3 className="text-lg font-semibold mb-2">1. Project Setup</h3>
                    <p className="text-slate-300 mb-3">
                      Install the PerfMaster SDK in your frontend project to start collecting performance data.
                    </p>
                    <div className="bg-slate-900 p-4 rounded-lg">
                      <code className="text-green-400">
                        npm install @perfmaster/sdk
                        <br /># or
                        <br />
                        yarn add @perfmaster/sdk
                      </code>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">2. Initialize SDK</h3>
                    <p className="text-slate-300 mb-3">Add PerfMaster to your application entry point.</p>
                    <div className="bg-slate-900 p-4 rounded-lg">
                      <code className="text-green-400">
                        {`import { PerfMaster } from '@perfmaster/sdk';

PerfMaster.init({
  apiKey: 'your-api-key',
  projectId: 'your-project-id',
  environment: 'production'
});`}
                      </code>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">3. Start Monitoring</h3>
                    <p className="text-slate-300 mb-3">
                      PerfMaster automatically starts collecting Core Web Vitals, component render times, and user
                      interactions.
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

          <TabsContent value="dashboard" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Dashboard Overview</CardTitle>
                <CardDescription>Understanding your performance dashboard and key metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Core Web Vitals</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-400 mb-2">Largest Contentful Paint (LCP)</h4>
                      <p className="text-sm text-slate-300">
                        Measures loading performance. Good LCP is 2.5 seconds or faster.
                      </p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-400 mb-2">First Input Delay (FID)</h4>
                      <p className="text-sm text-slate-300">
                        Measures interactivity. Good FID is 100 milliseconds or less.
                      </p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-400 mb-2">Cumulative Layout Shift (CLS)</h4>
                      <p className="text-sm text-slate-300">Measures visual stability. Good CLS is 0.1 or less.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Dashboard Sections</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">
                        1
                      </Badge>
                      <div>
                        <h4 className="font-medium">Performance Overview</h4>
                        <p className="text-sm text-slate-400">Real-time metrics and performance score</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">
                        2
                      </Badge>
                      <div>
                        <h4 className="font-medium">Component Analysis</h4>
                        <p className="text-sm text-slate-400">Interactive component tree with performance data</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">
                        3
                      </Badge>
                      <div>
                        <h4 className="font-medium">AI Suggestions</h4>
                        <p className="text-sm text-slate-400">Intelligent optimization recommendations</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">
                        4
                      </Badge>
                      <div>
                        <h4 className="font-medium">Real-time Monitoring</h4>
                        <p className="text-sm text-slate-400">Live performance data and alerts</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-analysis" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-400" />
                  AI-Powered Performance Analysis
                </CardTitle>
                <CardDescription>How PerfMaster's AI engine analyzes and optimizes your code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Analysis Types</h3>
                  <div className="space-y-4">
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-400 mb-2">Code Analysis</h4>
                      <p className="text-sm text-slate-300 mb-2">
                        AI examines your React components, hooks, and JavaScript code for performance bottlenecks.
                      </p>
                      <ul className="text-sm text-slate-400 space-y-1">
                        <li>• Unnecessary re-renders detection</li>
                        <li>• Memory leak identification</li>
                        <li>• Bundle size optimization</li>
                        <li>• Async operation improvements</li>
                      </ul>
                    </div>

                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-400 mb-2">Performance Pattern Recognition</h4>
                      <p className="text-sm text-slate-300 mb-2">
                        Machine learning models identify performance anti-patterns and suggest best practices.
                      </p>
                      <ul className="text-sm text-slate-400 space-y-1">
                        <li>• Component optimization strategies</li>
                        <li>• State management improvements</li>
                        <li>• Loading strategy recommendations</li>
                        <li>• Caching opportunities</li>
                      </ul>
                    </div>

                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-400 mb-2">Predictive Analysis</h4>
                      <p className="text-sm text-slate-300 mb-2">
                        AI predicts performance impact of code changes before deployment.
                      </p>
                      <ul className="text-sm text-slate-400 space-y-1">
                        <li>• Performance regression prevention</li>
                        <li>• Optimization impact estimation</li>
                        <li>• Resource usage forecasting</li>
                        <li>• User experience predictions</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Using AI Suggestions</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">
                        1
                      </Badge>
                      <div>
                        <h4 className="font-medium">Review Suggestions</h4>
                        <p className="text-sm text-slate-400">AI provides detailed explanations and code examples</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">
                        2
                      </Badge>
                      <div>
                        <h4 className="font-medium">Implement Changes</h4>
                        <p className="text-sm text-slate-400">Apply suggested optimizations to your codebase</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">
                        3
                      </Badge>
                      <div>
                        <h4 className="font-medium">Measure Impact</h4>
                        <p className="text-sm text-slate-400">Track performance improvements in real-time</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="real-time" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Real-time Monitoring</CardTitle>
                <CardDescription>Live performance tracking and instant alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Live Data Collection</h3>
                  <p className="text-slate-300 mb-4">
                    PerfMaster continuously monitors your application's performance in real-time, providing instant
                    feedback on user experience metrics.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-400 mb-2">User Session Tracking</h4>
                      <ul className="text-sm text-slate-400 space-y-1">
                        <li>• Page load times</li>
                        <li>• User interactions</li>
                        <li>• Navigation patterns</li>
                        <li>• Error occurrences</li>
                      </ul>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-400 mb-2">System Metrics</h4>
                      <ul className="text-sm text-slate-400 space-y-1">
                        <li>• Memory usage</li>
                        <li>• CPU utilization</li>
                        <li>• Network requests</li>
                        <li>• Bundle sizes</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Alert System</h3>
                  <p className="text-slate-300 mb-4">
                    Configure intelligent alerts to be notified of performance issues before they impact users.
                  </p>
                  <div className="space-y-3">
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <h4 className="font-medium text-orange-400 mb-2">Performance Thresholds</h4>
                      <p className="text-sm text-slate-400">
                        Set custom thresholds for Core Web Vitals and receive alerts when metrics exceed acceptable
                        ranges.
                      </p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <h4 className="font-medium text-red-400 mb-2">Error Detection</h4>
                      <p className="text-sm text-slate-400">
                        Automatic detection of JavaScript errors, failed network requests, and performance regressions.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-400" />
                  Team Collaboration Features
                </CardTitle>
                <CardDescription>Collaborate with your team on performance optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Team Management</h3>
                  <div className="space-y-4">
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-400 mb-2">Role-Based Access</h4>
                      <p className="text-sm text-slate-300 mb-2">
                        Assign different roles to team members with appropriate permissions.
                      </p>
                      <ul className="text-sm text-slate-400 space-y-1">
                        <li>
                          • <strong>Admin:</strong> Full access to all features and settings
                        </li>
                        <li>
                          • <strong>Developer:</strong> View metrics, implement suggestions
                        </li>
                        <li>
                          • <strong>Viewer:</strong> Read-only access to dashboards
                        </li>
                      </ul>
                    </div>

                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-400 mb-2">Shared Insights</h4>
                      <p className="text-sm text-slate-300 mb-2">
                        Share performance insights and optimization suggestions with team members.
                      </p>
                      <ul className="text-sm text-slate-400 space-y-1">
                        <li>• Comment on performance issues</li>
                        <li>• Share optimization strategies</li>
                        <li>• Track implementation progress</li>
                        <li>• Collaborative problem solving</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Performance Goals</h3>
                  <p className="text-slate-300 mb-4">Set team-wide performance goals and track progress together.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-400 mb-2">Goal Setting</h4>
                      <ul className="text-sm text-slate-400 space-y-1">
                        <li>• Core Web Vitals targets</li>
                        <li>• Bundle size limits</li>
                        <li>• Performance score goals</li>
                        <li>• Custom metric thresholds</li>
                      </ul>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <h4 className="font-medium text-orange-400 mb-2">Progress Tracking</h4>
                      <ul className="text-sm text-slate-400 space-y-1">
                        <li>• Team performance dashboard</li>
                        <li>• Individual contributions</li>
                        <li>• Goal achievement metrics</li>
                        <li>• Historical progress data</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-blue-400" />
                  API Documentation
                </CardTitle>
                <CardDescription>Integrate PerfMaster with your development workflow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">REST API Endpoints</h3>
                  <div className="space-y-4">
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-green-900/50 text-green-300">
                          GET
                        </Badge>
                        <code className="text-blue-400">/api/v1/metrics</code>
                      </div>
                      <p className="text-sm text-slate-300 mb-2">Retrieve performance metrics for a project</p>
                      <div className="bg-slate-800 p-3 rounded text-xs">
                        <code className="text-green-400">
                          {`curl -H "Authorization: Bearer YOUR_API_KEY" \\
     https://api.perfmaster.dev/v1/metrics?project_id=123`}
                        </code>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-blue-900/50 text-blue-300">
                          POST
                        </Badge>
                        <code className="text-blue-400">/api/v1/metrics</code>
                      </div>
                      <p className="text-sm text-slate-300 mb-2">Submit performance data</p>
                      <div className="bg-slate-800 p-3 rounded text-xs">
                        <code className="text-green-400">
                          {`curl -X POST -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     -d '{"lcp": 1200, "fid": 50, "cls": 0.05}' \\
     https://api.perfmaster.dev/v1/metrics`}
                        </code>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-purple-900/50 text-purple-300">
                          GET
                        </Badge>
                        <code className="text-blue-400">/api/v1/suggestions</code>
                      </div>
                      <p className="text-sm text-slate-300 mb-2">Get AI optimization suggestions</p>
                      <div className="bg-slate-800 p-3 rounded text-xs">
                        <code className="text-green-400">
                          {`curl -H "Authorization: Bearer YOUR_API_KEY" \\
     https://api.perfmaster.dev/v1/suggestions?project_id=123`}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">WebSocket API</h3>
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-400 mb-2">Real-time Connection</h4>
                    <p className="text-sm text-slate-300 mb-3">
                      Connect to real-time performance data streams using WebSocket.
                    </p>
                    <div className="bg-slate-800 p-3 rounded text-xs">
                      <code className="text-green-400">
                        {`const ws = new WebSocket('wss://api.perfmaster.dev/ws/performance/');
ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Real-time metrics:', data);
};`}
                      </code>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">SDK Integration</h3>
                  <div className="space-y-4">
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-400 mb-2">React Integration</h4>
                      <div className="bg-slate-800 p-3 rounded text-xs">
                        <code className="text-green-400">
                          {`import { usePerfMaster } from '@perfmaster/react';

function MyComponent() {
  const { trackMetric } = usePerfMaster();
  
  useEffect(() => {
    trackMetric('component_render', Date.now());
  }, []);
  
  return <div>My Component</div>;
}`}
                        </code>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-400 mb-2">Next.js Integration</h4>
                      <div className="bg-slate-800 p-3 rounded text-xs">
                        <code className="text-green-400">
                          {`// pages/_app.js
import { PerfMasterProvider } from '@perfmaster/nextjs';

export default function App({ Component, pageProps }) {
  return (
    <PerfMasterProvider apiKey="your-api-key">
      <Component {...pageProps} />
    </PerfMasterProvider>
  );
}`}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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

"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  BarChart3, 
  Shield, 
  ArrowRight, 
  CheckCircle, 
  Github,
  Sparkles,
  TrendingUp,
  Cpu,
  Globe
} from "lucide-react"

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/analytics")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                PerfMaster
              </h1>
            </div>
            
            <h2 className="text-4xl font-bold mb-6">
              AI-Powered Performance Monitoring
            </h2>
            
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Real-time performance monitoring and optimization for React applications. 
              Get instant insights, automated suggestions, and live metrics to build faster, more reliable apps.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/auth/register">
                  <Github className="mr-2 h-5 w-5" />
                  Get Started Free
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-slate-600 hover:bg-slate-800">
                <Link href="/docs">
                  View Documentation
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <Badge variant="secondary" className="bg-green-900/50 text-green-300">
                <CheckCircle className="w-4 h-4 mr-1" />
                Core Web Vitals
              </Badge>
              <Badge variant="secondary" className="bg-blue-900/50 text-blue-300">
                <TrendingUp className="w-4 h-4 mr-1" />
                Real-time Monitoring
              </Badge>
              <Badge variant="secondary" className="bg-purple-900/50 text-purple-300">
                <Sparkles className="w-4 h-4 mr-1" />
                AI Optimization
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold mb-4">Why Choose PerfMaster?</h3>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Join thousands of developers who trust PerfMaster for their performance monitoring needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Real-Time Analytics</h4>
              <p className="text-slate-300">
                Live performance metrics with instant updates and historical trend analysis.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Cpu className="h-6 w-6 text-purple-400" />
              </div>
              <h4 className="text-xl font-semibold mb-2">AI-Powered Insights</h4>
              <p className="text-slate-300">
                Intelligent code analysis with automated optimization suggestions and impact predictions.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Enterprise Security</h4>
              <p className="text-slate-300">
                OAuth authentication, secure API keys, and enterprise-grade data protection.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-slate-700">
          <CardContent className="p-8 text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Optimize Your App?</h3>
            <p className="text-slate-300 mb-6 max-w-xl mx-auto">
              Join PerfMaster today and start monitoring your application's performance with AI-powered insights.
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link href="/auth/register">
                Start Monitoring Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
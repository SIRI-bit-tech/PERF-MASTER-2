const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export interface PerformanceMetrics {
  lcp: number
  fid: number
  cls: number
  fcp: number
  ttfb: number
  memory_usage: number
  cpu_usage: number
  bundle_size: number
  render_time: number
  network_requests: number
}

export interface AIAnalysisResult {
  analysis_id: string
  project_id: string
  component_id: string
  bottlenecks: Array<{
    type: string
    severity: "low" | "medium" | "high"
    description: string
    suggestion: string
  }>
  suggestions: Array<{
    type: string
    description: string
    code_changes: any
    impact_estimate: {
      performance_gain: number
      implementation_effort: string
    }
    priority: number
  }>
  confidence_score: number
  status: "pending" | "processing" | "completed" | "failed"
  created_at: string
}

export interface OptimizationSuggestion {
  suggestion_id: string
  type: string
  description: string
  code_changes: any
  impact_estimate: {
    performance_gain: number
    implementation_effort: string
  }
  status: "pending" | "testing" | "applied" | "rejected"
  priority: number
  created_at: string
}

class APIClient {
  private baseURL: string
  private token: string | null = null

  constructor() {
    this.baseURL = API_BASE_URL
  }

  setAuthToken(token: string) {
    this.token = token
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      (headers as Record<string, string>).Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Performance Analysis
  async analyzePerformance(metrics: PerformanceMetrics): Promise<{
    performance_score: number
    anomalies: Array<any>
    optimizations: Array<any>
    trends: any
    analysis_timestamp: string
    confidence_level: number
  }> {
    return this.request("/performance/analyze/", {
      method: "POST",
      body: JSON.stringify(metrics),
    })
  }

  async getPerformanceHistory(projectId: string, timeRange = "7d"): Promise<any[]> {
    return this.request(`/performance/history/?project_id=${projectId}&range=${timeRange}`)
  }

  // AI Analysis
  async analyzeComponent(data: {
    project_id: string
    component_path: string
    source_code: string
    framework_version?: string
    analysis_type?: string
  }): Promise<{ task_id: string; status: string }> {
    return this.request("/analysis/analyze_component/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getAIAnalyses(projectId?: string): Promise<AIAnalysisResult[]> {
    const query = projectId ? `?project_id=${projectId}` : ""
    return this.request(`/analysis/${query}`)
  }

  async getAnalysisById(analysisId: string): Promise<AIAnalysisResult> {
    return this.request(`/analysis/${analysisId}/`)
  }

  async regenerateAnalysis(analysisId: string, data: any): Promise<{ task_id: string }> {
    return this.request(`/analysis/${analysisId}/regenerate/`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Optimization Suggestions
  async getOptimizationSuggestions(projectId?: string): Promise<OptimizationSuggestion[]> {
    const query = projectId ? `?project_id=${projectId}` : ""
    return this.request(`/suggestions/${query}`)
  }

  async getPendingSuggestions(): Promise<Record<string, OptimizationSuggestion[]>> {
    return this.request("/suggestions/pending/")
  }

  async applySuggestion(
    suggestionId: string,
    options: {
      auto_apply?: boolean
      create_backup?: boolean
    } = {},
  ): Promise<{ task_id: string }> {
    return this.request(`/suggestions/${suggestionId}/apply_single/`, {
      method: "POST",
      body: JSON.stringify(options),
    })
  }

  async applySuggestions(
    suggestionIds: string[],
    options: {
      auto_apply?: boolean
      create_backup?: boolean
    } = {},
  ): Promise<{ task_id: string; suggestion_count: number }> {
    return this.request("/suggestions/apply_suggestions/", {
      method: "POST",
      body: JSON.stringify({
        suggestion_ids: suggestionIds,
        ...options,
      }),
    })
  }

  async getImpactSummary(): Promise<{
    performance_improvements: number
    bundle_size_reductions: number
    memory_optimizations: number
    suggestions_applied: number
  }> {
    return this.request("/suggestions/impact_summary/")
  }

  // Real-time WebSocket connection
  createWebSocketConnection(projectId: string): WebSocket {
    const wsUrl = `ws://localhost:8000/ws/performance/${projectId}/`
    return new WebSocket(wsUrl)
  }

  // Projects
  async getProjects(): Promise<any[]> {
    return this.request("/projects/")
  }

  async createProject(data: any): Promise<any> {
    return this.request("/projects/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Team Management
  async getTeamMembers(): Promise<any[]> {
    return this.request("/team/members/")
  }

  async inviteTeamMember(email: string, role: string): Promise<any> {
    return this.request("/team/invite/", {
      method: "POST",
      body: JSON.stringify({ email, role }),
    })
  }

  async updateMemberRole(memberId: string, role: string): Promise<any> {
    return this.request(`/team/members/${memberId}/`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    })
  }

  async getTeamGoals(): Promise<any[]> {
    return this.request("/team/goals/")
  }

  // User Profile
  async getUserProfile(): Promise<any> {
    return this.request("/user/profile/")
  }

  async updateProfile(data: any): Promise<any> {
    return this.request("/user/profile/", {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async getUserAchievements(): Promise<any[]> {
    return this.request("/user/achievements/")
  }

  async getUserActivity(): Promise<any[]> {
    return this.request("/user/activity/")
  }

  // Settings
  async getSettings(): Promise<any> {
    return this.request("/user/settings/")
  }

  async updateSettings(settings: any): Promise<any> {
    return this.request("/user/settings/", {
      method: "PATCH",
      body: JSON.stringify(settings),
    })
  }

  // Analytics
  async getAnalytics(timeRange: string, projectId: string): Promise<any> {
    return this.request(`/analytics/?range=${timeRange}&project=${projectId}`)
  }
}

export const apiClient = new APIClient()

export function useApi() {
  return {
    // Authentication
    login: async (email: string, password: string) => {
      const response = await apiClient.request<{ token: string; user: any }>("/auth/login/", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })
      apiClient.setAuthToken(response.token)
      return response
    },

    register: async (name: string, email: string, password: string) => {
      return apiClient.request("/auth/register/", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      })
    },

    logout: async () => {
      await apiClient.request("/auth/logout/", { method: "POST" })
      apiClient.setAuthToken("")
    },

    // Performance Analysis
    analyzePerformance: apiClient.analyzePerformance.bind(apiClient),
    getPerformanceHistory: apiClient.getPerformanceHistory.bind(apiClient),

    // AI Analysis
    analyzeComponent: apiClient.analyzeComponent.bind(apiClient),
    getAIAnalyses: apiClient.getAIAnalyses.bind(apiClient),
    getAnalysisById: apiClient.getAnalysisById.bind(apiClient),
    regenerateAnalysis: apiClient.regenerateAnalysis.bind(apiClient),

    // Optimization Suggestions
    getOptimizationSuggestions: apiClient.getOptimizationSuggestions.bind(apiClient),
    getPendingSuggestions: apiClient.getPendingSuggestions.bind(apiClient),
    applySuggestion: apiClient.applySuggestion.bind(apiClient),
    applySuggestions: apiClient.applySuggestions.bind(apiClient),
    getImpactSummary: apiClient.getImpactSummary.bind(apiClient),

    // Projects
    getProjects: apiClient.getProjects.bind(apiClient),
    createProject: apiClient.createProject.bind(apiClient),

    // Team Management
    getTeamMembers: apiClient.getTeamMembers.bind(apiClient),
    inviteTeamMember: apiClient.inviteTeamMember.bind(apiClient),
    updateMemberRole: apiClient.updateMemberRole.bind(apiClient),
    getTeamGoals: apiClient.getTeamGoals.bind(apiClient),

    // User Profile
    getUserProfile: apiClient.getUserProfile.bind(apiClient),
    updateProfile: apiClient.updateProfile.bind(apiClient),
    getUserAchievements: apiClient.getUserAchievements.bind(apiClient),
    getUserActivity: apiClient.getUserActivity.bind(apiClient),

    // Settings
    getSettings: apiClient.getSettings.bind(apiClient),
    updateSettings: apiClient.updateSettings.bind(apiClient),

    // Analytics
    getAnalytics: apiClient.getAnalytics.bind(apiClient),

    // Real-time WebSocket
    createWebSocketConnection: apiClient.createWebSocketConnection.bind(apiClient),
  }
}
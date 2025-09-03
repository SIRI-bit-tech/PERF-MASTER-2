"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient, type AIAnalysisResult, type OptimizationSuggestion } from "@/lib/api"

export function useAIAnalysis(projectId?: string) {
  const [analyses, setAnalyses] = useState<AIAnalysisResult[]>([])
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalyses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getAIAnalyses(projectId)
      setAnalyses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analyses")
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const fetchSuggestions = useCallback(async () => {
    try {
      const data = await apiClient.getOptimizationSuggestions(projectId)
      setSuggestions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch suggestions")
    }
  }, [projectId])

  const analyzeComponent = useCallback(
    async (componentData: {
      project_id: string
      component_path: string
      source_code: string
      framework_version?: string
      analysis_type?: string
    }) => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiClient.analyzeComponent(componentData)

        // Poll for completion
        const pollInterval = setInterval(async () => {
          try {
            await fetchAnalyses()
            const latestAnalysis = analyses.find((a) => a.status === "completed")
            if (latestAnalysis) {
              clearInterval(pollInterval)
              setLoading(false)
            }
          } catch (err) {
            console.error("Polling error:", err)
          }
        }, 2000)

        return result
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed")
        setLoading(false)
        throw err
      }
    },
    [analyses, fetchAnalyses],
  )

  const applySuggestion = useCallback(
    async (
      suggestionId: string,
      options?: {
        auto_apply?: boolean
        create_backup?: boolean
      },
    ) => {
      try {
        const result = await apiClient.applySuggestion(suggestionId, options)
        await fetchSuggestions() // Refresh suggestions
        return result
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to apply suggestion")
        throw err
      }
    },
    [fetchSuggestions],
  )

  useEffect(() => {
    fetchAnalyses()
    fetchSuggestions()
  }, [fetchAnalyses, fetchSuggestions])

  return {
    analyses,
    suggestions,
    loading,
    error,
    analyzeComponent,
    applySuggestion,
    refetch: () => {
      fetchAnalyses()
      fetchSuggestions()
    },
  }
}

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
  }, [projectId]) // Only depends on projectId

  const fetchSuggestions = useCallback(async () => {
    try {
      const data = await apiClient.getOptimizationSuggestions(projectId)
      setSuggestions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch suggestions")
    }
  }, [projectId]) // Only depends on projectId

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

        // Poll for completion with proper cleanup
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

        // Clean up interval after 2 minutes to prevent infinite polling
        setTimeout(() => {
          clearInterval(pollInterval)
          setLoading(false)
        }, 120000)

        return result
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed")
        setLoading(false)
        throw err
      }
    },
    [analyses, fetchAnalyses], // This might cause issues - let's fix it
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

  // FIX: Remove the problematic useEffect that causes infinite loops
  // useEffect(() => {
  //   fetchAnalyses()
  //   fetchSuggestions()
  // }, [fetchAnalyses, fetchSuggestions])

  // Instead, only fetch on mount and when projectId changes
  useEffect(() => {
    if (projectId) {
      fetchAnalyses()
      fetchSuggestions()
    }
  }, [projectId]) // Only depend on projectId

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
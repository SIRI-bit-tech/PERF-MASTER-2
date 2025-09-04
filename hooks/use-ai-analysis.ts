"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { apiClient, type AIAnalysisResult, type OptimizationSuggestion } from "@/lib/api"

export function useAIAnalysis(projectId?: string) {
  const [analyses, setAnalyses] = useState<AIAnalysisResult[]>([])
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Use refs to prevent infinite loops
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isPollingRef = useRef(false)
  const hasInitializedRef = useRef(false)

  // Cleanup function
  const cleanup = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    isPollingRef.current = false
  }, [])

  // Fetch analyses - only depends on projectId
  const fetchAnalyses = useCallback(async () => {
    if (!projectId) return
    
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getAIAnalyses(projectId)
      setAnalyses(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analyses")
      setAnalyses([])
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // Fetch suggestions - only depends on projectId
  const fetchSuggestions = useCallback(async () => {
    if (!projectId) return
    
    try {
      const data = await apiClient.getOptimizationSuggestions(projectId)
      setSuggestions(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch suggestions")
      setSuggestions([])
    }
  }, [projectId])

  // Analyze component with proper polling
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
  
        // Simple polling - check every 3 seconds for 30 seconds max
        let attempts = 0
        const maxAttempts = 10
        
        const pollInterval = setInterval(async () => {
          attempts++
          
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval)
            setLoading(false)
            return
          }
  
          try {
            const analyses = await apiClient.getAIAnalyses(projectId)
            if (Array.isArray(analyses) && analyses.length > 0) {
              const completed = analyses.find(a => a.status === "completed")
              if (completed) {
                setAnalyses(analyses)
                clearInterval(pollInterval)
                setLoading(false)
                return
              }
            }
            setAnalyses(Array.isArray(analyses) ? analyses : [])
          } catch (err) {
            console.error("Polling error:", err)
          }
        }, 3000)
  
        return result
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed")
        setLoading(false)
        throw err
      }
    },
    [projectId], // Simpler dependencies
  )

  // Apply suggestion
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
        await fetchSuggestions()
        return result
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to apply suggestion")
        throw err
      }
    },
    [fetchSuggestions],
  )

  // Initialize data only once
  useEffect(() => {
    if (projectId && !hasInitializedRef.current) {
      hasInitializedRef.current = true
      console.log("Initializing data for project:", projectId)
      fetchAnalyses()
      fetchSuggestions()
    }
  }, [projectId, fetchAnalyses, fetchSuggestions])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("Cleaning up useAIAnalysis")
      cleanup()
    }
  }, [cleanup])

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
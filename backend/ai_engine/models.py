# Import AI-related models from the main perfmaster app
from perfmaster.models import (
    AIAnalysisResults,
    OptimizationSuggestions
)

# Re-export for convenience
__all__ = [
    'AIAnalysisResults',
    'OptimizationSuggestions'
]

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Avg, Count
from django.utils import timezone
from perfmaster.models import AIAnalysisResults, OptimizationSuggestions, Project
from .serializers import (
    AIAnalysisResultsSerializer, OptimizationSuggestionSerializer,
    ComponentAnalysisRequestSerializer, OptimizationApplicationSerializer
)
from .tasks import analyze_component_performance, apply_optimization_suggestions


class AIAnalysisViewSet(viewsets.ModelViewSet):
    serializer_class = AIAnalysisResultsSerializer
    permission_classes = [permissions.AllowAny]  # Anyone can use AI analysis

    def get_queryset(self):
        # Return all analyses (no user filtering for public access)
        # Removed prefetch_related('suggestions') because suggestions is a JSONField, not a related field
        return AIAnalysisResults.objects.all().select_related('project')

    @action(detail=False, methods=['post'])
    def analyze_component(self, request):
        """Trigger AI analysis for a specific component"""
        serializer = ComponentAnalysisRequestSerializer(
            data=request.data
            # No context needed since we removed user validation
        )
        serializer.is_valid(raise_exception=True)
        
        # Trigger async analysis task
        task = analyze_component_performance.delay(
            project_id=str(serializer.validated_data['project_id']),
            component_path=serializer.validated_data['component_path'],
            source_code=serializer.validated_data['source_code'],
            framework_version=serializer.validated_data['framework_version'],
            analysis_type=serializer.validated_data['analysis_type']
        )
        
        return Response({
            'message': 'Analysis started',
            'task_id': task.id,
            'status': 'processing'
        }, status=status.HTTP_202_ACCEPTED)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get analysis statistics"""
        total_analyses = self.get_queryset().count()
        completed_analyses = self.get_queryset().filter(status='completed').count()
        avg_confidence = self.get_queryset().filter(status='completed').aggregate(
            avg_confidence=Avg('confidence_score')
        )['avg_confidence'] or 0
        
        return Response({
            'total_analyses': total_analyses,
            'completed_analyses': completed_analyses,
            'completion_rate': (completed_analyses / total_analyses * 100) if total_analyses > 0 else 0,
            'average_confidence': round(avg_confidence, 2)
        })


class OptimizationSuggestionViewSet(viewsets.ModelViewSet):
    serializer_class = OptimizationSuggestionSerializer
    permission_classes = [permissions.AllowAny]  # Anyone can use suggestions

    def get_queryset(self):
        # Return all suggestions (no user filtering for public access)
        return OptimizationSuggestions.objects.all().select_related('analysis', 'analysis__project')

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending optimization suggestions"""
        pending_suggestions = self.get_queryset().filter(status='pending')
        
        # Group by priority
        high_priority = pending_suggestions.filter(priority=1)
        medium_priority = pending_suggestions.filter(priority=2)
        low_priority = pending_suggestions.filter(priority__gte=3)
        
        return Response({
            'total_pending': pending_suggestions.count(),
            'high_priority': self.get_serializer(high_priority, many=True).data,
            'medium_priority': self.get_serializer(medium_priority, many=True).data,
            'low_priority': self.get_serializer(low_priority, many=True).data
        })

    @action(detail=False, methods=['get'])
    def by_impact(self, request):
        """Get suggestions grouped by potential impact"""
        suggestions = self.get_queryset().filter(status='pending')
        
        # Group by impact estimate
        high_impact = []
        medium_impact = []
        low_impact = []
        
        for suggestion in suggestions:
            impact = suggestion.impact_estimate.get('performance_gain', 0)
            if impact >= 30:
                high_impact.append(suggestion)
            elif impact >= 15:
                medium_impact.append(suggestion)
            else:
                low_impact.append(suggestion)
        
        return Response({
            'high_impact': self.get_serializer(high_impact, many=True).data,
            'medium_impact': self.get_serializer(medium_impact, many=True).data,
            'low_impact': self.get_serializer(low_impact, many=True).data
        })

    @action(detail=False, methods=['post'])
    def apply_bulk(self, request):
        """Apply multiple optimization suggestions"""
        serializer = OptimizationApplicationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        suggestion_ids = serializer.validated_data['suggestion_ids']
        auto_apply = serializer.validated_data.get('auto_apply', False)
        create_backup = serializer.validated_data.get('create_backup', True)
        
        # Trigger bulk application task
        task = apply_optimization_suggestions.delay(
            suggestion_ids=suggestion_ids,
            auto_apply=auto_apply,
            create_backup=create_backup
        )
        
        return Response({
            'message': f'Bulk application started for {len(suggestion_ids)} suggestions',
            'task_id': task.id,
            'auto_apply': auto_apply,
            'create_backup': create_backup
        }, status=status.HTTP_202_ACCEPTED)

    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        """Apply a specific optimization suggestion"""
        suggestion = self.get_object()
        
        auto_apply = request.data.get('auto_apply', False)
        create_backup = request.data.get('create_backup', True)
        
        # Trigger application task
        task = apply_optimization_suggestions.delay(
            suggestion_ids=[str(suggestion.suggestion_id)],
            auto_apply=auto_apply,
            create_backup=create_backup
        )
        
        return Response({
            'message': f'Application started for suggestion {suggestion.suggestion_id}',
            'task_id': task.id,
            'auto_apply': auto_apply,
            'create_backup': create_backup
        }, status=status.HTTP_202_ACCEPTED)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get optimization suggestions summary"""
        total_suggestions = self.get_queryset().count()
        applied_suggestions = self.get_queryset().filter(status='applied').count()
        pending_suggestions = self.get_queryset().filter(status='pending').count()
        rejected_suggestions = self.get_queryset().filter(status='rejected').count()
        
        # Calculate impact estimates
        suggestions = self.get_queryset().filter(status='applied')
        total_impact = {
            'performance_gain': 0,
            'implementation_effort': 0,
            'cost_savings': 0,
            'memory_optimizations': 0
        }
        
        for suggestion in suggestions:
            impact = suggestion.impact_estimate
            total_impact['performance_gain'] += impact.get('performance_gain', 0)
            total_impact['implementation_effort'] += impact.get('implementation_effort', 0)
            total_impact['cost_savings'] += impact.get('cost_savings', 0)
            total_impact['memory_optimizations'] += impact.get('memory_optimization', 0)
        
        return Response({
            'total_suggestions': total_suggestions,
            'applied_suggestions': applied_suggestions,
            'pending_suggestions': pending_suggestions,
            'rejected_suggestions': rejected_suggestions,
            'application_rate': (applied_suggestions / total_suggestions * 100) if total_suggestions > 0 else 0,
            'total_impact': total_impact
        })
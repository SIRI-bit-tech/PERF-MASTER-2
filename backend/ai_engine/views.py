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
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        project_ids = Project.objects.filter(
            Q(created_by=user) | Q(team_members=user)
        ).values_list('project_id', flat=True)
        
        return AIAnalysisResults.objects.filter(
            project_id__in=project_ids
        ).select_related('project').prefetch_related('suggestions')

    @action(detail=False, methods=['post'])
    def analyze_component(self, request):
        """Trigger AI analysis for a specific component"""
        serializer = ComponentAnalysisRequestSerializer(
            data=request.data,
            context={'request': request}
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
    def recent_analyses(self, request):
        """Get recent AI analyses with summary statistics"""
        queryset = self.get_queryset()
        
        # Get analyses from last 7 days
        recent_analyses = queryset.filter(
            created_at__gte=timezone.now() - timezone.timedelta(days=7)
        )
        
        # Calculate statistics
        stats = recent_analyses.aggregate(
            total_analyses=Count('analysis_id'),
            avg_confidence=Avg('confidence_score'),
            completed_analyses=Count('analysis_id', filter=Q(status='completed')),
            pending_analyses=Count('analysis_id', filter=Q(status='pending'))
        )
        
        # Get top bottlenecks
        bottleneck_components = recent_analyses.filter(
            status='completed'
        ).values('component_id').annotate(
            bottleneck_count=Count('analysis_id')
        ).order_by('-bottleneck_count')[:5]
        
        return Response({
            'statistics': stats,
            'recent_analyses': self.get_serializer(recent_analyses[:10], many=True).data,
            'top_bottlenecks': list(bottleneck_components)
        })

    @action(detail=True, methods=['post'])
    def regenerate(self, request, pk=None):
        """Regenerate analysis with updated parameters"""
        analysis = self.get_object()
        
        # Trigger new analysis task
        task = analyze_component_performance.delay(
            project_id=str(analysis.project.project_id),
            component_path=analysis.component_id,
            source_code=request.data.get('source_code', ''),
            framework_version=analysis.project.framework_version,
            analysis_type=request.data.get('analysis_type', 'full')
        )
        
        return Response({
            'message': 'Analysis regeneration started',
            'task_id': task.id,
            'original_analysis_id': str(analysis.analysis_id)
        })


class OptimizationSuggestionViewSet(viewsets.ModelViewSet):
    serializer_class = OptimizationSuggestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        project_ids = Project.objects.filter(
            Q(created_by=user) | Q(team_members=user)
        ).values_list('project_id', flat=True)
        
        return OptimizationSuggestions.objects.filter(
            analysis__project_id__in=project_ids
        ).select_related('analysis', 'analysis__project')

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending optimization suggestions"""
        pending_suggestions = self.get_queryset().filter(status='pending')
        
        # Group by priority
        by_priority = {}
        for suggestion in pending_suggestions:
            priority = suggestion.priority
            if priority not in by_priority:
                by_priority[priority] = []
            by_priority[priority].append(suggestion)
        
        # Serialize grouped suggestions
        result = {}
        for priority, suggestions in by_priority.items():
            result[f'priority_{priority}'] = self.get_serializer(suggestions, many=True).data
        
        return Response(result)

    @action(detail=False, methods=['post'])
    def apply_suggestions(self, request):
        """Apply multiple optimization suggestions"""
        serializer = OptimizationApplicationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Trigger async application task
        task = apply_optimization_suggestions.delay(
            suggestion_ids=[str(sid) for sid in serializer.validated_data['suggestion_ids']],
            auto_apply=serializer.validated_data['auto_apply'],
            create_backup=serializer.validated_data['create_backup'],
            user_id=request.user.id
        )
        
        return Response({
            'message': 'Optimization application started',
            'task_id': task.id,
            'suggestion_count': len(serializer.validated_data['suggestion_ids'])
        }, status=status.HTTP_202_ACCEPTED)

    @action(detail=True, methods=['post'])
    def apply_single(self, request, pk=None):
        """Apply a single optimization suggestion"""
        suggestion = self.get_object()
        
        if suggestion.status != 'pending':
            return Response(
                {'error': 'Suggestion is not in pending status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status to testing
        suggestion.status = 'testing'
        suggestion.save()
        
        # Trigger async application
        task = apply_optimization_suggestions.delay(
            suggestion_ids=[str(suggestion.suggestion_id)],
            auto_apply=request.data.get('auto_apply', False),
            create_backup=request.data.get('create_backup', True),
            user_id=request.user.id
        )
        
        return Response({
            'message': 'Optimization application started',
            'task_id': task.id,
            'suggestion_id': str(suggestion.suggestion_id)
        })

    @action(detail=False, methods=['get'])
    def impact_summary(self, request):
        """Get summary of optimization impact across projects"""
        queryset = self.get_queryset().filter(status='applied')
        
        # Calculate total impact
        total_impact = {
            'performance_improvements': 0,
            'bundle_size_reductions': 0,
            'memory_optimizations': 0,
            'suggestions_applied': queryset.count()
        }
        
        for suggestion in queryset:
            impact = suggestion.impact_estimate
            if 'performance_gain' in impact:
                total_impact['performance_improvements'] += impact['performance_gain']
            if 'bundle_reduction' in impact:
                total_impact['bundle_size_reductions'] += impact['bundle_reduction']
            if 'memory_optimization' in impact:
                total_impact['memory_optimizations'] += impact['memory_optimization']
        
        return Response(total_impact)

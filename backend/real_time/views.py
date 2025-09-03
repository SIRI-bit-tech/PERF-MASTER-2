from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from perfmaster.models import Project, PerformanceMetrics, PerformanceAlerts


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def realtime_status(request):
    """Get real-time monitoring status"""
    user = request.user
    
    # Get user's projects
    projects = Project.objects.filter(
        Q(created_by=user) | Q(team_members=user)
    ).distinct()
    
    # Get recent activity (last 24 hours)
    last_24h = timezone.now() - timedelta(hours=24)
    
    recent_metrics = PerformanceMetrics.objects.filter(
        project__in=projects,
        timestamp__gte=last_24h
    ).count()
    
    active_alerts = PerformanceAlerts.objects.filter(
        project__in=projects,
        resolved=False
    ).count()
    
    return Response({
        'status': 'active',
        'projects_monitored': projects.count(),
        'recent_metrics': recent_metrics,
        'active_alerts': active_alerts,
        'websocket_endpoints': {
            'performance': '/ws/performance/{project_id}/',
            'team': '/ws/team/{project_id}/'
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_realtime_metrics(request, project_id):
    """Get real-time metrics for a specific project"""
    user = request.user
    
    try:
        project = Project.objects.get(
            project_id=project_id,
            **{f'{"created_by" if user in [project.created_by] else "team_members"}': user}
        )
    except Project.DoesNotExist:
        return Response({'error': 'Project not found'}, status=404)
    
    # Get recent metrics (last hour by default)
    hours = int(request.GET.get('hours', 1))
    start_time = timezone.now() - timedelta(hours=hours)
    
    metrics = PerformanceMetrics.objects.filter(
        project=project,
        timestamp__gte=start_time
    ).order_by('-timestamp')
    
    # Group metrics by component
    component_metrics = {}
    for metric in metrics:
        component = metric.component_path
        if component not in component_metrics:
            component_metrics[component] = []
        
        component_metrics[component].append({
            'timestamp': metric.timestamp.isoformat(),
            'render_time': metric.render_time,
            'memory_usage': metric.memory_usage,
            'bundle_size': metric.bundle_size,
            'cpu_usage': metric.cpu_usage
        })
    
    return Response({
        'project_id': str(project.project_id),
        'project_name': project.name,
        'time_range': f'{hours} hours',
        'total_metrics': metrics.count(),
        'component_metrics': component_metrics
    })

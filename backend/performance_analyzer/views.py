from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db.models import Q, Avg, Count
from django.utils import timezone
from datetime import timedelta
from perfmaster.models import (
    Project, PerformanceMetrics, PerformanceSnapshots,
    ComponentAnalysis, PerformanceAlerts, UserPreferences
)
from .serializers import (
    ProjectSerializer, PerformanceMetricsSerializer, PerformanceSnapshotSerializer,
    ComponentAnalysisSerializer, PerformanceAlertSerializer, UserPreferencesSerializer
)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """Custom login view that returns JWT tokens"""
    username = request.data.get('email')  # Frontend sends email as username
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Please provide both email and password'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=username, password=password)
    if not user:
        # Try to find user by email if username authentication failed
        try:
            user_obj = User.objects.get(email=username)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass
    
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'token': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }
        })
    
    return Response(
        {'error': 'Invalid credentials'},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    """Custom registration view"""
    username = request.data.get('name', '').replace(' ', '').lower()
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not username or not email or not password:
        return Response(
            {'error': 'Please provide name, email, and password'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'User with this email already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create user
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=request.data.get('name', '')
    )
    
    # Return JWT token
    refresh = RefreshToken.for_user(user)
    return Response({
        'token': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
        }
    }, status=status.HTTP_201_CREATED)


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(
            Q(created_by=user) | Q(team_members=user)
        ).distinct().prefetch_related('team_members', 'metrics', 'snapshots')

    @action(detail=True, methods=['get'])
    def dashboard(self, request, pk=None):
        """Get comprehensive dashboard data for a project"""
        project = self.get_object()
        
        # Get latest metrics
        latest_metrics = PerformanceMetrics.objects.filter(
            project=project
        ).order_by('-timestamp')[:10]
        
        # Get performance trends (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        trend_data = PerformanceMetrics.objects.filter(
            project=project,
            timestamp__gte=thirty_days_ago
        ).values('timestamp__date').annotate(
            avg_render_time=Avg('render_time'),
            avg_memory_usage=Avg('memory_usage'),
            avg_bundle_size=Avg('bundle_size')
        ).order_by('timestamp__date')
        
        # Get component analysis
        components = ComponentAnalysis.objects.filter(
            project=project
        ).order_by('-performance_score')[:5]
        
        # Get active alerts
        active_alerts = PerformanceAlerts.objects.filter(
            project=project,
            resolved=False
        ).order_by('-created_at')[:5]
        
        return Response({
            'project': ProjectSerializer(project).data,
            'latest_metrics': PerformanceMetricsSerializer(latest_metrics, many=True).data,
            'trends': list(trend_data),
            'top_components': ComponentAnalysisSerializer(components, many=True).data,
            'active_alerts': PerformanceAlertSerializer(active_alerts, many=True).data,
        })

    @action(detail=True, methods=['post'])
    def add_team_member(self, request, pk=None):
        """Add a team member to the project"""
        project = self.get_object()
        username = request.data.get('username')
        
        if not username:
            return Response(
                {'error': 'Username is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(username=username)
            project.team_members.add(user)
            return Response({'message': f'Added {username} to project'})
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class PerformanceMetricsViewSet(viewsets.ModelViewSet):
    serializer_class = PerformanceMetricsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        project_ids = Project.objects.filter(
            Q(created_by=user) | Q(team_members=user)
        ).values_list('project_id', flat=True)
        
        queryset = PerformanceMetrics.objects.filter(
            project_id__in=project_ids
        ).select_related('project')
        
        # Filter by project if specified
        project_id = self.request.query_params.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        # Filter by component path if specified
        component_path = self.request.query_params.get('component_path')
        if component_path:
            queryset = queryset.filter(component_path__icontains=component_path)
        
        return queryset.order_by('-timestamp')

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get performance metrics summary"""
        queryset = self.get_queryset()
        
        # Get date range from query params
        days = int(request.query_params.get('days', 7))
        start_date = timezone.now() - timedelta(days=days)
        queryset = queryset.filter(timestamp__gte=start_date)
        
        summary = queryset.aggregate(
            avg_render_time=Avg('render_time'),
            avg_memory_usage=Avg('memory_usage'),
            avg_bundle_size=Avg('bundle_size'),
            total_metrics=Count('metric_id')
        )
        
        return Response(summary)


class ComponentAnalysisViewSet(viewsets.ModelViewSet):
    serializer_class = ComponentAnalysisSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        project_ids = Project.objects.filter(
            Q(created_by=user) | Q(team_members=user)
        ).values_list('project_id', flat=True)
        
        return ComponentAnalysis.objects.filter(
            project_id__in=project_ids
        ).select_related('project').order_by('-performance_score')

    @action(detail=False, methods=['get'])
    def bottlenecks(self, request):
        """Get components with performance bottlenecks"""
        queryset = self.get_queryset()
        
        # Filter components with low performance scores
        threshold = int(request.query_params.get('threshold', 70))
        bottlenecks = queryset.filter(performance_score__lt=threshold)
        
        serializer = self.get_serializer(bottlenecks, many=True)
        return Response(serializer.data)


class PerformanceSnapshotViewSet(viewsets.ModelViewSet):
    serializer_class = PerformanceSnapshotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        project_ids = Project.objects.filter(
            Q(created_by=user) | Q(team_members=user)
        ).values_list('project_id', flat=True)
        
        return PerformanceSnapshots.objects.filter(
            project_id__in=project_ids
        ).select_related('project').order_by('-created_at')

    @action(detail=False, methods=['post'])
    def create_snapshot(self, request):
        """Create a new performance snapshot"""
        project_id = request.data.get('project_id')
        
        if not project_id:
            return Response(
                {'error': 'project_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            project = Project.objects.get(project_id=project_id)
            
            # Calculate overall score based on recent metrics
            recent_metrics = PerformanceMetrics.objects.filter(
                project=project,
                timestamp__gte=timezone.now() - timedelta(hours=1)
            )
            
            if recent_metrics.exists():
                avg_metrics = recent_metrics.aggregate(
                    avg_render_time=Avg('render_time'),
                    avg_memory_usage=Avg('memory_usage'),
                    avg_bundle_size=Avg('bundle_size')
                )
                
                # Simple scoring algorithm (can be enhanced with AI)
                render_score = max(0, 100 - (avg_metrics['avg_render_time'] or 0) * 2)
                memory_score = max(0, 100 - (avg_metrics['avg_memory_usage'] or 0))
                bundle_score = max(0, 100 - (avg_metrics['avg_bundle_size'] or 0) / 10)
                
                overall_score = int((render_score + memory_score + bundle_score) / 3)
            else:
                overall_score = 0
            
            snapshot_data = {
                'project': project_id,
                'overall_score': overall_score,
                'detailed_metrics': avg_metrics if recent_metrics.exists() else {},
                'git_commit': request.data.get('git_commit'),
                'branch_name': request.data.get('branch_name', 'main')
            }
            
            serializer = self.get_serializer(data=snapshot_data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Project.DoesNotExist:
            return Response(
                {'error': 'Project not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class PerformanceAlertViewSet(viewsets.ModelViewSet):
    serializer_class = PerformanceAlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        project_ids = Project.objects.filter(
            Q(created_by=user) | Q(team_members=user)
        ).values_list('project_id', flat=True)
        
        queryset = PerformanceAlerts.objects.filter(
            project_id__in=project_ids
        ).select_related('project', 'resolved_by')
        
        # Filter by resolved status
        resolved = self.request.query_params.get('resolved')
        if resolved is not None:
            queryset = queryset.filter(resolved=resolved.lower() == 'true')
        
        return queryset.order_by('-created_at')

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Resolve a performance alert"""
        alert = self.get_object()
        alert.resolved = True
        alert.resolved_at = timezone.now()
        alert.resolved_by = request.user
        alert.save()
        
        serializer = self.get_serializer(alert)
        return Response(serializer.data)


class UserPreferencesViewSet(viewsets.ModelViewSet):
    serializer_class = UserPreferencesSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserPreferences.objects.filter(user=self.request.user)

    def get_object(self):
        """Get or create user preferences"""
        preferences, created = UserPreferences.objects.get_or_create(
            user=self.request.user
        )
        return preferences
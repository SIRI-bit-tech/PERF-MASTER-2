from rest_framework import serializers
from django.contrib.auth.models import User
from perfmaster.models import (
    Project, PerformanceMetrics, PerformanceSnapshots,
    ComponentAnalysis, PerformanceAlerts, UserPreferences
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class ProjectSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    team_members = UserSerializer(many=True, read_only=True)
    metrics_count = serializers.SerializerMethodField()
    latest_score = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'project_id', 'name', 'repository_url', 'framework_version',
            'performance_config', 'ai_settings', 'created_by', 'team_members',
            'created_at', 'updated_at', 'is_active', 'metrics_count', 'latest_score'
        ]
        read_only_fields = ['project_id', 'created_at', 'updated_at']

    def get_metrics_count(self, obj):
        return obj.metrics.count()

    def get_latest_score(self, obj):
        latest_snapshot = obj.snapshots.first()
        return latest_snapshot.overall_score if latest_snapshot else None

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class PerformanceMetricsSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = PerformanceMetrics
        fields = [
            'metric_id', 'project', 'project_name', 'component_path',
            'render_time', 'memory_usage', 'bundle_size', 'core_web_vitals',
            'cpu_usage', 'network_requests', 'dom_nodes', 'timestamp'
        ]
        read_only_fields = ['metric_id', 'timestamp']

    def validate_core_web_vitals(self, value):
        """Validate Core Web Vitals structure"""
        required_fields = ['lcp', 'fid', 'cls']
        if not all(field in value for field in required_fields):
            raise serializers.ValidationError(
                f"Core Web Vitals must include: {', '.join(required_fields)}"
            )
        return value


class ComponentAnalysisSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    optimization_count = serializers.SerializerMethodField()

    class Meta:
        model = ComponentAnalysis
        fields = [
            'component_id', 'project', 'project_name', 'file_path',
            'component_name', 'performance_score', 'optimization_opportunities',
            'dependencies', 'render_count', 'last_analyzed', 'created_at',
            'optimization_count'
        ]
        read_only_fields = ['component_id', 'last_analyzed', 'created_at']

    def get_optimization_count(self, obj):
        return len(obj.optimization_opportunities)


class PerformanceSnapshotSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    score_trend = serializers.SerializerMethodField()

    class Meta:
        model = PerformanceSnapshots
        fields = [
            'snapshot_id', 'project', 'project_name', 'overall_score',
            'detailed_metrics', 'comparison_data', 'git_commit',
            'branch_name', 'created_at', 'score_trend'
        ]
        read_only_fields = ['snapshot_id', 'created_at']

    def get_score_trend(self, obj):
        """Calculate score trend compared to previous snapshot"""
        previous_snapshot = PerformanceSnapshots.objects.filter(
            project=obj.project,
            created_at__lt=obj.created_at
        ).first()
        
        if previous_snapshot:
            return obj.overall_score - previous_snapshot.overall_score
        return 0


class PerformanceAlertSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    resolved_by_username = serializers.CharField(source='resolved_by.username', read_only=True)
    time_since_created = serializers.SerializerMethodField()

    class Meta:
        model = PerformanceAlerts
        fields = [
            'alert_id', 'project', 'project_name', 'alert_type', 'severity',
            'message', 'metadata', 'resolved', 'resolved_at', 'resolved_by',
            'resolved_by_username', 'created_at', 'time_since_created'
        ]
        read_only_fields = ['alert_id', 'created_at', 'time_since_created']

    def get_time_since_created(self, obj):
        from django.utils import timezone
        delta = timezone.now() - obj.created_at
        hours = delta.total_seconds() / 3600
        if hours < 1:
            return f"{int(delta.total_seconds() / 60)} minutes ago"
        elif hours < 24:
            return f"{int(hours)} hours ago"
        else:
            return f"{delta.days} days ago"


class UserPreferencesSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = UserPreferences
        fields = [
            'user', 'username', 'dashboard_layout', 'alert_settings',
            'ai_suggestion_preferences', 'theme_settings',
            'notification_preferences', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

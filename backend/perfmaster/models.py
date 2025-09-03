from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class Project(models.Model):
    project_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    repository_url = models.URLField(blank=True, null=True)
    framework_version = models.CharField(max_length=50, default='React 18')
    performance_config = models.JSONField(default=dict)
    ai_settings = models.JSONField(default=dict)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    team_members = models.ManyToManyField(User, related_name='team_projects', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class PerformanceMetrics(models.Model):
    metric_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='metrics')
    component_path = models.CharField(max_length=500)
    render_time = models.FloatField(validators=[MinValueValidator(0)])
    memory_usage = models.FloatField(validators=[MinValueValidator(0)])
    bundle_size = models.FloatField(validators=[MinValueValidator(0)])
    core_web_vitals = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)

    # Additional performance metrics
    cpu_usage = models.FloatField(default=0, validators=[MinValueValidator(0)])
    network_requests = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    dom_nodes = models.IntegerField(default=0, validators=[MinValueValidator(0)])

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['project', 'timestamp']),
            models.Index(fields=['component_path']),
        ]


class AIAnalysisResults(models.Model):
    ANALYSIS_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    analysis_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='ai_analyses')
    component_id = models.CharField(max_length=255)
    bottlenecks = models.JSONField(default=list)
    suggestions = models.JSONField(default=list)  # JSON list of AI text/code suggestions
    confidence_score = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(1)])
    model_used = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=ANALYSIS_STATUS_CHOICES, default='pending')
    processing_time = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class OptimizationSuggestions(models.Model):
    SUGGESTION_TYPES = [
        ('memo', 'React.memo'),
        ('callback', 'useCallback'),
        ('usememo', 'useMemo'),
        ('lazy', 'Lazy Loading'),
        ('splitting', 'Code Splitting'),
        ('bundle', 'Bundle Optimization'),
        ('state', 'State Management'),
        ('rendering', 'Rendering Optimization'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('applied', 'Applied'),
        ('rejected', 'Rejected'),
        ('testing', 'Testing'),
    ]

    suggestion_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    analysis = models.ForeignKey(
        AIAnalysisResults,
        on_delete=models.CASCADE,
        related_name='optimization_suggestions'  # avoid clash with JSON suggestions
    )
    type = models.CharField(max_length=20, choices=SUGGESTION_TYPES)
    description = models.TextField()
    code_changes = models.JSONField(default=dict)
    impact_estimate = models.JSONField(default=dict)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.IntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(5)])
    created_at = models.DateTimeField(auto_now_add=True)
    applied_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']


class PerformanceSnapshots(models.Model):
    snapshot_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='snapshots')
    overall_score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    detailed_metrics = models.JSONField(default=dict)
    comparison_data = models.JSONField(default=dict)
    git_commit = models.CharField(max_length=40, blank=True, null=True)
    branch_name = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class ComponentAnalysis(models.Model):
    component_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='components')
    file_path = models.CharField(max_length=500)
    component_name = models.CharField(max_length=255)
    performance_score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    optimization_opportunities = models.JSONField(default=list)
    dependencies = models.JSONField(default=list)
    render_count = models.IntegerField(default=0)
    last_analyzed = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['project', 'file_path']


class PerformanceAlerts(models.Model):
    ALERT_TYPES = [
        ('performance_degradation', 'Performance Degradation'),
        ('memory_leak', 'Memory Leak'),
        ('bundle_size_increase', 'Bundle Size Increase'),
        ('render_time_spike', 'Render Time Spike'),
        ('core_web_vitals', 'Core Web Vitals Issue'),
    ]

    SEVERITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    alert_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='alerts')
    alert_type = models.CharField(max_length=30, choices=ALERT_TYPES)
    severity = models.CharField(max_length=10, choices=SEVERITY_LEVELS)
    message = models.TextField()
    metadata = models.JSONField(default=dict)
    resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class UserPreferences(models.Model):
    THEME_CHOICES = [
        ('dark', 'Dark'),
        ('light', 'Light'),
        ('auto', 'Auto'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    dashboard_layout = models.JSONField(default=dict)
    alert_settings = models.JSONField(default=dict)
    ai_suggestion_preferences = models.JSONField(default=dict)
    theme_settings = models.CharField(max_length=10, choices=THEME_CHOICES, default='dark')
    notification_preferences = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

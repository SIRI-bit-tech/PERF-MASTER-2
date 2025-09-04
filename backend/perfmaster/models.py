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
        app_label = 'perfmaster'
        db_table = 'perfmaster_aianalysisresults'
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
    analysis = models.ForeignKey(AIAnalysisResults, on_delete=models.CASCADE, related_name='optimization_suggestions')
    type = models.CharField(max_length=20, choices=SUGGESTION_TYPES)
    description = models.TextField()
    code_changes = models.JSONField(default=dict)
    impact_estimate = models.JSONField(default=dict)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.IntegerField(default=3, validators=[MinValueValidator(1), MaxValueValidator(5)])
    applied_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'perfmaster'
        db_table = 'perfmaster_optimizationsuggestions'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.type}: {self.description[:50]}"


class ComponentAnalysis(models.Model):
    COMPONENT_TYPES = [
        ('react_component', 'React Component'),
        ('vue_component', 'Vue Component'),
        ('angular_component', 'Angular Component'),
        ('vanilla_js', 'Vanilla JavaScript'),
        ('typescript', 'TypeScript'),
    ]

    analysis_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='component_analyses')
    file_path = models.CharField(max_length=500)
    component_name = models.CharField(max_length=255)
    component_type = models.CharField(max_length=20, choices=COMPONENT_TYPES)
    performance_score = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    optimization_opportunities = models.JSONField(default=list)
    dependencies = models.JSONField(default=list)
    analysis_metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'perfmaster'
        db_table = 'perfmaster_componentanalysis'
        ordering = ['-created_at']
        unique_together = ['project', 'file_path']

    def __str__(self):
        return f"{self.component_name} ({self.file_path})"


class PerformanceAlerts(models.Model):
    ALERT_TYPES = [
        ('lcp_threshold', 'LCP Threshold Exceeded'),
        ('fid_threshold', 'FID Threshold Exceeded'),
        ('cls_threshold', 'CLS Threshold Exceeded'),
        ('memory_leak', 'Memory Leak Detected'),
        ('bundle_size', 'Bundle Size Exceeded'),
        ('error_rate', 'High Error Rate'),
    ]

    SEVERITY_LEVELS = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    alert_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='alerts')
    component_path = models.CharField(max_length=500, blank=True, null=True)
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    severity = models.CharField(max_length=10, choices=SEVERITY_LEVELS)
    message = models.TextField()
    metric_value = models.FloatField(null=True, blank=True)
    threshold_value = models.FloatField(null=True, blank=True)
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'perfmaster'
        db_table = 'perfmaster_performancealerts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['project', 'is_resolved', 'created_at']),
            models.Index(fields=['alert_type', 'severity']),
        ]

    def __str__(self):
        return f"{self.alert_type}: {self.message[:50]}"


class UserPreferences(models.Model):
    THEME_CHOICES = [
        ('light', 'Light'),
        ('dark', 'Dark'),
        ('auto', 'Auto'),
    ]

    NOTIFICATION_FREQUENCY = [
        ('realtime', 'Real-time'),
        ('hourly', 'Hourly'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('never', 'Never'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default='auto')
    email_notifications = models.BooleanField(default=True)
    notification_frequency = models.CharField(max_length=10, choices=NOTIFICATION_FREQUENCY, default='daily')
    dashboard_layout = models.JSONField(default=dict)
    alert_thresholds = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'perfmaster'
        db_table = 'perfmaster_userpreferences'

    def __str__(self):
        return f"{self.user.username}'s preferences"


class PerformanceSnapshots(models.Model):
    snapshot_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='snapshots')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    metrics_snapshot = models.JSONField()
    components_snapshot = models.JSONField(default=list)
    alerts_snapshot = models.JSONField(default=list)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'perfmaster'
        db_table = 'perfmaster_performancesnapshots'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.created_at.date()})"
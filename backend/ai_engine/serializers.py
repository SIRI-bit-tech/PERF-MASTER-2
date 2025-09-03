from rest_framework import serializers
from perfmaster.models import AIAnalysisResults, OptimizationSuggestions, Project


class AIAnalysisResultsSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    suggestions_count = serializers.SerializerMethodField()

    class Meta:
        model = AIAnalysisResults
        fields = [
            'analysis_id', 'project', 'project_name', 'component_id',
            'bottlenecks', 'suggestions', 'confidence_score', 'model_used',
            'status', 'processing_time', 'created_at', 'suggestions_count'
        ]
        read_only_fields = ['analysis_id', 'created_at', 'processing_time']

    def get_suggestions_count(self, obj):
        return obj.suggestions.count()


class OptimizationSuggestionSerializer(serializers.ModelSerializer):
    analysis_project = serializers.CharField(source='analysis.project.name', read_only=True)
    confidence_score = serializers.FloatField(source='analysis.confidence_score', read_only=True)

    class Meta:
        model = OptimizationSuggestions
        fields = [
            'suggestion_id', 'analysis', 'analysis_project', 'type',
            'description', 'code_changes', 'impact_estimate', 'status',
            'priority', 'confidence_score', 'created_at', 'applied_at'
        ]
        read_only_fields = ['suggestion_id', 'created_at']

    def validate_impact_estimate(self, value):
        """Validate impact estimate structure"""
        required_fields = ['performance_gain', 'implementation_effort']
        if not all(field in value for field in required_fields):
            raise serializers.ValidationError(
                f"Impact estimate must include: {', '.join(required_fields)}"
            )
        return value


class ComponentAnalysisRequestSerializer(serializers.Serializer):
    """Serializer for component analysis requests"""
    project_id = serializers.UUIDField()
    component_path = serializers.CharField(max_length=500)
    source_code = serializers.CharField()
    framework_version = serializers.CharField(max_length=50, default='React 18')
    analysis_type = serializers.ChoiceField(
        choices=['full', 'performance', 'optimization', 'security'],
        default='full'
    )

    def validate_project_id(self, value):
        """Validate that the project exists and user has access"""
        try:
            project = Project.objects.get(project_id=value)
            user = self.context['request'].user
            if not (project.created_by == user or user in project.team_members.all()):
                raise serializers.ValidationError("You don't have access to this project")
            return value
        except Project.DoesNotExist:
            raise serializers.ValidationError("Project not found")


class OptimizationApplicationSerializer(serializers.Serializer):
    """Serializer for applying optimization suggestions"""
    suggestion_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1
    )
    auto_apply = serializers.BooleanField(default=False)
    create_backup = serializers.BooleanField(default=True)
    
    def validate_suggestion_ids(self, value):
        """Validate that all suggestions exist and are applicable"""
        suggestions = OptimizationSuggestions.objects.filter(
            suggestion_id__in=value,
            status='pending'
        )
        
        if len(suggestions) != len(value):
            raise serializers.ValidationError("Some suggestions are not found or not applicable")
        
        return value

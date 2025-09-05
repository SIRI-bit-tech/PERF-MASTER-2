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
        # obj.suggestions is a JSONField (list), so use len() instead of count()
        if isinstance(obj.suggestions, list):
            return len(obj.suggestions)
        return 0


class OptimizationSuggestionSerializer(serializers.ModelSerializer):
    analysis_project = serializers.CharField(source='analysis.project.name', read_only=True)
    confidence_score = serializers.FloatField(source='analysis.confidence_score', read_only=True)

    class Meta:
        model = OptimizationSuggestions
        fields = [
            'suggestion_id', 'analysis', 'analysis_project', 'type',
            'description', 'code_changes', 'impact_estimate', 'status',
            'priority', 'created_at', 'applied_at', 'confidence_score'  # ✅ Added this
        ]
        read_only_fields = ['suggestion_id', 'created_at', 'applied_at']

    def create(self, validated_data):
        # Set default values for required fields
        if 'priority' not in validated_data:
            validated_data['priority'] = 3
        if 'status' not in validated_data:
            validated_data['status'] = 'pending'
        return super().create(validated_data)


class ComponentAnalysisRequestSerializer(serializers.Serializer):
    """Serializer for component analysis requests"""
    project_id = serializers.CharField(max_length=100)  # Accept string project IDs
    component_path = serializers.CharField(max_length=500)
    source_code = serializers.CharField()
    framework_version = serializers.CharField(max_length=50, default='React 18')
    analysis_type = serializers.ChoiceField(
        choices=['full', 'performance', 'optimization', 'security'],
        default='full'
    )


class OptimizationApplicationSerializer(serializers.Serializer):
    """Serializer for applying optimization suggestions"""
    suggestion_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1
    )
    auto_apply = serializers.BooleanField(default=False)
    create_backup = serializers.BooleanField(default=True)
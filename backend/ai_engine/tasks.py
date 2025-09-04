from celery import shared_task
from django.utils import timezone
import json
import time
import uuid
from perfmaster.models import (
    AIAnalysisResults, OptimizationSuggestions, Project, ComponentAnalysis
)
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password

User = get_user_model()


@shared_task(bind=True)
def analyze_component_performance(self, project_id, component_path, source_code, framework_version='React 18', analysis_type='full'):
    """
    Analyze component performance using AI models
    """
    start_time = time.time()
    
    try:
        # Get or create a system user for projects
        user, user_created = User.objects.get_or_create(
            username='system',
            defaults={
                'email': 'system@perfmaster.local',
                'password': make_password('system123'),  # Hash the password
                'is_active': True,
                'is_staff': False,
                'is_superuser': False
            }
        )
        
        if user_created:
            print(f"Created system user: {user.username}")
        
        # Get or create project
        project, created = Project.objects.get_or_create(
            project_id=project_id,
            defaults={
                'name': f'Project {project_id}',
                'framework_version': framework_version,
                'repository_url': '',
                'branch': 'main',
                'performance_config': {},
                'ai_settings': {},
                'created_by': user  # Use the system user
            }
        )
        
        if created:
            print(f"Created new project: {project_id}")
        
        # Create analysis record
        analysis = AIAnalysisResults.objects.create(
            project=project,
            component_id=component_path,
            status='processing',
            model_used='rule_based_analyzer_v1',  # Will be updated when AI models are integrated
            confidence_score=0.0
        )
        
        print(f"Created analysis record: {analysis.analysis_id}")
        
        # Simulate AI analysis (replace with actual AI integration)
        bottlenecks = analyze_code_bottlenecks(source_code, framework_version)
        suggestions = generate_optimization_suggestions(source_code, bottlenecks, framework_version)
        
        print(f"Found {len(bottlenecks)} bottlenecks and {len(suggestions)} suggestions")
        
        # Calculate confidence score based on analysis results
        confidence_score = calculate_confidence_score(bottlenecks, suggestions)
        
        # Update analysis results
        analysis.bottlenecks = bottlenecks
        analysis.suggestions = suggestions
        analysis.confidence_score = confidence_score
        analysis.status = 'completed'
        analysis.processing_time = time.time() - start_time
        analysis.save()
        
        print(f"Analysis completed: {analysis.analysis_id}")
        
        # Create optimization suggestions
        for suggestion_data in suggestions:
            OptimizationSuggestions.objects.create(
                analysis=analysis,
                type=suggestion_data['type'],
                description=suggestion_data['description'],
                code_changes=suggestion_data.get('code_changes', {}),
                impact_estimate=suggestion_data.get('impact_estimate', {}),
                priority=suggestion_data.get('priority', 3)
            )
        
        # Update component analysis
        ComponentAnalysis.objects.update_or_create(
            project=project,
            file_path=component_path,
            defaults={
                'component_name': extract_component_name(source_code),
                'performance_score': calculate_performance_score(bottlenecks),
                'optimization_opportunities': [s['type'] for s in suggestions],
                'dependencies': extract_dependencies(source_code)
            }
        )
        
        print(f"Component analysis updated for {component_path}")
        
        return {
            'analysis_id': str(analysis.analysis_id),
            'status': 'completed',
            'bottlenecks_found': len(bottlenecks),
            'suggestions_generated': len(suggestions),
            'confidence_score': confidence_score,
            'processing_time': analysis.processing_time
        }
        
    except Exception as e:
        print(f"Analysis failed: {str(e)}")
        # Update analysis status to failed
        if 'analysis' in locals():
            analysis.status = 'failed'
            analysis.processing_time = time.time() - start_time
            analysis.save()
        
        raise self.retry(exc=e, countdown=60, max_retries=3)


@shared_task(bind=True)
def apply_optimization_suggestions(self, suggestion_ids, auto_apply=False, create_backup=True, user_id=None):
    """
    Apply optimization suggestions to codebase
    """
    try:
        suggestions = OptimizationSuggestions.objects.filter(
            suggestion_id__in=suggestion_ids,
            status__in=['pending', 'testing']
        )
        
        results = []
        
        for suggestion in suggestions:
            try:
                # Create backup if requested
                if create_backup:
                    create_code_backup(suggestion)
                
                # Apply the optimization
                if auto_apply:
                    success = apply_code_changes(suggestion)
                    if success:
                        suggestion.status = 'applied'
                        suggestion.applied_at = timezone.now()
                    else:
                        suggestion.status = 'rejected'
                else:
                    # Manual application - just mark as ready for review
                    suggestion.status = 'testing'
                
                suggestion.save()
                
                results.append({
                    'suggestion_id': str(suggestion.suggestion_id),
                    'status': suggestion.status,
                    'type': suggestion.type,
                    'applied': suggestion.status == 'applied'
                })
                
            except Exception as e:
                suggestion.status = 'rejected'
                suggestion.save()
                
                results.append({
                    'suggestion_id': str(suggestion.suggestion_id),
                    'status': 'failed',
                    'error': str(e)
                })
        
        return {
            'total_suggestions': len(suggestion_ids),
            'successful_applications': len([r for r in results if r.get('applied', False)]),
            'results': results
        }
        
    except Exception as e:
        raise self.retry(exc=e, countdown=60, max_retries=3)


def analyze_code_bottlenecks(source_code, framework_version):
    """
    Analyze source code for performance bottlenecks
    This is a simplified rule-based analyzer - will be replaced with AI models
    """
    bottlenecks = []
    
    # Check for common React performance issues
    if 'useEffect' in source_code and 'dependencies' not in source_code:
        bottlenecks.append({
            'type': 'missing_dependencies',
            'severity': 'medium',
            'description': 'useEffect hook missing dependency array',
            'line_number': source_code.find('useEffect'),
            'suggestion': 'Add dependency array to useEffect'
        })
    
    if source_code.count('useState') > 5:
        bottlenecks.append({
            'type': 'excessive_state',
            'severity': 'medium',
            'description': 'Component has too many useState hooks',
            'suggestion': 'Consider using useReducer or state management library'
        })
    
    if 'map(' in source_code and 'key=' not in source_code:
        bottlenecks.append({
            'type': 'missing_keys',
            'severity': 'high',
            'description': 'Missing keys in list rendering',
            'suggestion': 'Add unique keys to list items'
        })
    
    # Check for inline functions in JSX
    if '.bind(' in source_code or '=>' in source_code:
        bottlenecks.append({
            'type': 'inline_functions',
            'severity': 'low',
            'description': 'Inline functions in render may cause unnecessary re-renders',
            'suggestion': 'Move functions outside render or use useCallback'
        })
    
    return bottlenecks


def generate_optimization_suggestions(source_code, bottlenecks, framework_version):
    """
    Generate optimization suggestions based on bottlenecks
    """
    suggestions = []
    
    for bottleneck in bottlenecks:
        if bottleneck['type'] == 'missing_dependencies':
            suggestions.append({
                'type': 'callback',
                'description': 'Add proper dependency array to useEffect hook',
                'code_changes': {
                    'type': 'add_dependencies',
                    'target': 'useEffect'
                },
                'impact_estimate': {
                    'performance_gain': 15,
                    'implementation_effort': 'low'
                },
                'priority': 2
            })
        
        elif bottleneck['type'] == 'excessive_state':
            suggestions.append({
                'type': 'state',
                'description': 'Refactor multiple useState hooks to useReducer',
                'code_changes': {
                    'type': 'refactor_state',
                    'from': 'useState',
                    'to': 'useReducer'
                },
                'impact_estimate': {
                    'performance_gain': 25,
                    'implementation_effort': 'medium'
                },
                'priority': 3
            })
        
        elif bottleneck['type'] == 'missing_keys':
            suggestions.append({
                'type': 'rendering',
                'description': 'Add unique keys to list items for better reconciliation',
                'code_changes': {
                    'type': 'add_keys',
                    'target': 'map_function'
                },
                'impact_estimate': {
                    'performance_gain': 30,
                    'implementation_effort': 'low'
                },
                'priority': 1
            })
        
        elif bottleneck['type'] == 'inline_functions':
            suggestions.append({
                'type': 'memo',
                'description': 'Use useCallback for inline functions to prevent re-renders',
                'code_changes': {
                    'type': 'wrap_callback',
                    'target': 'inline_functions'
                },
                'impact_estimate': {
                    'performance_gain': 20,
                    'implementation_effort': 'low'
                },
                'priority': 2
            })
    
    # Add general optimization suggestions
    if 'React.memo' not in source_code and len(source_code) > 1000:
        suggestions.append({
            'type': 'memo',
            'description': 'Wrap component with React.memo to prevent unnecessary re-renders',
            'code_changes': {
                'type': 'wrap_memo',
                'target': 'component'
            },
            'impact_estimate': {
                'performance_gain': 35,
                'implementation_effort': 'low'
            },
            'priority': 1
        })
    
    return suggestions


def calculate_confidence_score(bottlenecks, suggestions):
    """Calculate confidence score based on analysis results"""
    if not bottlenecks and not suggestions:
        return 0.5  # Neutral confidence when no issues found
    
    # Higher confidence with more specific bottlenecks found
    bottleneck_confidence = min(0.8, len(bottlenecks) * 0.2)
    
    # Higher confidence with actionable suggestions
    suggestion_confidence = min(0.9, len(suggestions) * 0.15)
    
    return min(0.95, (bottleneck_confidence + suggestion_confidence) / 2)


def calculate_performance_score(bottlenecks):
    """Calculate performance score based on bottlenecks"""
    base_score = 100
    
    for bottleneck in bottlenecks:
        severity = bottleneck.get('severity', 'low')
        if severity == 'high':
            base_score -= 20
        elif severity == 'medium':
            base_score -= 10
        else:
            base_score -= 5
    
    return max(0, base_score)


def extract_component_name(source_code):
    """Extract component name from source code"""
    # Simple regex to find component name
    import re
    
    # Look for function component
    match = re.search(r'function\s+(\w+)', source_code)
    if match:
        return match.group(1)
    
    # Look for arrow function component
    match = re.search(r'const\s+(\w+)\s*=', source_code)
    if match:
        return match.group(1)
    
    return 'UnknownComponent'


def extract_dependencies(source_code):
    """Extract component dependencies"""
    dependencies = []
    
    # Look for imports
    import re
    imports = re.findall(r'import.*from\s+[\'"]([^\'"]+)[\'"]', source_code)
    dependencies.extend(imports)
    
    return dependencies


def create_code_backup(suggestion):
    """Create backup of code before applying optimization"""
    # In a real implementation, this would create a git commit or file backup
    pass


def apply_code_changes(suggestion):
    """Apply code changes for optimization suggestion"""
    # In a real implementation, this would modify the actual source files
    # For now, just simulate success
    return True
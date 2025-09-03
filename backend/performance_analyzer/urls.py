from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'projects', views.ProjectViewSet, basename='project')
router.register(r'metrics', views.PerformanceMetricsViewSet, basename='metrics')
router.register(r'components', views.ComponentAnalysisViewSet, basename='components')
router.register(r'snapshots', views.PerformanceSnapshotViewSet, basename='snapshots')
router.register(r'alerts', views.PerformanceAlertViewSet, basename='alerts')
router.register(r'preferences', views.UserPreferencesViewSet, basename='preferences')

urlpatterns = [
    path('', include(router.urls)),
    # Authentication endpoints
    path('auth/login/', views.login_view, name='auth-login'),
    path('auth/register/', views.register_view, name='auth-register'),
]
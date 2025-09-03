from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'analysis', views.AIAnalysisViewSet, basename='ai-analysis')
router.register(r'suggestions', views.OptimizationSuggestionViewSet, basename='suggestions')

urlpatterns = [
    path('', include(router.urls)),
]
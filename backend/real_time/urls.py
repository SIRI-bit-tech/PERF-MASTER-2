from django.urls import path
from . import views

urlpatterns = [
    path('realtime/status/', views.realtime_status, name='realtime-status'),
    path('realtime/metrics/<uuid:project_id>/', views.get_realtime_metrics, name='realtime-metrics'),
    path('analytics/', views.get_analytics_realtime, name='analytics-realtime'),
]
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/performance/(?P<project_id>[^/]+)/$', consumers.PerformanceMonitorConsumer.as_asgi()),
    re_path(r'ws/team/(?P<project_id>[^/]+)/$', consumers.TeamCollaborationConsumer.as_asgi()),
]

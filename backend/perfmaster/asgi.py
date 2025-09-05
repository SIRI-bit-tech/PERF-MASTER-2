"""
ASGI config for perfmaster project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfmaster.settings')

# Initialize Django
django.setup()

# Import routing after Django is set up
import real_time.routing

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            real_time.routing.websocket_urlpatterns
        )
    ),
})
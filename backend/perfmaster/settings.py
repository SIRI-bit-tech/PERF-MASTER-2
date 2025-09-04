import os
from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta

# Add this import for DATABASE_URL parsing
import dj_database_url

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'your-secret-key-here')
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'channels',
    'drf_spectacular',
    'performance_analyzer',
    'perfmaster',
    'ai_engine',
    'real_time',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'perfmaster.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'perfmaster.wsgi.application'
ASGI_APPLICATION = 'perfmaster.asgi.application'

# Database Configuration
# Use PostgreSQL if DATABASE_URL is available, otherwise SQLite for local development
if os.getenv('DATABASE_URL'):
    # Use PostgreSQL from DATABASE_URL (Render, Heroku, etc.)
    DATABASES = {
        'default': dj_database_url.config(
            default='sqlite:///db.sqlite3',
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    # Use SQLite for local development
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Redis Configuration
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

# Channels - Use in-memory for WebSockets (no Redis dependency)
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}

# Celery Configuration
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True  # Fix deprecation warning

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# Spectacular settings
SPECTACULAR_SETTINGS = {
    'TITLE': 'PerfMaster API',
    'DESCRIPTION': 'AI-Powered Performance Analyzer API',
    'VERSION': '2.1.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# CORS settings - Updated to use environment variables
CORS_ALLOWED_ORIGINS = []
CORS_ALLOWED_ORIGIN_REGEXES = []

# Get CORS origins from environment variable
cors_origins = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000')
if cors_origins:
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_origins.split(',') if origin.strip()]



CORS_ALLOW_CREDENTIALS = True

# Additional CORS settings you might want to configure via environment variables
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# You can also make these configurable via environment variables
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# AI Configuration
HUGGINGFACE_API_TOKEN = os.getenv('HUGGINGFACE_API_TOKEN')
TENSORFLOW_MODEL_PATH = os.path.join(BASE_DIR, 'ai_models')

# Performance Analysis Settings
PERFORMANCE_ANALYSIS = {
    'MAX_COMPONENT_DEPTH': 10,
    'ANALYSIS_TIMEOUT': 30,
    'BATCH_SIZE': 100,
    'CACHE_TIMEOUT': 300,
}

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'perfmaster.log'),
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'perfmaster': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
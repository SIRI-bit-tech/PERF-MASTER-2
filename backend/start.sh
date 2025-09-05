#!/bin/bash

# Run migrations
python manage.py migrate --noinput

# Collect static files
python manage.py collectstatic --noinput --clear

# Start both Celery and Gunicorn with ASGI support
celery -A perfmaster worker --pool=solo --loglevel=info & 
gunicorn perfmaster.asgi:application -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:${PORT:-8000} --workers 3 --timeout 30
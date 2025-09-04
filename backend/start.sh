#!/bin/bash

# Run migrations
python manage.py migrate --noinput

# Collect static files
python manage.py collectstatic --noinput --clear

# Start both Celery and Gunicorn
celery -A perfmaster worker --pool=solo --loglevel=info & 
gunicorn --bind 0.0.0.0:${PORT:-8000} --workers 3 perfmaster.wsgi:application
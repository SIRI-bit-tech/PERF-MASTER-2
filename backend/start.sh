#!/bin/bash

# Run migrations
python manage.py migrate --noinput

# Collect static files
python manage.py collectstatic --noinput --clear

# Start both Celery and Daphne
celery -A perfmaster worker --pool=solo --loglevel=info & 
daphne -b 0.0.0.0 -p ${PORT:-8000} perfmaster.asgi:application
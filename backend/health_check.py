#!/usr/bin/env python
"""
Health check script for Render
"""
import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfmaster.settings')
django.setup()

from django.db import connection

def health_check():
    try:
        connection.ensure_connection()
        return True
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

if __name__ == '__main__':
    if health_check():
        print("OK")
        exit(0)
    else:
        exit(1)

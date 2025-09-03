#!/usr/bin/env python
"""
Daphne startup script for PerfMaster with proper Django initialization
"""
import os
import sys
import django
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfmaster.settings')

# Initialize Django BEFORE importing anything else
django.setup()

# Now import and run Daphne
from daphne.cli import CommandLineInterface

if __name__ == "__main__":
    cli = CommandLineInterface()
    cli.run(['perfmaster.asgi:application'] + sys.argv[1:])

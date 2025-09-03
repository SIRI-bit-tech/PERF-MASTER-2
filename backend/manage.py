#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfmaster.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    
    # Intercept runserver command to use Daphne
    if len(sys.argv) > 1 and sys.argv[1] == 'runserver':
        from daphne.cli import CommandLineInterface
        cli = CommandLineInterface()
        # Replace 'runserver' with Daphne arguments
        daphne_args = ['perfmaster.asgi:application']
        if len(sys.argv) > 2:
            # Handle port argument (e.g., :8000)
            if ':' in sys.argv[2]:
                host, port = sys.argv[2].split(':')
                daphne_args.extend(['-b', host, '-p', port])
            else:
                daphne_args.extend(['-p', sys.argv[2]])
        cli.run(daphne_args)
    else:
        execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
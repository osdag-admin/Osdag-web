import os

from django.core.exceptions import ImproperlyConfigured


def get_secret_key():
    key = os.environ.get('SECRET_KEY')
    if not key:
        raise ImproperlyConfigured(
            'SECRET_KEY environment variable is not set. '
            'Set it in your .env file or environment before starting the app.'
        )
    return key

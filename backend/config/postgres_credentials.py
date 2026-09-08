#########################################################
# Author : Atharva Pingale ( FOSSEE Summer Fellow '23 ) #
#########################################################

import os

from django.core.exceptions import ImproperlyConfigured


def get_username():
    return os.environ.get('DATABASE_USER', 'osdagdeveloper')

def get_password():
    password = os.environ.get('DATABASE_PASSWORD')
    if not password:
        raise ImproperlyConfigured(
            'DATABASE_PASSWORD environment variable is not set. '
            'Set it in your .env file or environment before starting the app.'
        )
    return password

def get_host():
    return os.environ.get('DATABASE_HOST', 'localhost')

def get_port():
    return os.environ.get('DATABASE_PORT', '5432')

def get_database_name():
    return os.environ.get('DATABASE_NAME', 'postgres_Intg_osdag')

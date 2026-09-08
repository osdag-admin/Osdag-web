import os

HOST = os.environ.get('SMTP_HOST', 'smtp-mail.outlook.com')
PORT = int(os.environ.get('SMTP_PORT', '587'))

FROM_EMAIL = os.environ.get('SMTP_FROM_EMAIL', '')
PASSWORD = os.environ.get('SMTP_PASSWORD', '')


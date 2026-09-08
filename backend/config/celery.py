import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("osdag_web")
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-discover tasks. Explicitly include the plate girder submodule so the
# Celery worker registers run_pso_optimization (nested submodule tasks are not
# picked up by the default app-level autodiscovery).
try:
    from django.conf import settings
    extra_modules = ["apps.modules.flexure_member.submodules.plate_girder"]
    app.autodiscover_tasks(lambda: list(settings.INSTALLED_APPS) + extra_modules)
except Exception:
    app.autodiscover_tasks()

import apps.core.signals  # noqa


@app.task(bind=True)
def debug_task(self):
    print(f"Request: {self.request!r}")

from django.apps import AppConfig


class OsdagConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.core'

    def ready(self):
        # Register signals
        import apps.core.signals  # noqa

        try:
            from osdag_core.design_type.main import Main
            from apps.core.main_registry import WebMainRegistry

            original_init = Main.__init__

            def patched_init(self, *args, **kwargs):
                original_init(self, *args, **kwargs)
                WebMainRegistry.record(self)

            Main.__init__ = patched_init
            print("[Osdag Config] Successfully patched osdag_core Main.__init__")
        except Exception as e:
            import traceback
            print(f"[Osdag Config] Failed to patch Main.__init__: {e}")
            traceback.print_exc()

from django.apps import AppConfig


class HckonnectConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "hckonnect"
    verbose_name = "HCKonnect"

    def ready(self):
        from hckonnect import admin_branding

        admin_branding.configure()

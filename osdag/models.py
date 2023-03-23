from django.db import models
class Design(models.Model):
    """Design Session object in Database."""
    cookie_id = models.CharField(unique=True, max_length=32)
    module_id = models.CharField(max_length=200)
    current_state = models.CharField(default="IV", max_length=2)
    input_values = models.TextField(blank=True)

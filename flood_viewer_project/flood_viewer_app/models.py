from django.db import models

# Here's where you'll add your model to store flood event locations.
# Refer to the Django documentation to learn how to define a model.
#
#   https://docs.djangoproject.com/en/3.1/topics/db/models/

class Event(models.Model):
    lat = models.FloatField(default=None)
    lng = models.FloatField(default=None)

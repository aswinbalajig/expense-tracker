from django.contrib import admin
from . import models
# Register your models here.
admin.site.register(models.CustomUser)
admin.site.register(models.Category)
admin.site.register(models.Record)
admin.site.register(models.groupmembers)
admin.site.register(models.group)
from django.contrib import admin
from .models import News
from .models import Press
from .models import InputURL

admin.site.register(News)
admin.site.register(Press)
admin.site.register(InputURL)


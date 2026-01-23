from django.contrib import admin

from .models import CommunityMembership,CommunityVacancy,Announcement

# Register your models here.
admin.site.register(CommunityMembership)
admin.site.register(CommunityVacancy)
admin.site.register(Announcement)
from django.contrib import admin

from .models import CommunityMembership,CommunityVacancy,VacancyApplication


# Register your models here.
admin.site.register(CommunityMembership)
admin.site.register(CommunityVacancy)
admin.site.register(VacancyApplication)

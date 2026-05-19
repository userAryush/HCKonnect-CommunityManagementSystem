"""Reusable ModelAdmin mixins: CSV export and owner-scoped querysets."""

import csv

from django.contrib import admin
from django.http import HttpResponse


class ExportCsvMixin:
    """Add ``export_selected_as_csv`` bulk action to any ModelAdmin."""

    @admin.action(description="Export selected rows as CSV")
    def export_selected_as_csv(self, request, queryset):
        meta = self.model._meta
        field_names = [f.name for f in meta.fields]

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = (
            f'attachment; filename="{meta.verbose_name_plural}.csv"'
        )
        writer = csv.writer(response)
        writer.writerow(field_names)
        for obj in queryset:
            writer.writerow([getattr(obj, field) for field in field_names])
        return response


class OwnerRestrictedAdminMixin:
    """
    Restrict list/change views to rows owned by the current staff user.

    Set ``owner_field`` to the FK attribute name (e.g. ``created_by``).
    Superusers still see everything.
    """

    owner_field = "created_by"

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        if not request.user.is_staff:
            return qs.none()
        return qs.filter(**{self.owner_field: request.user})

    def save_model(self, request, obj, form, change):
        if not change and hasattr(obj, self.owner_field):
            setattr(obj, self.owner_field, request.user)
        super().save_model(request, obj, form, change)

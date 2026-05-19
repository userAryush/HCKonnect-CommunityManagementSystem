"""Central Django admin branding for HCKonnect."""

from django.contrib import admin

SITE_HEADER = "HCKonnect Administration"
SITE_TITLE = "HCKonnect Admin"
INDEX_TITLE = "Herald Community Konnect — Control Panel"
TAGLINE = "Connect. Collaborate. Grow together at Herald College."


def configure():
    admin.site.site_header = SITE_HEADER
    admin.site.site_title = SITE_TITLE
    admin.site.index_title = INDEX_TITLE

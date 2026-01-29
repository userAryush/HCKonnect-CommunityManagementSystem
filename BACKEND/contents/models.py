from django.db import models
from django.conf import settings
from Base.models import BaseModel


# Create your models here.
class Announcement(BaseModel):
    title = models.CharField(max_length=255)
    description = models.TextField()
    image = models.ImageField(upload_to="announcements/", null=True, blank=True)
    VISIBILITY_CHOICES = [
        ("public", "Public"),
        ("private", "Private")
    ]
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default="public")

    # Community posting (community user)
    community = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="community_announcements",limit_choices_to={"role": "community"})

    # Nullable: student(representative) posting on behalf of community
    created_by_user = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True,related_name="user_announcements",limit_choices_to={"role": "student"})

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
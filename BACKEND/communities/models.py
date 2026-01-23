from django.db import models
from django.conf import settings
from Base.models import BaseModel


class CommunityMembership(BaseModel):
    ROLE_CHOICES = [("member", "Member"), ("moderator", "Moderator"), ("leader", "Leader")]
    STATUS_CHOICES = [("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected")]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, limit_choices_to={"role": "student"}, related_name="memberships")
    community = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, limit_choices_to={"role": "community"}, related_name="members")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="member")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")  # <-- new

    class Meta:
        unique_together = ("user", "community")

    def __str__(self):
        return f"{self.user.username} ({self.role})"
        
class CommunityVacancy(BaseModel):
    community = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,limit_choices_to={"role": "community"})

    title = models.CharField(max_length=255)
    description = models.TextField()

    role = models.CharField(max_length=20,choices=[("member", "Member")],default="member"
    )

    is_open = models.BooleanField(default=True)


    def __str__(self):
        return f"{self.title} - {self.community.community_name}"

        
class Announcement(BaseModel):
    title = models.CharField(max_length=255)
    description = models.TextField()
    image = models.ImageField(upload_to="announcements/", null=True, blank=True)
    VISIBILITY_CHOICES = [
        ("public", "Public"),
        ("all_members", "All Community Members"),
        ("community", "My Community Only"),
    ]
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default="public")

    # Community posting (community user)
    community = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="community_announcements",
        limit_choices_to={"role": "community"},
    )

    # Nullable: student posting on behalf of community
    created_by_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="user_announcements",
        limit_choices_to={"role": "student"},
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title



